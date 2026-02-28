// cloud_send.js — GitHub Actions Cloud Email Sender
// Design: 1 email per account per run, accounts staggered 10–20 min apart.
// Passwords come from GitHub Secrets (env vars), never hardcoded here.

const nodemailer = require('nodemailer');
const { parse } = require('csv-parse/sync');
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

const LEADS_CSV = 'cleaned_leads.csv';
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

async function logEmailSent({ emailId, recipient, subject, sender, subjectType }) {
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
                sent_at: new Date().toISOString()
            })
        });
        if (!res.ok) console.warn('  ⚠ Supabase log failed:', res.status, await res.text());
    } catch (e) {
        console.warn('  ⚠ Supabase error:', e.message);
    }
}

// ─── SEND ONE EMAIL ────────────────────────────────────────────────────────────
async function sendOne(account, lead, leadIdx, subjectTypeOverride) {
    const rawEmail = (lead.Email || lead.email || '').trim();
    const email = rawEmail.replace(/[^a-zA-Z0-9@._+-].*$/, '').trim();

    if (!email || !email.includes('@')) {
        console.log(`  [${leadIdx}] ⏭  Skipping — invalid email for ${lead.Name || 'unknown'}`);
        return false;
    }

    const firstName = getFirstName(lead.Name || lead.name);
    const subjectObj = subjectEngine.generate(subjectTypeOverride, { firstName, industry: 'Real Estate' });
    const subject = subjectObj.subject
        .replace(/{{FirstName}}/gi, firstName)
        .replace(/{{Name}}/gi, firstName)
        .replace(/{{first name}}/gi, firstName)
        .replace(/{{name}}/gi, firstName);

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
    await transporter.sendMail({
        from: account.from,
        to: email,
        subject,
        text: bodyText,
        html: htmlBody
    });

    await logEmailSent({
        emailId,
        recipient: email,
        subject,
        sender: account.user,
        subjectType: subjectObj.id
    });

    console.log(`  ✅  ${account.name} → ${firstName} <${email}>`);
    console.log(`       Subject: "${subject}"\n`);
    return true;
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
async function main() {
    console.log('☁️  Content Elevators — Cloud Email Sender');
    console.log(`🕐  Triggered: ${new Date().toISOString()}`);
    console.log('═══════════════════════════════════════════\n');

    // ── Validate secrets ──
    const missing = ACCOUNTS.filter(a => !a.pass).map(a => a.name);
    if (missing.length) {
        console.error(`❌ Missing GitHub Secrets for: ${missing.join(', ')}`);
        console.error('   Repo → Settings → Secrets → Actions → Add the missing ones.');
        process.exit(1);
    }

    // ── Load leads ──
    if (!fs.existsSync(LEADS_CSV)) {
        console.error(`❌ ${LEADS_CSV} not found in repo.`);
        process.exit(1);
    }
    const leads = parse(fs.readFileSync(LEADS_CSV, 'utf8'), { columns: true, skip_empty_lines: true });
    console.log(`✅  Loaded ${leads.length} leads`);

    // ── Load state from Supabase — Falling back to local file if DB fails ──
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

    let localState = { lastIndex: 68, dailySent: 0, accountIndex: 0, lastDate: '', startedAt: Date.now() };
    if (fs.existsSync(STATE_FILE)) {
        try { localState = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8')); } catch (e) { }
    }

    // Determine the true index (DB priority, but fallback to local if DB is fresh)
    const dbState = await getDbState();
    let state = { ...localState };
    if (dbState && dbState.lastIndex > state.lastIndex) {
        console.log(`📡  Sync: DB index (${dbState.lastIndex}) is ahead of local (${state.lastIndex}). Using DB.`);
        state.lastIndex = dbState.lastIndex;
    } else {
        console.log(`📡  Sync: Local index (${state.lastIndex}) is current.`);
    }

    const todayUTC = new Date().toDateString();
    if (state.lastDate !== todayUTC) {
        state.dailySent = 0;
        state.lastDate = todayUTC;
    }

    if (state.lastIndex >= leads.length) {
        console.log('\n🎉 All leads have been emailed! Nothing to do.');
        return;
    }

    console.log(`📊  Progress: ${state.lastIndex}/${leads.length} leads reached so far`);
    console.log(`📊  Today:    ${state.dailySent} sent today\n`);

    // ── Random initial sleep (0–25 min) so trigger time ≠ send time ──
    const initialSleepMin = randBetween(0, 25);
    if (initialSleepMin > 0 && !process.env.DEBUG) {
        const actualTime = new Date(Date.now() + initialSleepMin * 60000).toISOString();
        console.log(`😴  Sleeping ${initialSleepMin} min before first send...`);
        console.log(`    First email will fire at ~${actualTime}\n`);
        await sleep(initialSleepMin * 60 * 1000);
    }

    // ── Send 1 email per account, staggered ──────────────────────────────────
    // Krishna → wait 10–20 min → Ryan → wait 10–20 min → Rik
    // This means 3 emails from the same "session" are 10–20 minutes apart,
    // never simultaneous, and from completely different email addresses.
    let totalSent = 0;

    for (let a = 0; a < ACCOUNTS.length; a++) {
        const account = ACCOUNTS[a];

        // Find the next valid lead for this account
        let leadIdx = state.lastIndex;
        while (leadIdx < leads.length) {
            const rawEmail = (leads[leadIdx].Email || leads[leadIdx].email || '').trim();
            const email = rawEmail.replace(/[^a-zA-Z0-9@._+-].*$/, '').trim();
            if (email && email.includes('@')) break;
            console.log(`  ⏭  Skipping invalid email at index ${leadIdx}`);
            leadIdx++;
        }

        if (leadIdx >= leads.length) { break; }

        const subjectType = SUBJECT_TYPES[(state.accountIndex || 0) % SUBJECT_TYPES.length];

        try {
            const sent = await sendOne(account, leads[leadIdx], leadIdx, subjectType);
            if (sent) {
                state.lastIndex = leadIdx + 1;
                state.dailySent = (state.dailySent || 0) + 1;
                state.accountIndex = (state.accountIndex || 0) + 1;
                totalSent++;

                // CRITICAL: Update DB immediately so next run knows we moved on
                await updateDbState(state.lastIndex);

                // Still try to update local file for redundancy (and local testing)
                try { fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2)); } catch (e) { }
            }
        } catch (err) {
            console.error(`  ❌  ${account.name} send failed: ${err.message}`);
            // Don't advance index on hard error so we can retry
        }

        // Between accounts: wait 10–20 minutes (skip after last account)
        if (a < ACCOUNTS.length - 1 && totalSent > 0) {
            const gapMin = randBetween(10, 20);
            console.log(`⏳  Waiting ${gapMin} min before next account sends...\n`);
            await sleep(gapMin * 60 * 1000);
        }
    }

    console.log(`\n✨  Run complete. Sent ${totalSent}/3 emails this session.`);
    console.log(`📊  Total progress: ${state.lastIndex}/${leads.length} leads.`);
    console.log(`📈  Dashboard: ${TRACKER_BASE_URL}`);
}

main().catch(err => {
    console.error('Fatal error:', err.message);
    process.exit(1);
});
