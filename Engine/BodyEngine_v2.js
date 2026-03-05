class BodyEngine {
    constructor() {
        this.variations = {
            H1: [ // ENGAGEMENT_HOOK (LF8: Social Approval & Superiority)
                "I was looking through the engagement on your {{postType}} yesterday—{{metric}} people responding is a clear indicator that your message is hitting home. However, it triggered a question for me: is that massive reach actually translating into serious inbound inquiries, or are the buyers scrolling past because of a technical 'Logic Leak' on your profile?\n\nI’ve noticed that for top-tier experts in {{City}}, visibility is rarely the problem—it’s the conversion logic. Your current setup is likely causing high-net-worth prospects to 'bounce' because they don't see a clear path to the next step. I have a 90-day system that guarantees to double that exposure while fixing the leak. To make this an easy win, I include high-performance Hooks, Authority Scripts, and Professional Editing as total bonuses to the system. Does the idea of automating your lead flow make sense to you?",
                "Caught your latest {{postType}} and the {{metric}} {{action}} it generated. It’s rare to see that level of social approval in the {{industry}} space. But from my perspective as a growth strategist, I see a missed opportunity. You've spent the time creating content, but the 'digital handshake' at the end of the video is causing a disconnect. It’s like having a crowded storefront with a locked door.\n\nI’m currently helping other pros in {{City}} implement a 90-day view growth system that removes this uncertainty. Because I believe in proving value first, I’ve layered in custom Analysis and Strategic Scripting as bonuses to ensure the system runs itself for you. Sound fair enough?"
            ],
            H2: [ // FOLLOWER_HOOK (LF8: Social Approval & Comfortable Living)
                "I’ve been following your page for a while now, and I genuinely admire the consistency you bring to {{City}}. You’ve built the trust, but there's a subtle 'technical stop sign' on your profile that’s likely causing serious prospects to hesitate right when they’re ready to buy. It’s the difference between being a known expert and being a booked expert.\n\nI specialize in a 90-day visibility system that is proven to 2x your average views—allowing you to reclaim those 10+ hours a week you might be spending manually chasing traffic. To ensure you have zero friction, I’ve bundled in my Authority Editing and Retention Hook framework as free bonuses. I recorded a quick note on where the logic disconnect is on your specific page—want me to send it over?",
                "Hi {{FirstName}}, caught your recent content—I love the clarity you bring to {{industry}}. But as a follower, I noticed that the path from 'watching a video' to 'booking a call' is surprisingly difficult on your profile. This 'Logic Gap' is probably costing you a handful of high-tier deals every month that are slipping through to your competitors.\n\nI’ve developed a 90-day system that guarantees to double your visibility and fix this leak for good. I'm currently offering customized Scripts and Data Analysis as bonuses to help experts like you automate your lead capture. Open to seeing the 2-minute walkthrough?"
            ],
            H3: [ // INVENTORY_HOOK (LF8: Comfortable Living & Survival/Financial)
                "I was searching through your page specifically to find your current inventory, but I found myself struggling to see a clear path to the actual properties. If a serious buyer in {{City}} has to work to find your listings, they’ll almost always just scroll back to their feed. It’s a loss of revenue that’s happening completely in the background.\n\nI fix this friction by implementing a 90-day 'Market Dominance' system that guarantees 2x more views and a frictionless inquiry path. To help you get there faster, I throw in professional Editing and Title Design as bonuses so you can just focus on closing the deals. I’ve mapped out a simple 3-step repair guide for your profile—should I send the link over?",
                "Checking your page for listings today, but I noticed a visible disconnect between your high-quality content and the inventory capture. For someone with your status in {{industry}}, your inquiry path should be an automated machine, not something that requires manual effort. This 'Logic Leak' is likely the only thing standing between you and a predictable scaling of your business.\n\nI guarantee to double your visibility in 90 days using a proven logic-framework. I’m currently providing Hook-Generation and Retention Analysis as bonuses to the system. Does the idea of a hands-off lead capture system make sense to you?"
            ],
            H4: [ // FAMILY_HOOK (LF8: Care for Loved Ones & Social Approval)
                "My {{relation}} actually sent me your video on {{postType}} today—she said your market analysis in {{City}} is some of the most helpful she’s seen. It’s clear you have the status, but when I looked at your profile, I saw a technical mismatch that’s likely causing high-tier followers (like my own family) to hesitate before ever clicking your link.\n\nI help high-level pros like you bridge this gap so they can reclaim their time and spend it with their families instead of chasing leads. I have a 90-day system that guarantees 2x more views, and I’ve layered in custom Scripts and Editing as total bonuses to ensure you don’t have to lift a finger. Should I send the diagnostic I recorded for your page?",
                "My {{relation}} saw your {{postType}} and shared it with me because your clarity on {{industry}} is rare. But from a conversion standpoint, your inquiry path looks like a beginner's setup—which is a total mismatch for an expert of your caliber. It’s likely costing you trust with the exact high-net-worth buyers you're trying to attract.\n\nI’ve mapped out a 90-day repair guide that guarantees to double your views and fix this 'Logic Leak.' To make it an easy decision, I include custom Data Analysis and Hooks as free bonuses. Sound interested in a quick 90-second walkthrough?"
            ],
            H5: [ // AUTHORITY_HOOK (LF8: Superiority & Winning)
                "Saw your name in the rankings recently—it's obvious that authority isn't your issue. But looking at your digital footprint, it seems your 'Inquiry Engine' hasn't quite caught up to your market status yet. You have 10/10 expertise, but a 3/10 digital handshake, which creates an invisible friction point for serious buyers.\n\nI help top-tier experts in {{City}} fix this bottleneck with a 90-day system that guarantees 2x more views. To ensure you stay at the top of the rankings, I provide my entire Hook library and Editing suite as bonuses to the system. I’m sharing this because I find proving value through a solution is the only way to build real trust. Open to seeing the breakdown?",
                "You're clearly the leader in {{industry}} for {{City}}, but even for the best, 'Attention Leaks' are often invisible. Your profile setup is likely causing you to lose 5-10 inquiries every month simply because the conversion logic is dated. It’s essentially a loss of revenue you don't even see happening.\n\nI’ve developed a 90-day system to remove this uncertainty and guarantee a double in visibility. I’m currently bundling in custom Scriptwriting and Authority Analysis as bonuses so you can automate the growth while you focus on winning. Does the idea of a predictable intake system sound fair enough?"
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
        const metric = context.metric || 'serious';
        const action = context.action || 'viewed';

        const greeting = `Hey ${name},\n\n`;
        const bodyContent = rawBody
            .replace(/{{City}}/gi, city)
            .replace(/{{FirstName}}/gi, name)
            .replace(/{{Name}}/gi, name)
            .replace(/{{industry}}/gi, context.industry || 'real estate')
            .replace(/{{relation}}/gi, relation)
            .replace(/{{postType}}/gi, postType)
            .replace(/{{metric}}/gi, metric)
            .replace(/{{action}}/gi, action);

        return greeting + bodyContent + "\n\nBest,\n\n" + sender;
    }
}

module.exports = BodyEngine;
