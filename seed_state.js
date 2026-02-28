// No require needed for fetch in Node 20+
const SUPABASE_URL = 'https://psqebjafyjrtxarphkej.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

async function seedState(newIndex) {
    if (!SUPABASE_ANON_KEY) {
        console.error('Missing SUPABASE_ANON_KEY');
        process.exit(1);
    }
    const res = await fetch(`${SUPABASE_URL}/rest/v1/email_sent`, {
        method: 'POST',
        headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
            email_id: 'INITIAL_STATE_SET',
            recipient: '__automation_state__@internal.system',
            subject: String(newIndex),
            sender: 'SYSTEM_SEED',
            category: 'INTERNAL_STATE',
            sent_at: new Date().toISOString()
        })
    });
    if (res.ok) {
        console.log(`✅ Supabase state seeded to index: ${newIndex}`);
    } else {
        console.error(`❌ Failed to seed state: ${res.status}`, await res.text());
    }
}

seedState(68);
