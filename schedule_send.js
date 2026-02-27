// schedule_send.js
// Sends 24 emails (8 per account: Krishna, Ryan, Rik) with randomized timing
// throughout the day. Prints the full schedule before sending anything.

const nodemailer = require('nodemailer');
const { parse } = require('csv-parse/sync');
const fs = require('fs');
const crypto = require('crypto');

const SubjectEngine = require('./Engine/SubjectEngine');
const BodyEngine = require('./Engine/BodyEngine');

const subjectEngine = new SubjectEngine();
const bodyEngine = new BodyEngine();

// ─── CONFIG ──────────────────────────────────────────────────────────────────
const TRACKER_BASE_URL = 'https://email-tracker-contentelevators.vercel.app';
const SUPABASE_URL = 'https://psqebjafyjrtxarphkej.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBzcWViamFmeWpydHhhcnBoa2VqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE5MjY4NTEsImV4cCI6MjA4NzUwMjg1MX0.2A8zmceqZP3azTzTvviqA6O2gFSGSG5WbmYk60q86wY';
const LEADS_CSV = 'cleaned_leads.csv';
const STATE_FILE = 'email_state.json';

// Total batch config
const EMAILS_PER_ACCOUNT = 8;
const TOTAL_EMAILS = 24; // 3 accounts x 8

// ─── ACCOUNTS ─────────────────────────────────────────────────────────────────
const ACCOUNTS = [
    { name: 'Krishna', user: 'krishna@contentelevators.org', pass: 'hwvi jotl zpfn mspl', from: 'Krishna | Content Elevators <krishna@contentelevators.org>' },
    { name: 'Ryan', user: 'ryan@contentelevators.org', pass: 'dmnt ndpd izme pysd', from: 'Ryan | Content Elevators <ryan@contentelevators.org>' },
    { name: 'Rik', user: 'rik@contentelevators.org', pass: 'ycwt xsxq aegk ltak', from: 'Rik | Content Elevators <rik@contentelevators.org>' }
];

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const sleep = ms => new Promise(r => setTimeout(r, ms));

function generateEmailId() {
    return crypto.randomBytes(12).toString('hex');
}

function getFirstName(name) {
    if (!name) return 'there';
    const raw = name.trim().split(/[\s,–\-]+/)[0];
    return raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase();
}

function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function buildHtml(bodyText, pixelUrl, preview = '') {
    const htmlBody = bodyText.split('\n')
        .map(line => line.trim() === '' ? '<br>' : `<span>${escapeHtml(line)}</span><br>`)
        .join('\n');
    return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="font-family:Arial,sans-serif;font-size:14px;color:#333;line-height:1.6;max-width:600px;margin:0 auto;padding:20px;">
  <div style="display:none;max-height:0;overflow:hidden;">${preview}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;</div>
  ${htmlBody}
  <img src="${pixelUrl}" width="1" height="1" style="display:block;border:0;width:1px;height:1px;" alt="">
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
    } catch (e) {
        console.warn('  ⚠ Supabase log skipped:', e.message);
    }
}

// ─── GENERATE RANDOMIZED SCHEDULE ────────────────────────────────────────────
// Spreads 24 emails from NOW to ~22:00 local time with random intervals.
function generateSchedule(leads, startIndex) {
    const now = Date.now();
    const endOfDay = new Date();
    endOfDay.setHours(22, 0, 0, 0); // 10 PM today
    const windowMs = endOfDay.getTime() - now;

    // Generate 24 random timestamps within the window
    const times = [];
    for (let i = 0; i < TOTAL_EMAILS; i++) {
        // Guaranteed at least 3 min gap from now + some random spread
        times.push(now + Math.floor(Math.random() * windowMs));
    }
    times.sort((a, b) => a - b);

    // Enforce minimum 2-minute gap between consecutive sends
    for (let i = 1; i < times.length; i++) {
        const minGap = 2 * 60 * 1000; // 2 minutes minimum
        if (times[i] - times[i - 1] < minGap) {
            times[i] = times[i - 1] + minGap;
        }
    }

    // Build schedule: round-robin accounts (Krishna→Ryan→Rik→Krishna...)
    const schedule = [];
    for (let i = 0; i < TOTAL_EMAILS; i++) {
        const leadIdx = startIndex + i;
        const lead = leads[leadIdx];
        if (!lead) break;

        const rawEmail = (lead.Email || lead.email || '').trim();
        const email = rawEmail.replace(/[^a-zA-Z0-9@._+-].*$/, '').trim();
        if (!email || !email.includes('@')) continue;

        const account = ACCOUNTS[i % ACCOUNTS.length];
        const firstName = getFirstName(lead.Name || lead.name);
        const subjectObj = subjectEngine.generate(
            ['FOLLOWER_HOOK', 'FAMILY_HOOK', 'AUTHORITY_HOOK'][i % 3],
            { firstName, industry: 'Real Estate' }
        );

        schedule.push({
            leadIdx,
            sendAt: times[i],
            account,
            email,
            firstName,
            subjectObj,
            lead
        });
    }

    return schedule;
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
async function main() {
    console.log('📧 Content Elevators — Scheduled Email Blast (24 Emails)');
    console.log('═══════════════════════════════════════════════════════\n');

    // Load leads
    const leads = parse(fs.readFileSync(LEADS_CSV, 'utf8'), { columns: true, skip_empty_lines: true });
    console.log(`✅ Loaded ${leads.length} leads`);

    // Load state
    let state = { lastIndex: 65, dailySent: 0, accountIndex: 0, lastDate: new Date().toDateString() };
    if (fs.existsSync(STATE_FILE)) {
        state = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
    }
    // Reset daily counter if new day
    if (state.lastDate !== new Date().toDateString()) {
        state.dailySent = 0;
        state.lastDate = new Date().toDateString();
    }

    console.log(`📊 Starting from lead index: ${state.lastIndex}\n`);

    const schedule = generateSchedule(leads, state.lastIndex);

    if (schedule.length === 0) {
        console.log('❌ No valid leads found from current index.');
        return;
    }

    // ── PRINT SCHEDULE ──
    console.log('📅 SEND SCHEDULE (all times local):');
    console.log('─────────────────────────────────────────────────────────────────');
    schedule.forEach((item, i) => {
        const t = new Date(item.sendAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
        const delay = Math.round((item.sendAt - Date.now()) / 60000);
        console.log(`  [${String(i + 1).padStart(2, '0')}] ${t}  (+${delay}m)  ${item.account.name.padEnd(8)} → ${item.firstName.padEnd(12)} <${item.email}>`);
    });
    console.log('─────────────────────────────────────────────────────────────────');
    console.log(`\n🚀 Starting send loop. Press Ctrl+C at any time to stop gracefully.\n`);

    let stopped = false;
    process.on('SIGINT', () => { console.log('\n🛑 Stop requested. Will finish current email then halt.'); stopped = true; });

    let sentCount = 0;

    for (const item of schedule) {
        if (stopped) { console.log('🛑 Stopped by user.'); break; }

        // Wait until scheduled time
        const waitMs = item.sendAt - Date.now();
        if (waitMs > 0) {
            const mins = Math.ceil(waitMs / 60000);
            const t = new Date(item.sendAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
            console.log(`⏳  Waiting ${mins} min → sending to ${item.firstName} at ${t}...`);
            await sleep(waitMs);
        }

        if (stopped) break;

        const emailId = generateEmailId();
        const trackUrl = `${TRACKER_BASE_URL}/api/track?id=${emailId}`;
        const bodyText = bodyEngine.generate(item.subjectObj, {
            firstName: item.firstName,
            senderName: item.account.name,
            city: item.lead.City || item.lead.city || 'your area',
            industry: 'Real Estate'
        });
        const subject = item.subjectObj.subject.replace('{{FirstName}}', item.firstName).replace('{{Name}}', item.firstName).replace('{{first name}}', item.firstName).replace('{{name}}', item.firstName);
        const htmlBody = buildHtml(bodyText, trackUrl, item.subjectObj.preview || '');

        try {
            const transporter = createTransporter(item.account);
            await transporter.sendMail({
                from: item.account.from,
                to: item.email,
                subject,
                text: bodyText,
                html: htmlBody
            });

            await logEmailSent({
                emailId,
                recipient: item.email,
                subject,
                sender: item.account.user,
                subjectType: item.subjectObj.id
            });

            sentCount++;
            state.lastIndex = item.leadIdx + 1;
            state.dailySent = (state.dailySent || 0) + 1;
            state.accountIndex = (state.accountIndex || 0) + 1;
            fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));

            console.log(`  ✅ [${sentCount}/24] Sent → ${item.email}  via ${item.account.name}  — "${subject}"`);

        } catch (err) {
            console.error(`  ❌ Failed → ${item.email}: ${err.message}`);
            // Still advance index so we don't retry the same broken email
            state.lastIndex = item.leadIdx + 1;
            fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
        }
    }

    console.log(`\n✨ Done! Sent ${sentCount}/24 emails.`);
    console.log(`📈 Dashboard: ${TRACKER_BASE_URL}`);
}

main().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
