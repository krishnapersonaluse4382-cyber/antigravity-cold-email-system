/**
 * BodyEngine.js - Cashvertising Edition
 * Implements psychological triggers from Drew Eric Whitman's Cashvertising.
 * Focuses on LF8 (Life-Force 8) and Primary Sales Triggers.
 */

class BodyEngine {
    constructor() {
        this.frameworks = [
            'LF8_SUPERIORITY', // The desire to be winning/better than competitors
            'LF8_FREEDOM_FROM_FEAR', // The desire to stop losing money/leads
            'SECONDARY_EFFICIENCY', // The desire for convenience and time-saving
            'SPECIFIC_REASON_WHY' // Creating instant credibility through logical sequence
        ];
    }

    pickRandom(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    }

    /**
     * Extracts a "Reason Why" that balances effort with observation.
     */
    getBridge(subjectId, industry, city) {
        const bridges = {
            'INTERACTION_STATS_DM': `Your recent posts on ${city} market stats are clearly hitting the mark with the algorithm. I spent a few minutes looking at the "path to inquiry" on your profile, and there's a technical mismatch that's likely making people hesitate right at the final step.`,
            'INTERACTION_STATS_GENERAL': `Caught your latest update on the ${industry} landscape earlier. While the reach you're getting is impressive, I noticed a specific friction point in your bio that usually acts as a silent 'stop sign' for high-intent prospects.`,
            'FOLLOW_STUDY': `I've been observing your content loop for a few days now. You've got the trust-building down, but the transition from 'viewer' to 'lead' feels a bit disjointed compared to the high quality of your actual videos.`,
            'AUTHORITY_RANKING': `Congratulations again on the ${city} authority mention. Now that you have that status, I wanted to share a quick observation on how to actually 'cash in' on that prestige without manually chasing every single comment.`
        };
        return bridges[subjectId] || `The recent expansion of the ${industry} market in ${city} makes your profile a standout, though it looks like there's a specific conversion gap currently capping your potential reach.`;
    }

    generate(subjectObj, data) {
        const { firstName, city, senderName, industry } = data;
        const bridge = this.getBridge(subjectObj.id, industry, city);
        const framework = this.pickRandom(this.frameworks);
        const urgency = this.generateValueAdd(data);

        let mainBody = "";

        // Applying "Cashvertising" Secret #17 (Reason-Why) and Secret #15 (Specificity)
        switch (framework) {
            case 'LF8_SUPERIORITY':
                mainBody = `Most professionals in ${city} rely on 'luck' for their DMs. I've found that by tweaking just one 'Authority Signal' in your content, you can likely shift the perception from 'just another agent' to the only logical choice in the area. It’s a subtle change in how you present your expertise, but the psychological impact on a lead is massive.`;
                break;
            case 'LF8_FREEDOM_FROM_FEAR':
                mainBody = `There’s a technical 'friction point' on your page that’s likely causing a significant portion of your traffic to drop off. It’s not a content issue—it’s a logical gap in how the user is expected to take the next step. I’ve seen this exact pattern before; it basically forces a prospect's brain to stay in 'browsing mode' instead of 'buying mode.'`;
                break;
            case 'SECONDARY_EFFICIENCY':
                mainBody = `I'm a big believer in making the tech do the heavy lifting. Instead of you spending your evening manually triaging basic questions in your DMs, I think a simple 'Content-to-Calendar' bridge would reclaim about 5-10 hours of your week while actually increasing the lead quality.`;
                break;
            case 'SPECIFIC_REASON_WHY':
                mainBody = `Regarding the technical side of your ${industry} reels: The 'Sensory Hooks' are great, but because the link in your bio is so high-friction, I’d estimate you’re losing about half of your potential inbound inquiries. It's a 2-minute fix that shifts the 'work' from the client back onto the system.`;
                break;
        }

        return `Hey ${firstName},

${bridge}

${mainBody}

I recorded a quick 90-second 'Screen Walkthrough' for you. I show exactly where that friction sits on your page and how you can bridge the gap. No sales pitch or discovery call needed—I just thought you'd want to see the data so you can have your team plug that leak.

${urgency}

Best,
${senderName}`;
    }

    generateValueAdd(data) {
        const triggers = [
            `Would you be open to seeing the video? If the timing is off for ${data.industry || 'this'}, no worries at all.`,
            `This is purely a technical observation for your ${data.city || 'local'} market focus. Open to a quick look?`,
            `Feel free to ignore if you're already at 100% capacity, but if you want to plug that leak this afternoon, just let me know.`
        ];
        return this.pickRandom(triggers);
    }
}

module.exports = BodyEngine;
