/**
 * BodyEngine.js - Multi-Variability Email Body Generator
 * Uses "Sentence Rotation" and Cashvertising principles to ensure high performance and maximum deliverability.
 */
class BodyEngine {
    constructor() {
        this.variations = {
            // --- INITIAL HOOKS ---
            H1: [
                "I just saw your recent listing in {{City}} and had a quick thought about your video strategy. Are you doing any of the content for this yourself?",
                "Caught your recent property update in {{City}}. Love the listing, but I think you're leaving a lot of money and attention on the table with the way your YouTube content is structured.",
                "Found your listing in {{City}} and had to reach out. I've been following your YouTube for a bit now, and I had a quick observation about your engagement strategy."
            ],
            // --- FOLLOW-UP 1 (THE BUMP) ---
            F1_BUMP: [
                "Hey {{FirstName}}, just wanted to quickly bump this to the top of your inbox. I know things get incredibly busy with new listings.",
                "Hey {{FirstName}}, checking in real quick to make sure this didn't get lost in your inbox. I'd love to chat more about your Real Estate content goals.",
                "Hey {{FirstName}}, did you have a chance to see my last email? I'd really love to walk you through what we're seeing in the {{City}} market right now."
            ],
            // --- FOLLOW-UP 2 (SOCIAL PROOF) ---
            F2_PROOF: [
                "I wanted to share a quick result we got for a similar property in a different market. We were able to increase organic views by 21% in just 8 days by adjusting one simple factor.",
                "Thought you'd might like to see this. We've been seeing some massive success lately by focusing on 'Micro-Hooks' for Real Estate videos. It literally changes the entire dynamic of the listing.",
                "I've got a quick case study that might interest you. We worked with a Realtor recently who was struggling to get any traction on YouTube - we made one change and her engagement shot up 3x."
            ],
            // --- FOLLOW-UP 3 (THE BREAKUP) ---
            F3_BREAKUP: [
                "It seems like this isn't a priority for you right now, which is totally fine. I won't reach out again, but if you're ever looking to scale your Real Estate video game, you know where to find me.",
                "I'm guessing you've got your hands full with listings in {{City}}, so I'll take you off my list for now. Wish you all the best with your growth!",
                "Hey {{FirstName}}, I haven't heard back, so I'll assume you're all set with your current video strategy. I'll be here if you ever decide to take things to the next level."
            ]
        };
    }

    /**
     * @param {object} subjectObj - From SubjectEngine
     * @param {object} context - { firstName, senderName, city, industry }
     */
    generate(subjectObj, context = {}) {
        const id = subjectObj.id || 'H1';
        const pool = this.variations[id] || this.variations['H1'];

        // Randomly rotate between variations for maximum anti-spam variability
        const rawBody = pool[Math.floor(Math.random() * pool.length)];

        const city = context.city || 'your area';
        const name = context.firstName || 'there';
        const sender = context.senderName || 'our team';

        return rawBody
            .replace(/{{City}}/gi, city)
            .replace(/{{FirstName}}/gi, name)
            .replace(/{{Name}}/gi, name)
            .replace(/{{SenderName}}/gi, sender)
            + `\n\nTalk soon,\n${sender}`;
    }
}

module.exports = BodyEngine;
