// test_send.js - Sends ONE test email to yourself with tracking pixel + Supabase logging
const nodemailer = require('nodemailer');
const crypto = require('crypto');

const TRACKER_BASE_URL = 'https://email-tracker-contentelevators.vercel.app';
const SUPABASE_URL = 'https://psqebjafyjrtxarphkej.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBzcWViamFmeWpydHhhcnBoa2VqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE5MjY4NTEsImV4cCI6MjA4NzUwMjg1MX0.2A8zmceqZP3azTzTvviqA6O2gFSGSG5WbmYk60q86wY';
const TEST_RECIPIENT = 'krishnapersonaluse438@gmail.com';

const account = {
    user: 'krishna@contentelevators.org',
    pass: 'hwvi jotl zpfn mspl',
    from: 'Krishna | Content Elevators <krishna@contentelevators.org>'
};

const emailId = 'TEST-' + crypto.randomBytes(6).toString('hex');
const trackingUrl = `${TRACKER_BASE_URL}/api/track?id=${emailId}`;

const html = `<!DOCTYPE html>
<html>
<body style="font-family:Arial;font-size:14px;color:#333;line-height:1.6;max-width:600px;margin:0 auto;padding:20px;">
  <p>Hey Krishna,</p>
  <p>This is a <strong>test email</strong> from the Cold Email Automation system.</p>
  <p>If you're reading this in Gmail, the tracking pixel below should fire and log an "open" in Supabase.</p>
  <p>Tracking ID: <code>${emailId}</code></p>
  <p>Dashboard: <a href="${TRACKER_BASE_URL}">${TRACKER_BASE_URL}</a></p>
  <p>— Content Elevators System</p>
  <img src="${trackingUrl}" width="1" height="1" style="display:block;border:0;width:1px;height:1px;" alt="">
</body>
</html>`;

async function logToSupabase() {
    console.log('   Logging send to Supabase...');
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
            recipient: TEST_RECIPIENT,
            subject: '🧪 Test — Tracking Pixel Verification',
            sender: account.user
        })
    });

    if (res.ok) {
        console.log('   ✅ Logged to Supabase (email_sent table)');
    } else {
        const err = await res.text();
        console.log(`   ⚠ Supabase log failed (${res.status}): ${err.substring(0, 150)}`);
    }
}

async function main() {
    console.log(`📧 Sending test email to ${TEST_RECIPIENT}...`);
    console.log(`   Tracking ID : ${emailId}`);
    console.log(`   Pixel URL   : ${trackingUrl}\n`);

    // 1. Send the email
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: { user: account.user, pass: account.pass },
        tls: { rejectUnauthorized: false }
    });

    await transporter.sendMail({
        from: account.from,
        to: TEST_RECIPIENT,
        subject: '🧪 Test — Tracking Pixel Verification',
        text: `Test email. Tracking ID: ${emailId}. Open dashboard at ${TRACKER_BASE_URL}`,
        html
    });

    console.log('✅ Email delivered to Gmail!\n');

    // 2. Log the send to Supabase (so dashboard shows "1 Sent")
    await logToSupabase();

    console.log('\n──────────────────────────────────────────');
    console.log('📋 What to do now:');
    console.log('──────────────────────────────────────────');
    console.log(`1. Open Gmail → krishnapersonaluse438@gmail.com`);
    console.log(`2. Find email: "🧪 Test — Tracking Pixel Verification"`);
    console.log(`3. Open it fully (allow images if asked) ← this fires the pixel`);
    console.log(`4. Visit dashboard → ${TRACKER_BASE_URL}`);
    console.log(`   You should see: Sent: 1 | Opened: 1 | Rate: 100%`);
    console.log('──────────────────────────────────────────');
}

main().catch(console.error);
