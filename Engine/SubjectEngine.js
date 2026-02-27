/**
 * SubjectEngine.js - Cashvertising Edition
 * Generates high-open-rate subject lines including "Trusted Referral" and "Follower" hooks.
 */

class SubjectEngine {
    constructor() {
        this.templates = {
            'FOLLOWER_HOOK': [
                { id: 'FOLLOWER_GENERIC', subject: `Hi {{FirstName}}, your viewer/follower here!`, preview: "I've been watching your videos and honestly..." }
            ],
            'FAMILY_HOOK': [
                { id: 'FAMILY_DAD', subject: `Hey {{FirstName}}, My dad liked your video.`, preview: "He actually just flagged your video to me..." }
            ],
            'AUTHORITY_HOOK': [
                { id: 'AUTHORITY_RANKING', subject: `{{FirstName}}, why're you in the best realtor ranking!`, preview: "Saw your name in a recent ranking and..." }
            ]
        };
    }

    pickRandom(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    }

    generate(type, data) {
        const category = this.templates[type] || this.templates['FOLLOWER_HOOK'];
        return this.pickRandom(category);
    }
}

module.exports = SubjectEngine;
