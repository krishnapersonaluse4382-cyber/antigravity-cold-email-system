const fs = require('fs');
const { parse } = require('csv-parse/sync');
const SubjectEngine = require('./Engine/SubjectEngine');
const subjectEngine = new SubjectEngine();

const LEADS_CSV = 'cleaned_leads.csv';
const STATE_FILE = 'email_state.json';

const ACCOUNTS = [
    { name: 'Ryan', user: 'ryan@contentelevators.org' }, // Ryan next
    { name: 'Rik', user: 'rik@contentelevators.org' },
    { name: 'Krishna', user: 'krishna@contentelevators.org' }
];

function getFirstName(name) {
    if (!name) return 'there';
    const raw = name.trim().split(/[\s,–\-]+/)[0];
    return raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase();
}

async function main() {
    const leads = parse(fs.readFileSync(LEADS_CSV, 'utf8'), { columns: true, skip_empty_lines: true });

    // We start from 97 (skipping 96 which was the fail)
    const startIndex = 97;

    console.log(`📧 Previewing CORRECTED 8-Email Campaign starting at Index: ${startIndex}`);
    console.log('─────────────────────────────────────────────────────────────────');
    const scheduleData = [];

    // Frequency: One every 4 hours approx, starting in 4 hours
    const startTime = Date.now() + (2 * 60 * 60 * 1000); // Wait 2 hours for sanity

    const times = [];
    for (let i = 0; i < 8; i++) {
        // Stagger them by roughly 6 hours
        times.push(startTime + (i * 6 * 60 * 60 * 1000) + (Math.random() * 60 * 60 * 1000));
    }

    for (let i = 0; i < 8; i++) {
        const leadIdx = startIndex + i;
        const lead = leads[leadIdx];
        if (!lead) break;

        const email = (lead.Email || lead.email || '').trim();
        const firstName = getFirstName(lead.Name || lead.name);
        const city = lead.City || lead.city || 'your area';
        const account = ACCOUNTS[i % 3];

        // SubjectEngine now handles the 5 Jordan Variations
        const subjectObj = subjectEngine.generate(null, { firstName, city });

        const d = new Date(times[i]);
        const timeStr = d.toLocaleString('en-IN', { weekday: 'short', hour: '2-digit', minute: '2-digit' });

        console.log(`[${i + 2}] ${timeStr} | Account: ${account.name.padEnd(8)} | Lead: ${firstName.padEnd(12)} <${email}>`);
        console.log(`    Subject: "${subjectObj.subject}"`);
        console.log(`    Variation: ${subjectObj.id}`);
        console.log('─────────────────────────────────────────────────────────────────');

        scheduleData.push({
            id: i + 2,
            sendAt: times[i],
            sendAtStr: timeStr,
            account: account.name,
            firstName,
            email,
            subjectStyle: subjectObj.id,
            leadIdx,
            sent: false
        });
    }

    // Keep the first one which was already sent (manually update for the file)
    const finalQueue = [
        {
            id: 1,
            sendAt: Date.now() - 600000,
            sendAtStr: "Already Sent",
            account: "Krishna",
            firstName: "Jullian",
            email: "jullianlopezremax@gmail.com",
            sent: true,
            actualSentAt: new Date().toISOString()
        },
        ...scheduleData
    ];

    fs.writeFileSync('campaign_queue.json', JSON.stringify(finalQueue, null, 2));
    console.log(`\n✅ Persistent schedule corrected and saved to campaign_queue.json`);
}

main().catch(err => console.error(err));
