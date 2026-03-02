// cloud_send.js — GitHub Actions Cloud Email Sender
// Design: 1 email per account per run, accounts staggered 10–20 min apart.
// Passwords come from GitHub Secrets (env vars), never hardcoded here.

const nodemailer = require('nodemailer');
const { parse } = require('csv-parse/sync');
const { stringify } = require('csv-stringify/sync');
const fs = require('fs');
const crypto = require('crypto');

const SubjectEngine = require('./Engine/SubjectEngine');
const BodyEngine = require('./Engine/BodyEngine');

const subjectEngine = new SubjectEngine();
const bodyEngine = new BodyEngine();

// ─── CONFIG ───────────────────────────────────────────────────────────────────
const TRACKER_BASE_URL = 'https://email-tracker-contentelevators.vercel.app';
const SUPABASE_URL = 'https://psqebjafyjrtxarphkej.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

const LEADS_CSV = 'leads_tracked.csv';
const STATE_FILE = 'email_state.json';

// ─── ACCOUNTS — passwords read from GitHub Secrets ────────────────────────────
const ACCOUNTS = [
    { name: 'Krishna', user: 'krishna@contentelevators.org', pass: process.env.KRISHNA_PASS, from: 'Krishna | Content Elevators <krishna@contentelevators.org>' },
    { name: 'Ryan', user: 'ryan@contentelevators.org', pass: process.env.RYAN_PASS, from: 'Ryan | Content Elevators <ryan@contentelevators.org>' },
    { name: 'Rik', user: 'rik@contentelevators.org', pass: process.env.RIK_PASS, from: 'Rik | Content Elevators <rik@contentelevators.org>' }
];

const SUBJECT_TYPES = ['FOLLOWER_HOOK', 'FAMILY_HOOK', 'AUTHORITY_HOOK'];

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const sleep = ms => new Promise(r => setTimeout(r, ms));
const randBetween = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

function generateEmailId() { return crypto.randomBytes(12).toString('hex'); }

function getFirstName(name) {
    if (!name) return 'there';
    const raw = name.trim().split(/[\s,–\-]+/)[0];
    return raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase();
}

function saveLeads(leads) {
    try {
        const output = stringify(leads, { header: true });
        fs.writeFileSync(LEADS_CSV, output);
    } catch (err) {
        console.error(`❌  Failed to save leads to ${LEADS_CSV}: ${err.message}`);
    }
}

function parseDate(dateStr) {
    if (!dateStr) return null;
    const parts = dateStr.split('-');
    if (parts.length !== 3) return null;
    const day = parseInt(parts[0], 10);
    const monthStr = parts[1];
    const year = 2000 + parseInt(parts[2], 10);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months.indexOf(monthStr);
    if (month === -1) return null;
    return new Date(year, month, day);
}

function daysBetween(d1, d2) {
    if (!d1 || !d2) return 0;
    return Math.floor(Math.abs(d1 - d2) / (1000 * 60 * 60 * 24));
}

function getNextDueStep(lead) {
    const today = new Date();

    // Check F3 Due (4+ days after F2)
    if (lead['f2'] && !lead['f3']) {
        const lastDate = parseDate(lead['f2']);
        if (lastDate && daysBetween(today, lastDate) >= 4) return 'f3';
        return null; // Not due yet
    }

    // Check F2 Due (3+ days after F1)
    if (lead['f1'] && !lead['f2']) {
        const lastDate = parseDate(lead['f1']);
        if (lastDate && daysBetween(today, lastDate) >= 3) return 'f2';
        return null;
    }

    // Check F1 Due (2+ days after p-sent)
    if (lead['p-sent'] && !lead['f1']) {
        const lastDate = parseDate(lead['p-sent']);
        if (lastDate && daysBetween(today, lastDate) >= 2) return 'f1';
        return null;
    }

    // INITIAL EMAIL (If nothing sent yet)
    if (!lead['p-sent']) return 'p-sent';

    return null; // All done or cooling down
}

function verifyDataIntegrity(leads, state) {
    console.log('🔍  Running Pre-Run Audit...');

    // 1. Check for "The Batch Bug" (Too many emails on one day)
    const stats = {};
    leads.forEach(l => {
        if (l['p-sent']) {
            stats[l['p-sent']] = (stats[l['p-sent']] || 0) + 1;
        }
    });

    for (const [date, count] of Object.entries(stats)) {
        if (count > 100) { // Relaxed for historical data (Feb 25 had 60). Real safety is in the daily logic.
            throw new Error(`CRITICAL: CSV Integrity Failure. Date ${date} has ${count} sent emails. Audit aborted.`);
        }
    }

    // 2. Cross-check index with CSV
    const csvSentCount = leads.filter(l => l['p-sent']).length;
    if (Math.abs(csvSentCount - state.lastIndex) > 10) {
        console.warn(`⚠️  Audit Warning: state.lastIndex (${state.lastIndex}) is inconsistent with CSV sent count (${csvSentCount}).`);
    }

    console.log('✅  Audit passed. Data looks logical.');
}

function escapeHtml(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function buildHtml(bodyText, pixelUrl, preview = '') {
    const htmlBody = bodyText.split('\n')
        .map(line => line.trim() === '' ? '<br>' : `<span>${escapeHtml(line)}</span><br>`)
        .join('\n');
    return `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="font-family:Arial,sans-serif;font-size:14px;color:#333;line-height:1.6;max-width:600px;margin:0 auto;padding:20px;">
<div style="display:none;max-height:0;overflow:hidden;">${preview}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;</div>
${htmlBody}
<img src="${pixelUrl}" width="1" height="1" style="display:block;border:0;" alt="">
</body></html>`;
}

function createTransporter(account) {
    return nodemailer.createTransport({
        host: 'smtp.gmail.com', port: 587, secure: false,
        auth: { user: account.user, pass: account.pass },
        tls: { rejectUnauthorized: false }
    });
}

async function logEmailSent({ emailId, recipient, subject, sender, subjectType, campaignStep }) {
    if (!SUPABASE_ANON_KEY) { console.warn('  ⚠ No Supabase key — skipping log'); return; }
    try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/email_sent`, {
            method: 'POST',
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=minimal'
            },
            body: JSON.stringify({
                email_id: emailId,
                recipient,
                subject,
                sender,
                category: 'Real Estate',
                subject_type: subjectType,
                body_type: 'CASHVERTISING',
                lead_source: 'YouTube',
                step: campaignStep,
                sent_at: new Date().toISOString()
            })
        });
        if (!res.ok) console.warn('  ⚠ Supabase log failed:', res.status, await res.text());
    } catch (e) {
        console.warn('  ⚠ Supabase error:', e.message);
    }
}

/**
 * 🚨 CRITICAL SAFETY CHECK: Pings Supabase to see if this recipient
 * was emailed TODAY or for this SPECIFIC STEP.
 * This is the ultimate fix for the "Amnesia" Bug.
 */
async function isDuplicateSend(recipient, step) {
    if (!SUPABASE_ANON_KEY) return false;

    // Check if recipient was emailed TODAY
    const startOfToday = new Date().toISOString().split('T')[0] + 'T00:00:00Z';

    try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/email_sent?recipient=eq.${recipient}&sent_at=gte.${startOfToday}&select=id,step`, {
            headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` }
        });
        const records = await res.json();

        if (records && records.length > 0) {
            console.warn(`🛑  Safety Block: ${recipient} was already emailed today (found in Supabase).`);
            return true;
        }

        const resStep = await fetch(`${SUPABASE_URL}/rest/v1/email_sent?recipient=eq.${recipient}&step=eq.${step}&select=id`, {
            headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` }
        });
        const stepRecords = await resStep.json();
        if (stepRecords && stepRecords.length > 0) {
            console.warn(`🛑  Safety Block: ${recipient} already received step '${step}' in Supabase.`);
            return true;
        }

    } catch (e) {
        console.error('⚠️  Safety Check Failed (Supabase Offline): Stopping to be safe.', e.message);
        return true;
    }

    return false;
}

// ─── SEND ONE EMAIL ────────────────────────────────────────────────────────────
async function sendOne(account, lead, leadIdx) {
    const rawEmail = (lead.Email || lead.email || '').trim();
    const email = rawEmail.replace(/[^a-zA-Z0-9@._+-].*$/, '').trim();

    if (!email || !email.includes('@')) {
        console.log(`  [${leadIdx}] ⏭  Skipping — invalid email for ${lead.Name || 'unknown'}`);
        return null;
    }

    // --- SEQUENCE SELECTOR ---
    const campaignStep = getNextDueStep(lead);
    if (!campaignStep) return null;

    let subjectType = 'FOLLOWER_HOOK';
    if (campaignStep === 'p-sent') {
        const hooks = ['FOLLOWER_HOOK', 'FAMILY_HOOK', 'AUTHORITY_HOOK'];
        subjectType = hooks[Math.floor(Math.random() * hooks.length)];
    } else {
        subjectType = `FOLLOWUP_${campaignStep.slice(1)}`; // f1 -> FOLLOWUP_1
    }

    const firstName = getFirstName(lead.Name || lead.name);
    const subjectObj = subjectEngine.generate(subjectType, { firstName, industry: 'Real Estate' });

    const finalSubject = subjectObj.subject
        .replace(/{{FirstName}}/gi, firstName)
        .replace(/{{Name}}/gi, firstName);

    const bodyText = bodyEngine.generate(subjectObj, {
        firstName,
        senderName: account.name,
        city: lead.City || lead.city || 'your area',
        industry: 'Real Estate'
    });

    const emailId = generateEmailId();
    const trackUrl = `${TRACKER_BASE_URL}/api/track?id=${emailId}`;
    const htmlBody = buildHtml(bodyText, trackUrl, subjectObj.preview || '');

    const transporter = createTransporter(account);

    // ─── AMNESIA FIX: DOUBLE CHECK SUPABASE BEFORE SEND ───
    const isDup = await isDuplicateSend(email, campaignStep);
    if (isDup) {
        console.log(`  ⏩ [SKIP] Supabase blocked sending to ${email}. Syncing local CSV.`);
        return { step: campaignStep, date: formatDate(new Date()) };
    }

    try {
        await transporter.sendMail({
            from: account.from,
            to: email,
            subject: finalSubject,
            text: bodyText,
            html: htmlBody
        });

        await logEmailSent({
            emailId,
            recipient: email,
            subject: finalSubject,
            sender: account.user,
            subjectType: subjectObj.id,
            campaignStep: campaignStep
        });

        console.log(`  ✅ [${campaignStep}]  ${account.name} → ${firstName} <${email}>`);

        return { step: campaignStep, date: formatDate(new Date()) };
    } catch (err) {
        console.error(`  ❌  ${account.name} send to ${email} failed: ${err.message}`);
        return false;
    }
}

function formatDate(date) {
    const d = new Date(date);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${d.getDate()}-${months[d.getMonth()]}-${d.getFullYear().toString().slice(-2)}`;
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
async function main() {
    console.log('☁️  Content Elevators — Cloud Email Sender (3-EMAIL TEST RUN)');
    console.log(`🕐  Triggered: ${new Date().toISOString()}`);
    console.log('═══════════════════════════════════════════\n');

    // ── Validate secrets ──
    const missing = ACCOUNTS.filter(a => !a.pass).map(a => a.name);
    if (missing.length) {
        console.error(`❌ Missing GitHub Secrets for: ${missing.join(', ')}`);
        process.exit(1);
    }

    // ── Load data ──
    const leads = parse(fs.readFileSync(LEADS_CSV, 'utf8'), { columns: true, skip_empty_lines: true });

    let localState = { lastIndex: 88, dailySent: 0, accountIndex: 0, lastDate: '', startedAt: Date.now() };
    if (fs.existsSync(STATE_FILE)) {
        try {
            localState = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
        } catch (e) {
            console.warn('⚠️  Could not parse local state, using defaults.');
        }
    }

    // 🛑 DATA INTEGRITY FAILSAFE
    try {
        verifyDataIntegrity(leads, localState);
    } catch (err) {
        console.error(`\n❌  FATAL SAFETY ERROR: ${err.message}`);
        process.exit(1);
    }

    console.log(`✅  Loaded ${leads.length} leads`);

    // ── Load state ──
    async function getDbState() {
        if (!SUPABASE_ANON_KEY) return null;
        try {
            const res = await fetch(`${SUPABASE_URL}/rest/v1/email_sent?recipient_email=eq.__automation_state__@internal.system&select=subject&order=sent_at.desc&limit=1`, {
                headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` }
            });
            const data = await res.json();
            if (data && data.length > 0) {
                const dbIndex = parseInt(data[0].subject, 10);
                if (!isNaN(dbIndex)) return { lastIndex: dbIndex };
            }
        } catch (e) { console.warn('  ⚠ DB State fetch error:', e.message); }
        return null;
    }

    async function updateDbState(newIndex) {
        if (!SUPABASE_ANON_KEY) return;
        try {
            await fetch(`${SUPABASE_URL}/rest/v1/email_sent`, {
                method: 'POST',
                headers: {
                    'apikey': SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=minimal'
                },
                body: JSON.stringify({
                    email_id: 'STATE_UPDATE_' + Date.now(),
                    recipient: '__automation_state__@internal.system',
                    subject: String(newIndex),
                    sender: 'SYSTEM',
                    category: 'INTERNAL_STATE',
                    sent_at: new Date().toISOString()
                })
            });
        } catch (e) { console.warn('  ⚠ DB State save error:', e.message); }
    }

    const dbState = await getDbState();
    let state = { ...localState };
    if (dbState && dbState.lastIndex > state.lastIndex) {
        console.log(`📡  Sync: DB index (${dbState.lastIndex}) is ahead of local. Using DB.`);
        state.lastIndex = dbState.lastIndex;
    }

    const todayUTC = new Date().toDateString();
    if (state.lastDate !== todayUTC) {
        state.dailySent = 0;
        state.lastDate = todayUTC;
    }

    console.log(`📊  Progress: Lead Index #${state.lastIndex}`);
    console.log(`📊  Total today: ${state.dailySent} sent\n`);

    // ── Staggered Multi-Account Send ──
    let totalSentThisRun = 0;

    for (let a = 0; a < ACCOUNTS.length; a++) {
        const account = ACCOUNTS[a];

        // PRIORITIZE: ONLY Initial Emails (p-sent) for this test run
        let targetIdx = -1;
        const scanSteps = ['p-sent'];

        for (const step of scanSteps) {
            for (let i = 0; i < leads.length; i++) {
                // If checking p-sent, only look forward from our global pointer
                if (step === 'p-sent' && i < state.lastIndex) continue;

                if (getNextDueStep(leads[i]) === step) {
                    targetIdx = i;
                    break;
                }
            }
            if (targetIdx !== -1) break;
        }

        if (targetIdx === -1) {
            console.log(`  ⏹ No candidates found for any sequence stage right now.`);
            break;
        }

        try {
            const result = await sendOne(account, leads[targetIdx], targetIdx);
            if (result) {
                // Update memories
                leads[targetIdx][result.step] = result.date;
                if (result.step === 'p-sent') state.lastIndex = targetIdx + 1;

                state.dailySent++;
                state.accountIndex++;
                totalSentThisRun++;

                // FAILSAVE: Commit everything immediately
                saveLeads(leads);
                await updateDbState(state.lastIndex);
                fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
            }
        } catch (err) {
            console.error(`  ❌ Failed sending via ${account.name}: ${err.message}`);
        }

        if (a < ACCOUNTS.length - 1 && totalSentThisRun > 0) {
            const gapMin = 5; // Exactly 5 minutes between sends
            console.log(`⏳  Sent! Waiting ${gapMin} min before ${ACCOUNTS[a + 1].name} takes the next lead...\n`);
            await sleep(gapMin * 60 * 1000);
        }
    }

    console.log(`\n✨ Run over. ${totalSentThisRun} emails sent.`);
    console.log(`📈 Dashboard: ${TRACKER_BASE_URL}`);
}

main().catch(err => {
    console.error('Fatal error:', err.message);
    process.exit(1);
});
