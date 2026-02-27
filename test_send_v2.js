/**
 * test_send_v2.js
 * Tests the new "Persuasive Outreach" logic with Subject & Body Engines.
 */

const nodemailer = require('nodemailer');
const SubjectEngine = require('./Engine/SubjectEngine');
const BodyEngine = require('./Engine/BodyEngine');

const subjectEngine = new SubjectEngine();
const bodyEngine = new BodyEngine();

const TEST_RECIPIENT = 'krishnapersonaluse438@gmail.com';

const ACCOUNTS = [
    {
        name: 'Krishna',
        user: 'krishna@contentelevators.org',
        pass: 'hwvi jotl zpfn mspl',
        from: 'Krishna | Content Elevators <krishna@contentelevators.org>'
    }
];

async function sendTest() {
    console.log('🧪 Starting Persuasive Outreach Test...\n');

    const account = ACCOUNTS[0];
    const data = {
        firstName: 'Krishna',
        city: 'Mumbai',
        senderName: 'Krishna',
        industry: 'Real Estate'
    };

    // 1. Generate Subject & Body categories for variety check
    // We'll pick a specific high-potential flow: "Interaction Stats DM" logic
    console.log('Step 1: Generating dynamic content...');
    const subjectObj = subjectEngine.generate('INTERACTION_STATS', data);
    const bodyText = bodyEngine.generate(subjectObj, data);

    console.log('\n--- PREVIEW ---');
    console.log('Subject:', subjectObj.subject);
    console.log('Preview Line:', subjectObj.preview);
    console.log('Body Header:', bodyText.split('\n')[0]);
    console.log('Body Bridge:', bodyText.split('\n')[2]);
    console.log('===============\n');

    // 2. Build HTML with preheader
    const htmlBody = `
    <!DOCTYPE html>
    <html>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; padding: 20px;">
        <div style="display: none; max-height: 0px; overflow: hidden;">
            ${subjectObj.preview} &nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;
        </div>
        ${bodyText.replace(/\n/g, '<br>')}
    </body>
    </html>`;

    // 3. Send
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: { user: account.user, pass: account.pass },
        tls: { rejectUnauthorized: false }
    });

    try {
        await transporter.sendMail({
            from: account.from,
            to: TEST_RECIPIENT,
            subject: subjectObj.subject,
            text: bodyText,
            html: htmlBody
        });
        console.log(`✅ Success! Test email sent to ${TEST_RECIPIENT}`);
    } catch (err) {
        console.error('❌ Failed:', err.message);
    }
}

sendTest();
