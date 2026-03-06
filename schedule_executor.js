const fs = require('fs');
const nodemailer = require('nodemailer');
const { parse } = require('csv-parse/sync');
const { stringify } = require('csv-stringify/sync');
const https = require('https');

// Config
const QUEUE_FILE = 'campaign_queue.json';
const TRACKED_CSV = 'leads_tracked.csv';
const SUPABASE_URL = 'https://psqebjafyjrtxarphkej.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBzcWViamFmeWpydHhhcnBoa2VqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE5MjY4NTEsImV4cCI6MjA4NzUwMjg1MX0.2A8zmceqZP3azTzTvviqA6O2gFSGSG5WbmYk60q86wY';

const ACCOUNTS = {
    'Krishna': { user: 'krishna@contentelevators.org', pass: process.env.KRISHNA_PASS, from: 'Krishna | Content Elevators <krishna@contentelevators.org>' },
    'Ryan': { user: 'ryan@contentelevators.org', pass: process.env.RYAN_PASS, from: 'Ryan | Content Elevators <ryan@contentelevators.org>' },
    'Rik': { user: 'rik@contentelevators.org', pass: process.env.RIK_PASS, from: 'Rik | Content Elevators <rik@contentelevators.org>' }
};

async function logToSupabase(payload) {
    return new Promise((resolve, reject) => {
        const body = JSON.stringify(payload);
        const options = {
            hostname: 'psqebjafyjrtxarphkej.supabase.co',
            port: 443,
            path: '/rest/v1/email_sent',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Prefer': 'return=minimal',
                'Content-Length': body.length
            }
        };

        const req = https.request(options, (res) => {
            if (res.statusCode >= 200 && res.statusCode < 300) {
                console.log(`✅ Supabase Log Success (${res.statusCode})`);
                resolve();
            } else {
                let data = '';
                res.on('data', d => data += d);
                res.on('end', () => {
                    console.error(`❌ Supabase Error: ${res.statusCode} ${data}`);
                    resolve();
                });
            }
        });

        req.on('error', (e) => {
            console.error(`❌ Net Error: ${e.message}`);
            resolve();
        });

        req.write(body);
        req.end();
    });
}

function updateTrackedCsv(email, dateStr) {
    try {
        if (!fs.existsSync(TRACKED_CSV)) return;
        const csvContent = fs.readFileSync(TRACKED_CSV, 'utf8');
        const leads = parse(csvContent, { columns: true, skip_empty_lines: true });

        let found = false;
        for (const lead of leads) {
            if (lead.Email && lead.Email.toLowerCase() === email.toLowerCase()) {
                lead['p-sent'] = dateStr;
                found = true;
                break;
            }
        }

        if (found) {
            const output = stringify(leads, { header: true });
            fs.writeFileSync(TRACKED_CSV, output);
            console.log(`📝 Tracking CSV updated for ${email}`);
        }
    } catch (e) {
        console.error(`❌ Tracking CSV update failed for ${email}:`, e.message);
    }
}

async function main() {
    if (!fs.existsSync(QUEUE_FILE)) {
        console.log('Queue file not found. Skipping.');
        return;
    }
    const queue = JSON.parse(fs.readFileSync(QUEUE_FILE, 'utf8'));
    const now = Date.now();
    const todayStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' }).replace(/ /g, '-');

    let changed = false;

    for (const item of queue) {
        if (!item.sent && item.sendAt <= now) {
            console.log(`🚀 Sending scheduled email to ${item.firstName} (${item.email})...`);

            const acc = ACCOUNTS[item.account];
            if (!acc || !acc.pass) {
                console.error(`❌ Missing password for ${item.account}`);
                continue;
            }

            const finalSubject = item.subject;
            const finalBody = item.body;

            try {
                const transporter = nodemailer.createTransport({
                    host: 'smtp.gmail.com', port: 587, secure: false,
                    auth: { user: acc.user, pass: acc.pass }
                });

                await transporter.sendMail({
                    from: acc.from,
                    to: item.email,
                    subject: finalSubject,
                    text: finalBody
                });

                console.log(`✅ Sent via ${item.account} to ${item.firstName}`);

                item.sent = true;
                item.actualSentAt = new Date().toISOString();
                changed = true;

                updateTrackedCsv(item.email, todayStr);

                let type = 'SOCIAL_PROOF';
                if (finalSubject.toLowerCase().includes('houses') || finalSubject.toLowerCase().includes('listing')) type = 'INQUIRY';
                if (finalSubject.toLowerCase().includes('mom') || finalSubject.toLowerCase().includes('video') || finalSubject.toLowerCase().includes('reel')) {
                    if (!finalSubject.toLowerCase().includes('likes')) type = 'FAMILY';
                }

                await logToSupabase({
                    recipient: item.email,
                    subject: finalSubject,
                    sender: acc.user,
                    category: 'Real Estate',
                    subject_type: type,
                    body_type: 'JORDAN_BETA',
                    campaign_name: 'Inquiry Engine V2',
                    step: 'p-sent',
                    sent_at: new Date().toISOString()
                });

            } catch (err) {
                console.error(`❌ Failed send: ${err.message}`);
            }
        }
    }

    if (changed) {
        fs.writeFileSync(QUEUE_FILE, JSON.stringify(queue, null, 2));
    }
}

main().catch(err => console.error(err));
