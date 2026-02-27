/**
 * SubjectEngine.js - Cashvertising Edition
 * Generates subject lines that trigger Curiosity and Specificity.
 */

class SubjectEngine {
    constructor() {
        this.socialMediaTypes = ['reel', 'video', 'post', 'profile', 'bio'];
    }

    pickRandom(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    }

    generate(type, data) {
        const name = data.firstName;
        const industry = data.industry || 'Real Estate';
        const city = data.city || 'your area';
        const contentPiece = this.pickRandom(this.socialMediaTypes);

        const templates = {
            'INTERACTION_STATS': [
                { id: 'INTERACTION_STATS_DM', subject: `specfic feedback on your ${city} ${contentPiece}`, preview: "Regarding the lead friction we chatted about" },
                { id: 'INTERACTION_STATS_GENERAL', subject: `observation on your ${industry} content flow`, preview: "Found a technical leak on your profile" }
            ],
            'CLOSE_FRIEND': [
                { id: 'FRIEND_BUSY', subject: `quick question re: your ${city} strategy, ${name}`, preview: "Regarding your current inquiry volume" },
                { id: 'FRIEND_SEE_THIS', subject: `have you looked at these ${city} ${industry} stats?`, preview: "Just saw this and thought of your page" }
            ],
            'ACTIVE_BUYER': [
                { id: 'BUYER_TOUR', subject: `inquiry re: your ${city} listings, ${name}`, preview: "Looking for specific inventory details" },
                { id: 'BUYER_OFF_MARKET', subject: `quick q: do you handle off-market in ${city}?`, preview: "I have a specific requirement for a client" }
            ],
            'CURIOUS_FOLLOWER': [
                { id: 'FOLLOW_FAN', subject: `really liked that last ${contentPiece}, ${name}`, preview: "Specifically the perspective on the ${city} market" },
                { id: 'FOLLOW_STUDY', subject: `analyzed your ${industry} content loop this morning`, preview: "Found something very interesting regarding the lead flow" }
            ],
            'INDUSTRY_AUTHORITY': [
                { id: 'AUTHORITY_RANKING', subject: `congrats on the ${city} authority mention, ${name}`, preview: "You're clearly dominating the ${industry} market" }
            ],
            'FAMILY_BRIDGE': [
                { id: 'FAMILY_HOOK', subject: `partner just flagged your ${contentPiece} to me`, preview: "They thought your ${city} ${industry} strategy was spot on" }
            ]
        };

        const category = templates[type] || templates['CURIOUS_FOLLOWER'];
        return this.pickRandom(category);
    }
}

module.exports = SubjectEngine;
