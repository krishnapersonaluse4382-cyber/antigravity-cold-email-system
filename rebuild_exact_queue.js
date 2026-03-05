const fs = require('fs');
const SubjectEngine = require('./Engine/SubjectEngine');
const BodyEngine = require('./Engine/BodyEngine');

const subjectEngine = new SubjectEngine();
const bodyEngine = new BodyEngine();

const leads = [
    { firstName: "OpulentPREM", email: "opulentprem@gmail.com" },
    { firstName: "Travis", email: "travisandgrace.etr@gmail.com" },
    { firstName: "Jullian", email: "jullianandgrace.etr@gmail.com" },
    { firstName: "Yessica", email: "yessica@thelegacytx.com" },
    { firstName: "Beau", email: "beau@thelegacytx.com" },
    { firstName: "Angela", email: "angela@thelegacytx.com" },
    { firstName: "Lynn", email: "officialscammerpayback@gmail.com" },
    { firstName: "Angelica", email: "ipinaa08@gmail.com" }
];

const accounts = ["Krishna", "Ryan", "Rik"];

// Define specific variations based on User Request
const variations = [
    { type: 'SOCIAL_PROOF', subject: "Your reel got 1.2k likes, {{FirstName}}" },
    { type: 'INQUIRY', subject: "{{FirstName}}, what houses do you have?" },
    { type: 'FAMILY', subject: "Hey {{FirstName}}, my mom liked your video" }
];

// 16-hour window starting from 01:00 AM Today (March 6th)
const baseTime = new Date('2026-03-06T01:00:00').getTime();
const sixteenHours = 16 * 60 * 60 * 1000;

const queue = [];

leads.forEach((lead, i) => {
    const acc = accounts[i % 3];
    const varIdx = i % 3;
    const v = variations[varIdx];

    // Generate randomized time within the 16h window
    // Spread them out, but add randomness
    const slotLength = sixteenHours / leads.length;
    const sendAt = baseTime + (i * slotLength) + (Math.random() * slotLength * 0.5);

    const subObj = { id: v.type, subject: v.subject.replace(/{{FirstName}}/gi, lead.firstName) };
    const body = bodyEngine.generate(subObj, { firstName: lead.firstName, senderName: acc });

    queue.push({
        id: i + 1,
        sendAt: Math.floor(sendAt),
        sendAtStr: new Date(sendAt).toLocaleString('en-GB'),
        account: acc,
        firstName: lead.firstName,
        email: lead.email,
        subject: subObj.subject,
        body: body,
        sent: false
    });
});

fs.writeFileSync('campaign_queue.json', JSON.stringify(queue, null, 2));
console.log("✅ Queue rebuilt successfully with correct Coherent Hooks!");
console.log("Check campaign_queue.json for verification.");
