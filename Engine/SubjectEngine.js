/**
 * SubjectEngine.js
 * Generates dynamic, varied, and psychologically grounded subject lines.
 */

class SubjectEngine {
    constructor() {
        this.socialMediaTypes = ['reel', 'video', 'story', 'post'];
        this.interactions = ['likes', 'shares', 'comments', 'saves', 'dms'];
    }

    getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    pickRandom(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    }

    formatNumber(num) {
        if (num >= 1000) {
            return (num / 1000).toFixed(0) + 'k';
        }
        return num.toString();
    }

    generate(type, data) {
        const name = data.firstName;
        const industry = data.industry || 'Real Estate';

        switch (type) {
            case 'INTERACTION_STATS':
                const interaction = this.pickRandom(this.interactions);
                const platformItem = this.pickRandom(this.socialMediaTypes);

                if (interaction === 'dms') {
                    // Specific logic for DMs: "Name, 10 people messaged you"
                    const dmCount = this.getRandomInt(10, 30);
                    return {
                        subject: `${name}, ${dmCount} people messaged you`,
                        preview: "on instagram"
                    };
                }

                const count = this.formatNumber(this.getRandomInt(1000, 5000));
                return {
                    subject: `${name}, your ${platformItem} got ${count} ${interaction}`,
                    preview: `regarding your ${platformItem}`
                };

            case 'BUYER_TOUR':
                const buyerLines = [
                    { subject: `${name}, Can I tour a listing?`, preview: "re: your inventory" },
                    { subject: `${name}, what houses are in your inventory?`, preview: "checking listings" },
                    { subject: `Quick question about that house in your video, ${name}`, preview: "serious inquiry" }
                ];
                return this.pickRandom(buyerLines);

            case 'VIEWER_FOLLOWER':
                const followerLines = [
                    { subject: `Hi ${name}, your viewer/follower here!`, preview: "love your content" },
                    { subject: `Hi ${name}, I've followed you!`, preview: "new fan check-in" },
                    { subject: `Hi ${name}, your new viewer/follower here!`, preview: "on social media" }
                ];
                return this.pickRandom(followerLines);

            case 'RANKING_AUTHORITY':
                return {
                    subject: `${name}, why're you in the best ${industry} ranking!`,
                    preview: "congratulations on the mention"
                };

            case 'FAMILY_HOOK':
                const familyMember = this.pickRandom(['dad', 'brother', 'sister', 'mom', 'business partner']);
                return {
                    subject: `Hey ${name}, My ${familyMember} liked your video.`,
                    preview: "thought I should reach out"
                };

            case 'CLOSE_FRIEND':
                const friendLines = [
                    { subject: `You busy today, ${name}?`, preview: "quick question" },
                    { subject: `Hey ${name}, quick check in`, preview: "regarding your business" },
                    { subject: `${name}, did you see this yet?`, preview: "important update" }
                ];
                return this.pickRandom(friendLines);

            default:
                return {
                    subject: `Quick question, ${name}`,
                    preview: "regarding your content"
                };
        }
    }
}

module.exports = SubjectEngine;
