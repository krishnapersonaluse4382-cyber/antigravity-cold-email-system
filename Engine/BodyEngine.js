/**
 * BodyEngine.js - Persuasive 1-2 Line Email Generator
 * PROTOCOL: Assumption Control + Specificity Framework
 * Rule: Focus on Universal Outcome Problems, NO Activity-Based Assumptions.
 */
class BodyEngine {
    constructor() {
        this.variations = {
            H1: [ // ENGAGEMENT_HOOK
                "I noticed the engagement on your page—it's clear you have the authority, but is that attention actually converting into the inbound buyers you need? I help experts fix the logic-gaps that keep them from seeing consistent revenue growth. Open to a quick reply?",
                "Great engagement on your recent posts, {{FirstName}}. But for most top-tier pros, views don't always mean predictable deal flow if there's an invisible leak in the inquiry path. I have a 90-second diagnostic showing exactly where these leads get lost—want me to send it over?"
            ],
            H2: [ // FOLLOWER_HOOK
                "Just followed your page! I love your properties in {{City}}, but I spotted a technical 'stop sign' on your profile that’s likely causing serious prospects to bounce. I have a 2-minute fix that guarantees 2x more views in 90 days—should I send the link?",
                "Your follower here! I admire the professionalism you bring to {{industry}}, but from a conversion standpoint, a small technical detail might be costing you inbound interest every month. I recorded a short repair guide showing where the disconnect is—want to see it?"
            ],
            H3: [ // INVENTORY_HOOK
                "I was looking for your current inventory in {{City}} but it’s actually quite difficult to find the specifics on your profile. I fix this inquiry friction so you can capture more high-net-worth buyers without the burnout of managing every step yourself. Should I send the blueprint?",
                "Checking your page for listings, but there's a visible gap between your content and the next step for a serious buyer. I help experts bridge this so they can scale their exposure and deal flow predictably. Open to seeing the 90-second walkthrough?"
            ],
            H4: [ // FAMILY_HOOK
                "My {{relation}} actually sent me your video on {{postType}} today—your clarity is rare in this market. But I noticed a logic-error on your page that's likely leaking high-intent leads to other agents in {{City}}. Open to a 90-second diagnostic of the fix?",
                "My {{relation}} saw your {{postType}} and sent it to me because your market analysis in {{City}} stands out. You have the status, but your inquiry path might be creating friction for serious prospects. I have a 2-minute fix for this if you're open to a quick reply?"
            ],
            H5: [ // AUTHORITY_HOOK
                "I saw your name in the top {{industry}} rankings recently. It’s clear you have the authority, but is your inquiry system actually matching your status? I help experts automate buyer-capture so they can focus on closing deals and reclaim their time. Open to a quick reply?",
                "You're clearly the expert in {{City}}, but the technical bridge on your profile might be triggering a 'wait' response in prospects rather than a 'book' response. I have a simple blueprint that removes this uncertainty and stabilizes your lead flow. Should I send the link?"
            ]
        };
    }

    generate(subjectObj, context = {}) {
        const id = subjectObj.id || 'H1';
        let pool = this.variations[id] || this.variations['H1'];

        const rawBody = pool[Math.floor(Math.random() * pool.length)];

        const city = context.city || 'your area';
        const name = context.firstName || 'there';
        const sender = context.senderName || 'our team';
        const relation = context.relation || 'brother';
        const postType = context.postType || 'video';

        const greeting = `Hey ${name},\n\n`;
        const bodyContent = rawBody
            .replace(/{{City}}/gi, city)
            .replace(/{{FirstName}}/gi, name)
            .replace(/{{Name}}/gi, name)
            .replace(/{{industry}}/gi, context.industry || 'real estate')
            .replace(/{{relation}}/gi, relation)
            .replace(/{{postType}}/gi, postType);

        return `${greeting}${bodyContent}\n\n-${sender}`;
    }
}

module.exports = BodyEngine;
