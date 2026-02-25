const fs = require('fs');
const path = require('path');

function cleanEmail(email) {
    if (!email) return null;
    email = email.trim();
    if (/[^@]+@[^@]+\.[^@]+/.test(email)) {
        return email.toLowerCase();
    }
    return null;
}

function cleanName(name) {
    if (!name || name.trim() === '') return "Texas Realtor";
    name = name.trim();
    // Remove common realtor suffixes
    name = name.replace(/,?\s*(Realtor®?|STAR REALTY GROUP|Group|Team|Licensed Texas Realtor).*/gi, '');
    if (name.includes('[Last Name Unknown]')) {
        name = name.split('[')[0].trim();
    }
    return name || "Texas Realtor";
}

function processLeads(inputPath, outputPath) {
    try {
        const data = fs.readFileSync(inputPath, { encoding: 'utf8', flag: 'r' });
        const lines = data.split(/\r?\n/);
        const leads = new Map(); // email -> name

        // Skip header
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i];
            if (!line.trim()) continue;

            // Simple CSV split (handling basic cases, though nested commas in quotes might be tricky)
            // For this specific sheet, we target:
            // Block 1 (Twitter): Name is Col 1, Email is Col 3
            // Block 2 (YouTube): Name is Col 12, Email is Col 14
            // Block 3 (Facebook): Name is Col 21, Email is Col 23

            // Robust comma split (ignoring commas inside quotes)
            const parts = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);

            // Block 1: Twitter
            if (parts.length > 2) {
                const name = parts[0].replace(/"/g, '');
                const email = cleanEmail(parts[2]);
                if (email) {
                    leads.set(email, cleanName(name));
                }
            }

            // Block 2: YouTube
            if (parts.length > 13) {
                const name = parts[11].replace(/"/g, '');
                const email = cleanEmail(parts[13]);
                if (email && !leads.has(email)) {
                    leads.set(email, cleanName(name));
                }
            }

            // Block 3: Facebook
            if (parts.length > 22) {
                const name = parts[20].replace(/"/g, '');
                const email = cleanEmail(parts[22]);
                if (email && !leads.has(email)) {
                    leads.set(email, cleanName(name));
                }
            }
        }

        console.log(`Extracted ${leads.size} unique contacts.`);

        const outputData = [['Name', 'Email']];
        for (const [email, name] of leads.entries()) {
            outputData.push([`"${name}"`, email]);
        }

        fs.writeFileSync(outputPath, outputData.map(row => row.join(',')).join('\n'));
        console.log(`Cleaned leads saved to ${outputPath}`);
    } catch (error) {
        console.error("Error processing leads:", error);
    }
}

const inputPath = "C:\\Users\\praja\\Downloads\\x twitter - Sheet1.csv";
const outputPath = path.join(__dirname, "cleaned_leads.csv");

processLeads(inputPath, outputPath);
