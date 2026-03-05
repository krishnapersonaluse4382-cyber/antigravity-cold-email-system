const fs = require('fs');
const { parse } = require('csv-parse/sync');
const SubjectEngine = require('./Engine/SubjectEngine');
const subjectEngine = new SubjectEngine();

const LEADS_CSV = 'cleaned_leads.csv';
const STATE_FILE = 'email_state.json';

const ACCOUNTS = [
    { name: 'Krishna', user: 'krishna@contentelevators.org' },
    { name: 'Ryan', user: 'ryan@contentelevators.org' },
    { name: 'Rik', user: 'rik@contentelevators.org' }
];

function getFirstName(name) {
    if (!name) return 'there';
    const raw = name.trim().split(/[\s,–\-]+/)[0];
    return raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase();
}

async function main() {
    const leads = parse(fs.readFileSync(LEADS_CSV, 'utf8'), { columns: true, skip_empty_lines: true });
    let state = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
    const startIndex = state.lastIndex;

    console.log(`📧 Previewing 9-Email Campaign starting at Index: ${startIndex}`);
    console.log('─────────────────────────────────────────────────────────────────');
    const scheduleData = [];

    // Generate randomized times starting tomorrow 9 AM
    const startTime = new Date();
    startTime.setDate(startTime.getDate() + 1); // Friday
    startTime.setHours(9, 0, 0, 0);

    const endTime = new Date();
    endTime.setDate(endTime.getDate() + 2); // Saturday
    endTime.setHours(21, 0, 0, 0);

    const windowMs = endTime.getTime() - startTime.getTime();
    const times = [];
    for (let i = 0; i < 9; i++) {
        times.push(startTime.getTime() + Math.random() * windowMs);
    }
    times.sort((a, b) => a - b);

    // Enforce gaps
    for (let i = 1; i < 9; i++) {
        if (times[i] - times[i - 1] < 15 * 60 * 1000) {
            times[i] = times[i - 1] + 15 * 60 * 1000;
        }
    }

    for (let i = 0; i < 9; i++) {
        const leadIdx = startIndex + i;
        const lead = leads[leadIdx];
        if (!lead) break;

        const email = (lead.Email || lead.email || '').trim();
        const firstName = getFirstName(lead.Name || lead.name);
        const account = ACCOUNTS[i % 3];
        const hook = ['ENGAGEMENT_HOOK', 'FOLLOWER_HOOK', 'INVENTORY_HOOK'][i % 3];
        const subjectObj = subjectEngine.generate(hook, { firstName, city: lead.City || lead.city || 'your area' });

        const d = new Date(times[i]);
        const timeStr = d.toLocaleTimeString('en-IN', { weekday: 'short', hour: '2-digit', minute: '2-digit' });

        console.log(`[${i + 1}] ${timeStr} | Account: ${account.name.padEnd(8)} | Lead: ${firstName.padEnd(12)} <${email}>`);
        console.log(`    Subject: "${subjectObj.subject}"`);
        console.log(`    Variation: ${subjectObj.id} (LF8 Approach)`);
        console.log('─────────────────────────────────────────────────────────────────');

        scheduleData.push({
            id: i + 1,
            sendAt: times[i],
            sendAtStr: timeStr,
            account: account.name,
            firstName,
            email,
            hook,
            leadIdx,
            sent: false
        });
    }

    fs.writeFileSync('campaign_queue.json', JSON.stringify(scheduleData, null, 2));
    console.log(`\n✅ Persistent schedule saved to campaign_queue.json`);
    console.log('Campaign: "Jordan Beta 9" | Step: "p-sent" | Gap: 15min+');
}


main().catch(err => console.error(err));
