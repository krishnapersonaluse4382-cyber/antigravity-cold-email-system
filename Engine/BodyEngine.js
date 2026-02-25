/**
 * BodyEngine.js
 * Implements the "Persuive, Non-Salesy, Authoritative" frameworks.
 */

class BodyEngine {
    constructor() {
        this.lf8 = {
            STATUS: "be the person every seller calls first in {{city}}",
            SECURITY: "stop worrying about where your next listing is coming from",
            SUCCESS: "dominating the local market while others are still cold calling",
            FREEDOM: "getting your weekends back because the system does the lifting"
        };
    }

    pickRandom(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    }

    generate(type, data) {
        const { firstName, city, senderName, industry } = data;
        const urgency = this.generateUrgency(data);

        switch (type) {
            case 'ANSWERS_DRIVEN':
                return `Hey ${firstName},

Quick observation — most ${industry} pros in ${city || 'your area'} are struggling with the "Invisible Expert" problem. They have the skill, but the local market doesn't see it.

It's usually just a gap in the delivery system, not the service itself. I put together a quick breakdown on how to fix that specific bottleneck in the next 14 days without hiring a massive agency.

${urgency}

Best,
${senderName}`;

            case 'RESULT_DRIVEN':
                return `Hi ${firstName},

I was looking at the data for ${industry} growth this quarter. Statistically, agents who switch to a "Visual First" strategy are seeing 3.4x more inbound inquiries compared to standard Zillow leads.

We aim for realistic transformations — getting a system that pays for itself in 90 days or less. No fluff, just hard numbers on how much exposure you're leaving on the table.

${urgency}

Cheers,
${senderName}`;

            case 'VISUAL_IMAGERY':
                return `Hey ${firstName},

Imagine waking up on a Monday morning to 3 new "Can we talk?" messages sitting in your inbox — without you having to touch a single phone or send a cold text.

Picture your phone buzzing with notifications from local buyers who already feel like they know, like, and trust you because they've been seeing your face and your expertise on their feed all week. 

It makes the actual sales part feel like a friendly conversation rather than a pitch.

${urgency}

Regards,
${senderName}`;

            case 'APPOINTMENT_TYPE':
                return `Hi ${firstName},

I'm reaching out because I'm looking to coordinate a few brief walkthroughs for next week.

I've developed a specific framework for ${industry} professionals to automate their authority building. I wanted to see if your schedule allows for a 10-minute "Sync" to see if this fits your current expansion goals for 2026.

I'm not looking for a sales call — just a quick diagnostic to see if we can solve that content bottleneck for you.

${urgency}

${senderName}`;

            default:
                return `Hi ${firstName}, just checking in about your ${industry} projects.`;
        }
    }

    generateUrgency(data) {
        const triggers = [
            `Since this involves custom research for each client and we actually generate the leads ourselves, I can only work with 3 people at a time to maintain the quality. If getting a separate source of income without your major involvement isn't a priority, feel free to ignore.`,
            `Because I'm currently setting up the infrastructure for two other firms in ${data.city || 'this region'}, I have one opening left for a project starting on Monday. I'd hate for you to miss the seasonal uptick while your competitors are already onboarding.`,
            `We've seen that the "early mover" advantage in ${data.industry || 'this space'} closes fast once a specific neighborhood gets saturated. I can only offer this to one person per zip code to avoid competing with myself.`
        ];
        return this.pickRandom(triggers);
    }
}

module.exports = BodyEngine;
