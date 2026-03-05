const fs = require('fs');

const leads = [
    { name: "OpulentPREM", email: "opulentprem@gmail.com" },
    { name: "Travis", email: "travisandgrace.etr@gmail.com" },
    { name: "Jullian", email: "jullianlopezremax@gmail.com" },
    { name: "Yessica", email: "yessicamrealtor@gmail.com" },
    { name: "Beau", email: "beauknowsaustin@gmail.com" },
    { name: "Angela", email: "annjones.realtor@gmail.com" },
    { name: "Lynn", email: "officialscammerpayback@gmail.com" },
    { name: "Angelica", email: "ipinaa08@gmail.com" }
];

const accounts = ["Krishna", "Ryan", "Rik"];
const variations = [
    {
        subject: "Your reel got 1.2k likes, {{FirstName}}",
        body: "Hey {{FirstName}},\n\nThat's exactly the kind of result my clients are seeing with our system—turning raw attention into the kind of dominance that makes you the only choice in your area.\n\nI spent some time this morning looking at your latest moves in the Houston market. The level of competence you show is clearly high-tier, but I noticed a disconnect in your digital presence which is likely capping your influence and the volume of buyers reaching out to you.\n\nYou have the expertise, but there is a visible friction point in your content that is definitely affecting your reach and the chances of getting more visibility which brings buyers.\n\nWe help businesses like you in fixing the issue of getting more attention to get buyers. Do you want to see the issue so you can fix it to immediately get more reach and maximize your chances of getting buyers with your current setup? Feel free to reply.\n\nBest,\n\nKrishna"
    },
    {
        subject: "{{FirstName}}, what houses do you have?",
        body: "Hey {{FirstName}},\n\nThat's exactly the kind of result my clients are seeing with our system—turning raw attention into the kind of dominance that makes you the only choice in your area.\n\nI spent some time this morning looking at your latest moves in the Houston market. The level of competence you show is clearly high-tier, but I noticed a disconnect in your digital presence which is likely capping your influence and the volume of buyers reaching out to you.\n\nYou have the expertise, but there is a visible friction point in your content that is definitely affecting your reach and the chances of getting more visibility which brings buyers.\n\nWe help businesses like you in fixing the issue of getting more attention to get buyers. Do you want to see the issue so you can fix it to immediately get more reach and maximize your chances of getting buyers with your current setup? Feel free to reply.\n\nBest,\n\nRyan"
    },
    {
        subject: "Hey {{FirstName}}, my mom liked your video",
        body: "Hey {{FirstName}},\n\nThat's exactly the kind of result my clients are seeing with our system—turning raw attention into the kind of dominance that makes you the only choice in your area.\n\nI spent some time this morning looking at your latest moves in the Houston market. The level of competence you show is clearly high-tier, but I noticed a disconnect in your digital presence which is likely capping your influence and the volume of buyers reaching out to you.\n\nYou have the expertise, but there is a visible friction point in your content that is definitely affecting your reach and the chances of getting more visibility which brings buyers.\n\nWe help businesses like you in fixing the issue of getting more attention to get buyers. Do you want to see the issue so you can fix it to immediately get more reach and maximize your chances of getting buyers with your current setup? Feel free to reply.\n\nBest,\n\nRik"
    }
];

// Current time: 2026-03-06T00:32:26
// Target end: 2026-03-06T16:00:00 (16:00 today)
const startTime = new Date('2026-03-06T00:45:00').getTime();
const endTime = new Date('2026-03-06T16:00:00').getTime();
const duration = endTime - startTime;

// Divide 16 hours into 8 slots roughly 2 hours apart, then randomize within slots
const numLeads = leads.length;
const slotSize = duration / numLeads;

const queue = [];
leads.forEach((lead, i) => {
    const varIdx = i % 3;
    const account = accounts[i % 3];
    const firstName = lead.name.split(' ')[0];

    // Randomize time within the roughly 2-hour slot to make it look non-constant
    // slotStart + (some portion of slotSize)
    const slotStart = startTime + (i * slotSize);
    const randomOffset = Math.floor(Math.random() * (slotSize * 0.8)); // Use up to 80% of the slot for randomness
    const sendAt = slotStart + randomOffset;

    const subject = variations[varIdx].subject.replace(/{{FirstName}}/gi, firstName);
    const body = variations[varIdx].body.replace(/{{FirstName}}/gi, firstName);

    queue.push({
        id: i + 1,
        sendAt: sendAt,
        sendAtStr: new Date(sendAt).toLocaleString('en-GB', { timeZone: 'Asia/Kolkata' }),
        account: account,
        firstName: firstName,
        email: lead.email,
        subject: subject,
        body: body,
        sent: false
    });
});

// Sort by send time just in case
queue.sort((a, b) => a.sendAt - b.sendAt);

fs.writeFileSync('campaign_queue.json', JSON.stringify(queue, null, 2));
console.log('Randomized 16-hour schedule generated for 8 leads.');
queue.forEach(q => console.log(`${q.firstName}: ${q.sendAtStr} via ${q.account}`));
