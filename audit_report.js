const fs = require('fs');

const SUPABASE_URL = 'https://psqebjafyjrtxarphkej.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBzcWViamFmeWpydHhhcnBoa2VqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE5MjY4NTEsImV4cCI6MjA4NzUwMjg1MX0.2A8zmceqZP3azTzTvviqA6O2gFSGSG5WbmYk60q86wY';

async function generateReport() {
    console.log('--- MAR 2ND SPAM AUDIT REPORT ---');

    const startOfToday = '2026-03-02T00:00:00Z';

    try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/email_sent?sent_at=gte.${startOfToday}&select=recipient,sender,subject,sent_at,step`, {
            headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` }
        });
        const records = await res.json();

        if (!records.length) {
            console.log('No emails were recorded in Supabase for March 2nd.');
            return;
        }

        console.log(`Total Emails Sent Today: ${records.length}`);

        const spamMap = {};
        records.forEach(r => {
            spamMap[r.recipient] = (spamMap[r.recipient] || []);
            spamMap[r.recipient].push(r);
        });

        const victims = Object.entries(spamMap).filter(([email, sends]) => sends.length > 1);

        if (victims.length === 0) {
            console.log('Good news: No duplicates detected in Supabase logs today.');
        } else {
            console.log('\n🚨 SPAM DETECTED 🚨');
            console.log('The following people were emailed multiple times:');
            victims.forEach(([email, sends]) => {
                console.log(`\n📧 Recipient: ${email}`);
                console.log(`   Count: ${sends.length} times`);
                sends.forEach(s => {
                    console.log(`   - Sent at ${s.sent_at} by ${s.sender} (${s.step || 'p-sent'})`);
                });
            });
        }

    } catch (e) {
        console.error('Audit failed:', e.message);
    }
}

generateReport();
