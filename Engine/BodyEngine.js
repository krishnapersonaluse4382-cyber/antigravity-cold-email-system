/**
 * BodyEngine.js - Multi-Variability Email Body Generator
 */
class BodyEngine {
    constructor() {
        this.variations = {
            // --- INITIAL HOOKS ---
            H1: [
                "I've been following your recent updates. Your properties look great, but I noticed you're doing one specific thing wrong with your visual hooks that is likely hurting your reach.\n\nThis problem will restrict your audience growth forever if left alone, but I've actually found a fix for it. I'd love to show you the difference it makes in capturing buyer attention.\n\nDo you have 5 minutes this week for a quick chat?",
                "I was looking at your recent real estate content. You have great inventory, but how you're presenting your posts is missing the mark, and it's holding back your engagement.\n\nThis will solve your problem, {{FirstName}}: I've found a framework that fixes the visual pacing to keep viewers watching longer and ultimately booking more tours.\n\nCan we schedule a brief appointment so I can show you exactly how it works?"
            ],
            // --- FOLLOW-UP 1 (THE BUMP) ---
            F1_BUMP: [
                "Just floating this to the top of your inbox. I'm still thinking about solving that problem on your recent videos.\n\nWith a slight tweak to the first three seconds, you can easily trigger more desire from potential buyers without doing extra heavy lifting on the camera.\n\nWorth a quick chat to see how this works?",
                "I'm still thinking about the missed opportunity on your recent posts.\n\nJust a quick follow-up to my last note—most realtors I speak with are spending too much time on content that doesn't trigger buyer action. Applying casual but highly realistic editing fixes this almost overnight.\n\nAre you open to a 10-minute call this week to review the concept?"
            ],
            // --- FOLLOW-UP 2 (SOCIAL PROOF) ---
            F2_PROOF: [
                "I know you're busy touring listings and closing deals, so I'll be brief.\n\nIf I could take the visual imagery editing off your plate and help you secure more appointments using strictly result-driven content, would you be open to giving it a try?\n\nIf not, no worries at all—keep up the great work!",
                "Guessing you're swamped right now. I'll leave you be, but if you ever want to leverage better visual hooks to significantly increase your reach without the headache of figuring it out yourself, let me know."
            ],
            // --- FOLLOW-UP 3 (THE BREAKUP) ---
            F3_BREAKUP: [
                "Final follow-up regarding your content. I wish you all the best!"
            ]
        };
    }

    /**
     * @param {object} subjectObj - From SubjectEngine
     * @param {object} context - { firstName, senderName, city, industry }
     */
    generate(subjectObj, context = {}) {
        const id = subjectObj.id || 'H1';
        let pool = this.variations[id] || this.variations['H1'];
        if (id === 'H2' || id === 'H3') {
            pool = this.variations['H1']; // Re-use H1 pool for all initial hooks
        }

        // Randomly rotate between variations for maximum anti-spam variability
        const rawBody = pool[Math.floor(Math.random() * pool.length)];

        const city = context.city || 'your area';
        const name = context.firstName || 'there';
        const sender = context.senderName || 'our team';

        const template = "Hey {{FirstName}},\n\n" + rawBody + `\n\nBest,\n{{SenderName}}`;

        return template
            .replace(/{{City}}/gi, city)
            .replace(/{{FirstName}}/gi, name)
            .replace(/{{Name}}/gi, name)
            .replace(/{{followers}}/gi, context.followers || 'your audience')
            .replace(/{{industry}}/gi, context.industry || 'real estate')
            .replace(/{{SenderName}}/gi, sender);
    }
}

module.exports = BodyEngine;
