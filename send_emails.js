// send_emails.js - Cold Email Automation with Tracking
// Features: Multi-account rotation, tracking pixel, Supabase logging, warmup, subject variation

const nodemailer = require('nodemailer');
const { parse } = require('csv-parse/sync');
const fs = require('fs');
const crypto = require('crypto');

// Engine Imports
const SubjectEngine = require('./Engine/SubjectEngine');
const BodyEngine = require('./Engine/BodyEngine');

const subjectEngine = new SubjectEngine();
const bodyEngine = new BodyEngine();

// Parse Command Line Arguments
const args = process.argv.slice(2);
const CL_CATEGORY = args.find(a => a.startsWith('--category='))?.split('=')[1] || null;
const CL_SOURCE = args.find(a => a.startsWith('--source='))?.split('=')[1] || 'Direct';
const CL_LIMIT = args.find(a => a.startsWith('--limit='))?.split('=')[1];

// ─── CONFIG ──────────────────────────────────────────────────────────────────
const TRACKER_BASE_URL = 'https://email-tracker-contentelevators.vercel.app'; // Keep as backend for pixel
const DASHBOARD_URL = 'https://email-analytics-dashboard.vercel.app';
const SUPABASE_URL = 'https://psqebjafyjrtxarphkej.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBzcWViamFmeWpydHhhcnBoa2VqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE5MjY4NTEsImV4cCI6MjA4NzUwMjg1MX0.2A8zmceqZP3azTzTvviqA6O2gFSGSG5WbmYk60q86wY';

const LEADS_CSV = 'cleaned_leads.csv';
const STATE_FILE = 'email_state.json';

// ─── EMAIL ACCOUNTS ───────────────────────────────────────────────────────────
const ACCOUNTS = [
    {
        name: 'Krishna',
        user: 'krishna@contentelevators.org',
        pass: 'hwvi jotl zpfn mspl',
        from: 'Krishna | Content Elevators <krishna@contentelevators.org>'
    },
    {
        name: 'Ryan',
        user: 'ryan@contentelevators.org',
        pass: 'dmnt ndpd izme pysd',
        from: 'Ryan | Content Elevators <ryan@contentelevators.org>'
    },
    {
        name: 'Rik',
        user: 'rik@contentelevators.org',
        pass: 'ycwt xsxq aegk ltak',
        from: 'Rik | Content Elevators <rik@contentelevators.org>'
    }
];

const SUBJECT_CATEGORIES = [
    'ENGAGEMENT_HOOK',
    'FOLLOWER_HOOK',
    'INVENTORY_HOOK',
    'FAMILY_HOOK',
    'AUTHORITY_HOOK'
];

const BODY_CATEGORIES = [
    'ANSWERS_DRIVEN',
    'RESULT_DRIVEN',
    'VISUAL_IMAGERY',
    'APPOINTMENT_TYPE'
];

// ─── WARMUP SCHEDULE ──────────────────────────────────────────────────────────
function getDailyLimit(state) {
    const daysSinceStart = Math.floor((Date.now() - (state.startedAt || Date.now())) / 86400000);

    // Calculate base warmup limit
    let warmupLimit = 5;
    if (daysSinceStart < 1) warmupLimit = 5;
    else if (daysSinceStart <= 3) warmupLimit = 10;
    else if (daysSinceStart <= 5) warmupLimit = 20;
    else if (daysSinceStart <= 10) warmupLimit = 30;
    else warmupLimit = 35;

    if (CL_LIMIT) {
        const requestedLimit = parseInt(CL_LIMIT);
        // Always respect the lower of the two for safety, 
        // unless we want to allow user to override, but the user explicitly complained about the override.
        if (requestedLimit > warmupLimit) {
            console.warn(`  ⚠️  Warning: Requested limit (${requestedLimit}) exceeds warmup safety cap (${warmupLimit}). Adhering to safety cap.`);
            return warmupLimit;
        }
        return requestedLimit;
    }

    return warmupLimit;
}

// ─── STOP MECHANISM ──────────────────────────────────────────────────────────
let isStopping = false;
process.on('SIGINT', () => {
    console.log('\n🛑 Stop signal received. Gracefully stopping after current task...');
    isStopping = true;
});


// ─── HELPERS ─────────────────────────────────────────────────────────────────
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function randomDelay(minMs = 2000, maxMs = 5000) {
    return sleep(Math.floor(Math.random() * (maxMs - minMs) + minMs));
}

function generateEmailId() {
    return crypto.randomBytes(12).toString('hex');
}

function getFirstName(fullName) {
    if (!fullName) return 'there';
    const cleaned = fullName.trim().split(' ')[0];
    return cleaned.charAt(0).toUpperCase() + cleaned.slice(1).toLowerCase();
}

function pickSubject(firstName, industry) {
    const category = SUBJECT_CATEGORIES[Math.floor(Math.random() * SUBJECT_CATEGORIES.length)];
    return subjectEngine.generate(category, { firstName, industry });
}

function pickBody(firstName, senderFirstName, city, industry, subjectObj) {
    return bodyEngine.generate(subjectObj, { firstName, senderName: senderFirstName, city, industry });
}

function buildHtmlEmail(bodyText, trackingPixelUrl, preheaderText = "") {
    // Convert plain text to basic HTML with tracking pixel
    const htmlBody = bodyText
        .split('\n')
        .map(line => line.trim() === '' ? '<br>' : `<span>${escapeHtml(line)}</span><br>`)
        .join('\n');

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; font-size: 14px; color: #333; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 20px;">
  <!-- Hidden Preheader for Preview Line -->
  <div style="display: none; max-height: 0px; overflow: hidden;">
    ${preheaderText} &nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;
  </div>
  ${htmlBody}
  <img src="${trackingPixelUrl}" width="1" height="1" style="display:block;border:0;width:1px;height:1px;" alt="">
</body>
</html>`;
}

function escapeHtml(str) {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

// ─── SUPABASE LOG ─────────────────────────────────────────────────────────────
async function logEmailSent(data) {
    const { emailId, recipient, subject, sender, category, subjectType, bodyType, source, campaignName, step } = data;
    try {
        const payload = {
            email_id: emailId,
            recipient: recipient.toLowerCase(),
            subject,
            sender,
            category: category || 'General',
            subject_type: subjectType,
            body_type: bodyType || 'CASHVERTISING',
            lead_source: source || 'Direct',
            campaign_name: campaignName || 'Beta Launch',
            step: step || 'p-sent',
            sent_at: new Date().toISOString()
        };

        const res = await fetch(`${SUPABASE_URL}/rest/v1/email_sent`, {
            method: 'POST',
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=minimal'
            },
            body: JSON.stringify(payload)
        });

        if (!res.ok) {
            const err = await res.text();
            console.error(`  ❌ Supabase log failed (${res.status}): ${err}`);
            // Check if key is expired or URL is wrong
        } else {
            // console.log(`  📊 Logged to Supabase: ${emailId}`);
        }
    } catch (e) {
        console.warn('  ⚠ Supabase log error:', e.message);
    }
}


// ─── STATE MANAGEMENT ────────────────────────────────────────────────────────
function loadState() {
    if (fs.existsSync(STATE_FILE)) {
        return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
    }
    return {
        lastIndex: 0,
        accountIndex: 0,
        startedAt: Date.now(),
        dailySent: 0,
        lastDate: new Date().toDateString()
    };
}

function saveState(state) {
    fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

// ─── TRANSPORTER ─────────────────────────────────────────────────────────────
function createTransporter(account) {
    return nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: { user: account.user, pass: account.pass },
        tls: { rejectUnauthorized: false }
    });
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
async function main() {
    console.log('📧 Cold Email Automation — Content Elevators');
    console.log('============================================\n');

    // Load leads
    if (!fs.existsSync(LEADS_CSV)) {
        console.error(`❌ ${LEADS_CSV} not found. Run clean_leads.js first.`);
        process.exit(1);
    }

    const csvContent = fs.readFileSync(LEADS_CSV, 'utf8');
    const leads = parse(csvContent, { columns: true, skip_empty_lines: true });
    console.log(`✅ Loaded ${leads.length} leads\n`);

    // Load state
    const state = loadState();

    // Reset daily counter if new day
    const today = new Date().toDateString();
    if (state.lastDate !== today) {
        state.dailySent = 0;
        state.lastDate = today;
        saveState(state);
    }

    const dailyLimit = getDailyLimit(state);
    const remaining = dailyLimit - state.dailySent;

    console.log(`📊 Status:`);
    console.log(`   Progress : ${state.lastIndex}/${leads.length} leads`);
    console.log(`   Today    : ${state.dailySent}/${dailyLimit} sent`);
    console.log(`   Remaining: ${remaining} for today\n`);

    if (remaining <= 0) {
        console.log('⏸  Daily limit reached. Come back tomorrow!');
        return;
    }

    if (state.lastIndex >= leads.length) {
        console.log('🎉 All leads have been emailed!');
        return;
    }

    let sentCount = 0;
    const toSend = Math.min(remaining, leads.length - state.lastIndex);

    console.log(`🚀 Sending ${toSend} emails...\n`);

    for (let i = 0; i < toSend; i++) {
        if (isStopping) {
            console.log('🛑 Process stopped by user.');
            break;
        }

        // Safety: Ensure accountIndex exists and is a number
        if (typeof state.accountIndex !== 'number') state.accountIndex = 0;

        const lead = leads[state.lastIndex];
        const account = ACCOUNTS[state.accountIndex % ACCOUNTS.length];

        if (!account) {
            console.error("❌ Critical: No email accounts configured correctly.");
            process.exit(1);
        }

        const firstName = getFirstName(lead.Name || lead.name || lead['First Name']);
        // Sanitize email: Remove spaces and invalid tailing characters like ] or )
        const rawEmail = (lead.Email || lead.email || '').trim();
        const email = rawEmail.replace(/[^a-zA-Z0-9@._+-].*$/, '').trim();

        if (!email || !email.includes('@')) {
            console.log(`  [${state.lastIndex + 1}] Skipping — no valid email for ${lead.Name}`);
            state.lastIndex++;
            saveState(state);
            continue;
        }

        // --- NEW: DUPLICATE CHECK AGAINST CSV ---
        const trackedContent = fs.readFileSync('leads_tracked.csv', 'utf8');
        const trackedLeads = parse(trackedContent, { columns: true, skip_empty_lines: true });
        const alreadyTracked = trackedLeads.find(l => l.Email?.trim() === email.trim() && l['p-sent']);

        if (alreadyTracked) {
            console.log(`  [${state.lastIndex + 1}] Skipping — ${email} already marked as sent in leads_tracked.csv (${alreadyTracked['p-sent']})`);
            state.lastIndex++;
            saveState(state);
            continue;
        }
        // ----------------------------------------

        const emailId = generateEmailId();
        const trackingUrl = `${TRACKER_BASE_URL}/api/track?id=${emailId}`;

        const industry = lead.Industry || lead.industry || 'Real Estate';
        const city = lead.City || lead.city || 'your area';

        const subjectObj = pickSubject(firstName, industry);
        const subject = subjectObj.subject;
        const preview = subjectObj.preview;

        const bodyText = pickBody(firstName, account.name, city, industry, subjectObj);
        const htmlBody = buildHtmlEmail(bodyText, trackingUrl, preview);

        try {
            const transporter = createTransporter(account);
            await transporter.sendMail({
                from: account.from,
                to: email,
                subject,
                text: bodyText,    // plain text fallback
                html: htmlBody     // HTML with tracking pixel
            });

            // Log to Supabase
            await logEmailSent({
                emailId,
                recipient: email,
                subject,
                sender: account.user,
                category: CL_CATEGORY || industry,
                subjectType: subjectObj.id,
                bodyType: bodyText.includes('Conversion Killer') ? 'INTRIGUE' : 'STANDARD',
                source: CL_SOURCE
            });

            console.log(`  ✅ [${state.lastIndex + 1}] Sent to ${email} via ${account.name} — "${subject}"`);

            state.lastIndex++;
            state.accountIndex++;
            state.dailySent++;
            sentCount++;
            saveState(state);

            // Random delay between sends (2–5 seconds)
            if (i < toSend - 1) {
                await randomDelay(2000, 5000);
            }

        } catch (err) {
            console.error(`  ❌ [${state.lastIndex + 1}] Failed to ${email}: ${err.message}`);
            state.lastIndex++;
            saveState(state);
        }
    }

    console.log(`\n✨ Done! Sent ${sentCount} emails today (${state.dailySent}/${dailyLimit} total).`);
    console.log(`📈 Dashboard: ${DASHBOARD_URL}`);
}

main().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
