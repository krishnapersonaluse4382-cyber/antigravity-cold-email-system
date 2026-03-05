const SubjectEngine = require('./Engine/SubjectEngine');
const BodyEngine = require('./Engine/BodyEngine');
const fs = require('fs');

const se = new SubjectEngine();
const be = new BodyEngine();

const leads_csv = fs.readFileSync('cleaned_leads.csv', 'utf-8').split('\n');
const leads = leads_csv.map((line, i) => {
    const parts = line.split(',');
    if (parts.length < 2) return null;
    return {
        index: i,
        name: (parts[0] || '').replace(/\"/g, '').trim(),
        email: (parts[1] || '').trim()
    };
}).filter(l => l && l.email);

// The user says 8 are fresh starting after OpulentPREM (96), skipping Lisa (104)
// Lead indices from cleaned_leads.csv (1-indexed or 0-indexed?)
// My view showed OpulentPREM at 96.
// Let's get the exact leads.

const targetIndices = [96, 97, 98, 99, 100, 101, 102, 103];
const accounts = ['Krishna', 'Ryan', 'Rik'];
const queue = [];
let now = Date.now();
const GAP = 10 * 60 * 1000; // 10 mins apart

targetIndices.forEach((idx, i) => {
    const lead = leads.find(l => l.index === idx);
    if (!lead) return;

    const account = accounts[i % 3];
    const firstName = lead.name.split(' ')[0] || 'there';

    // Rotate through types: SOCIAL_PROOF, INQUIRY, FAMILY
    const types = ['SOCIAL_PROOF', 'INQUIRY', 'FAMILY'];
    const type = types[i % 3];

    // Filter templates for this type
    const possibleSubjects = se.templates.filter(t => {
        if (type === 'SOCIAL_PROOF') return t.includes('likes') || t.includes('shares') || t.includes('saves') || t.includes('comments');
        if (type === 'INQUIRY') return t.includes('houses') || t.includes('homes') || t.includes('listing') || t.includes('tour');
        if (type === 'FAMILY') return t.includes('mom') || t.includes('dad') || t.includes('cousin') || t.includes('brother') || t.includes('sister') || t.includes('aunt');
        return false;
    });

    const rawSubject = possibleSubjects[Math.floor(Math.random() * possibleSubjects.length)] || se.templates[0];
    const subjectText = rawSubject.replace(/{{FirstName}}/gi, firstName).replace(/{{City}}/gi, 'your area');

    const body = be.generate({ id: type }, {
        firstName,
        city: 'your area',
        senderName: account
    });

    queue.push({
        id: i + 1,
        sendAt: now + (i * GAP),
        sendAtStr: new Date(now + (i * GAP)).toLocaleString(),
        account,
        firstName,
        email: lead.email,
        subject: subjectText,
        body: body,
        sent: false
    });
});

fs.writeFileSync('campaign_queue.json', JSON.stringify(queue, null, 2));
console.log('Successfully generated queue for ' + queue.length + ' leads.');
