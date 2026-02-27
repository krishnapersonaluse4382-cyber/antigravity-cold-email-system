// cloud_send.js — GitHub Actions Cloud Email Sender
// Reads passwords from environment variables (GitHub Secrets).
// Sends 1 email per account (3 total) per run with a random sleep
// so actual send times look organic regardless of fixed trigger time.

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
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

const LEADS_CSV = 'cleaned_leads.csv';
const STATE_FILE = 'email_state.json';

// ─── ACCOUNTS — passwords come from GitHub Secrets ───────────────────────────
const ACCOUNTS = [
    {
        name: 'Krishna',
        user: 'krishna@contentelevators.org',
        pass: process.env.KRISHNA_PASS,
        from: 'Krishna | Content Elevators <krishna@contentelevators.org>'
    },
    {
        name: 'Ryan',
        user: 'ryan@contentelevators.org',
        pass: process.env.RYAN_PASS,
        from: 'Ryan | Content Elevators <ryan@contentelevators.org>'
    },
    {
        name: 'Rik',
        user: 'rik@contentelevators.org',
        pass: process.env.RIK_PASS,
        from: 'Rik | Content Elevators <rik@contentelevators.org>'
    }
];

// How many emails to send per account per GitHub Actions run
const PER_ACCOUNT = 1; // = 3 emails per trigger, 5 triggers/day = 15 emails/day

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
        .map(line => line.trim() === ''
            ? '<br>'
            : `<span>${escapeHtml(line)}</span><br>`)
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
        console.warn('  ⚠ Supabase log error:', e.message);
    }
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
async function main() {
    console.log('☁️  Content Elevators — Cloud Email Sender (GitHub Actions)');
    console.log(`🕐 Triggered at: ${new Date().toISOString()}`);
    console.log('═══════════════════════════════════════════════════════\n');

    // Validate secrets
    const missing = ACCOUNTS.filter(a => !a.pass).map(a => a.name);
    if (missing.length > 0) {
        console.error(`❌ Missing GitHub Secrets for: ${missing.join(', ')}`);
        console.error('   Go to repo → Settings → Secrets and add them.');
        process.exit(1);
    }

    // Load leads
    if (!fs.existsSync(LEADS_CSV)) {
        console.error(`❌ ${LEADS_CSV} not found in repo.`);
        process.exit(1);
    }
    const leads = parse(fs.readFileSync(LEADS_CSV, 'utf8'), { columns: true, skip_empty_lines: true });
    console.log(`✅ Loaded ${leads.length} leads\n`);

    // Load/init state
    let state = { lastIndex: 0, dailySent: 0, accountIndex: 0, lastDate: '', startedAt: Date.now() };
    if (fs.existsSync(STATE_FILE)) {
        state = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
    }

    // Reset daily counter if new day (UTC)
    const todayUTC = new Date().toUTCString().split(' ').slice(0, 4).join(' ');
    if (state.lastDate !== todayUTC) {
        state.dailySent = 0;
        state.lastDate = todayUTC;
    }

    if (state.lastIndex >= leads.length) {
        console.log('🎉 All leads have been emailed! No action taken.');
        return;
    }

    // ── RANDOM SLEEP (the key to organic timing) ──────────────────────────────
    // Sleep between 2 and 55 minutes so the actual send time is unpredictable
    const sleepMinutes = Math.floor(Math.random() * 53) + 2; // 2–55 min
    console.log(`😴 Random delay: sleeping ${sleepMinutes} minutes before sending...`);
    console.log(`   (Emails will actually fire at ~${new Date(Date.now() + sleepMinutes * 60000).toISOString()})\n`);
    await sleep(sleepMinutes * 60 * 1000);

    // ── SEND (1 per account = 3 emails per run) ───────────────────────────────
    const SUBJECT_TYPES = ['FOLLOWER_HOOK', 'FAMILY_HOOK', 'AUTHORITY_HOOK'];
    let sentCount = 0;

    for (let a = 0; a < ACCOUNTS.length; a++) {
        for (let p = 0; p < PER_ACCOUNT; p++) {
            const leadIdx = state.lastIndex;
            if (leadIdx >= leads.length) { console.log('🎉 All leads done.'); break; }

            const lead = leads[leadIdx];
            const account = ACCOUNTS[a];

            const rawEmail = (lead.Email || lead.email || '').trim();
            const email = rawEmail.replace(/[^a-zA-Z0-9@._+-].*$/, '').trim();

            if (!email || !email.includes('@')) {
                console.log(`  [${leadIdx}] Skipping invalid email for ${lead.Name}`);
                state.lastIndex++;
                continue;
            }

            const firstName = getFirstName(lead.Name || lead.name);
            const subjectObj = subjectEngine.generate(
                SUBJECT_TYPES[(state.accountIndex || 0) % SUBJECT_TYPES.length],
                { firstName, industry: 'Real Estate' }
            );
            const subject = subjectObj.subject
                .replace('{{FirstName}}', firstName)
                .replace('{{Name}}', firstName)
                .replace('{{first name}}', firstName)
                .replace('{{name}}', firstName);
            const bodyText = bodyEngine.generate(subjectObj, {
                firstName,
                senderName: account.name,
                city: lead.City || lead.city || 'your area',
                industry: 'Real Estate'
            });
            const emailId = generateEmailId();
            const trackUrl = `${TRACKER_BASE_URL}/api/track?id=${emailId}`;
            const htmlBody = buildHtml(bodyText, trackUrl, subjectObj.preview || '');

            try {
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

                sentCount++;
                state.lastIndex++;
                state.dailySent = (state.dailySent || 0) + 1;
                state.accountIndex = (state.accountIndex || 0) + 1;
                fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));

                console.log(`  ✅ [${sentCount}] ${account.name} → ${firstName} <${email}>`);
                console.log(`        Subject: "${subject}"`);

                // Small human-like pause between sends (5–15 seconds)
                if (!(a === ACCOUNTS.length - 1 && p === PER_ACCOUNT - 1)) {
                    const pauseSec = Math.floor(Math.random() * 10) + 5;
                    await sleep(pauseSec * 1000);
                }

            } catch (err) {
                console.error(`  ❌ Failed → ${email}: ${err.message}`);
                state.lastIndex++;
                fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
            }
        }
    }

    console.log(`\n✨ Done! Sent ${sentCount} emails this run.`);
    console.log(`📊 Total progress: ${state.lastIndex}/${leads.length} leads`);
    console.log(`📈 Dashboard: ${TRACKER_BASE_URL}`);
}

main().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
