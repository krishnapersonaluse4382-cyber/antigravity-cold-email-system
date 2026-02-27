// mark_leads.js
// Adds p-sent, f1, f2, f3 columns to cleaned_leads.csv and marks
// leads 65-88 (the current batch) as "p-sent".
// Also run after each followup to stamp f1, f2, f3.
//
// Usage:
//   node mark_leads.js --psent 65 88        → marks rows 65-88 as p-sent
//   node mark_leads.js --f1    65 88        → marks rows 65-88 as f1
//   node mark_leads.js --f2    65 88        → marks rows 65-88 as f2
//   node mark_leads.js --f3    65 88        → marks rows 65-88 as f3
//   node mark_leads.js --status              → prints p-sent/f1/f2/f3 summary

const fs = require('fs');
const { parse } = require('csv-parse/sync');
const { stringify } = require('csv-stringify/sync');

const SOURCE_CSV = 'cleaned_leads.csv';   // source (read-only while scheduler runs)
const TRACKED_CSV = 'leads_tracked.csv';   // our tracking copy (p-sent, f1, f2, f3)

// ── Load CSV ──────────────────────────────────────────────────────────────────
function loadCSV() {
    // Prefer the tracked copy if it already exists (has our columns)
    const file = fs.existsSync(TRACKED_CSV) ? TRACKED_CSV : SOURCE_CSV;
    const raw = fs.readFileSync(file, 'utf8');
    const leads = parse(raw, { columns: true, skip_empty_lines: true });

    // Ensure the 4 tracking columns exist on every row
    return leads.map(l => ({
        ...l,
        'p-sent': l['p-sent'] || '',
        'f1': l['f1'] || '',
        'f2': l['f2'] || '',
        'f3': l['f3'] || '',
    }));
}

// ── Save CSV ──────────────────────────────────────────────────────────────────
function saveCSV(leads) {
    const csv = stringify(leads, { header: true });
    fs.writeFileSync(TRACKED_CSV, csv);
}

// ── Mark ──────────────────────────────────────────────────────────────────────
function mark(leads, col, from, to) {
    const now = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' });
    let count = 0;
    for (let i = from; i <= to && i < leads.length; i++) {
        // Only stamp p-sent if not already stamped (don't overwrite)
        if (col === 'p-sent' && leads[i]['p-sent']) {
            console.log(`  [${i}] Already marked p-sent (${leads[i]['p-sent']}) — skipping`);
            continue;
        }
        leads[i][col] = now; // e.g. "28 Feb 26"
        count++;
    }
    return count;
}

// ── Status Report ─────────────────────────────────────────────────────────────
function printStatus(leads) {
    const pSent = leads.filter(l => l['p-sent']).length;
    const f1 = leads.filter(l => l['f1']).length;
    const f2 = leads.filter(l => l['f2']).length;
    const f3 = leads.filter(l => l['f3']).length;

    console.log('\n📊 Lead Status Summary');
    console.log('──────────────────────────────');
    console.log(`  p-sent  : ${pSent} leads (initial email sent)`);
    console.log(`  f1      : ${f1}    leads (1st follow-up sent)`);
    console.log(`  f2      : ${f2}    leads (2nd follow-up sent)`);
    console.log(`  f3      : ${f3}    leads (3rd follow-up sent)`);
    console.log('──────────────────────────────');
    console.log(`  Total leads in CSV: ${leads.length}\n`);

    // Print rows that have been touched
    const touched = leads.map((l, i) => ({ i, ...l })).filter(l => l['p-sent'] || l['f1'] || l['f2'] || l['f3']);
    if (touched.length > 0) {
        console.log('Rows with activity:');
        touched.forEach(l => {
            console.log(`  [${String(l.i).padStart(4)}] ${(l.Name || '').padEnd(25)} p-sent:${(l['p-sent'] || '-').padEnd(10)} f1:${(l['f1'] || '-').padEnd(10)} f2:${(l['f2'] || '-').padEnd(10)} f3:${l['f3'] || '-'}`);
        });
    }
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const leads = loadCSV();

if (args.includes('--status')) {
    printStatus(leads);
    process.exit(0);
}

const colMap = {
    '--psent': 'p-sent',
    '--f1': 'f1',
    '--f2': 'f2',
    '--f3': 'f3',
};

const colArg = args.find(a => colMap[a]);
if (!colArg) {
    console.log(`
Usage:
  node mark_leads.js --status            Print summary
  node mark_leads.js --psent <from> <to> Mark range as p-sent
  node mark_leads.js --f1    <from> <to> Mark range as f1
  node mark_leads.js --f2    <from> <to> Mark range as f2
  node mark_leads.js --f3    <from> <to> Mark range as f3
`);
    process.exit(0);
}

const col = colMap[colArg];
const from = parseInt(args[args.indexOf(colArg) + 1]);
const to = parseInt(args[args.indexOf(colArg) + 2]);

if (isNaN(from) || isNaN(to)) {
    console.error('❌ Please provide valid <from> <to> row indices.');
    process.exit(1);
}

console.log(`\n🖊  Marking rows ${from}–${to} as "${col}"...`);
const count = mark(leads, col, from, to);
saveCSV(leads);
console.log(`✅  Stamped ${count} rows as "${col}".`);
console.log(`📁  Saved to ${TRACKED_CSV}\n`);

printStatus(leads);
