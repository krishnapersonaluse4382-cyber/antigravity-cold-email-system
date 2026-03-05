class SubjectEngine {
    constructor() {
        this.metrics = ["1k", "1.2k", "1.5k", "800+", "2k", "500+", "a lot of"];
        this.actions = ["likes", "saves", "shares", "comments", "views"];
        this.postTypes = ["reel", "video", "post", "story", "listing"];
        this.relations = ["mom", "dad", "sister", "brother", "cousin", "aunt", "husband", "wife"];
        this.inquiryMatches = ["12", "19", "8", "15", "22", "11", "25"];
        this.buyingPhrases = [
            "what houses do you have?",
            "which houses are yours?",
            "what homes are available?",
            "which homes do you list?",
            "what listings do you have?",
            "what properties do you have?",
            "can I tour a listing?",
            "what houses are in inventory?",
            "what homes are in stock?",
            "looking for a place here",
            "are these for sale?",
            "listing question"
        ];

        this.templates = {
            ENGAGEMENT_HOOK: { // Strategy 1: Authority/Curiosity
                id: 'H1',
                subjects: [
                    "{{metric}} views and {{inquiryMatch}} inquiries for {{FirstName}}",
                    "bio-link question for you, {{FirstName}}",
                    "A quick question about your {{industry}} profile, {{FirstName}}",
                    "{{FirstName}}, noticed a gap in your bio",
                    "Thinking about your visibility in {{City}}, {{FirstName}}"
                ],
                previews: ["I was browsing your profile and noticed something important..."]
            },
            FOLLOWER_HOOK: { // Strategy 2: Negative Pull / Leak
                id: 'H2',
                subjects: [
                    "the \"inquiry leak\" on your profile, {{FirstName}}",
                    "{{metric}} views but only {{inquiryMatch}} inquiries, {{FirstName}}?",
                    "the \"visibility leak\" on your page, {{FirstName}}",
                    "{{FirstName}}, you're losing views every month",
                    "That {{postType}} insight for {{FirstName}}"
                ],
                previews: ["I noticed a subtle issue that might be costing you leads..."]
            },
            INVENTORY_HOOK: { // Strategy 3: Future Contrast
                id: 'H3',
                subjects: [
                    "observation on your {{industry}} authority in {{City}}",
                    "{{metric}} views and {{inquiryMatch}} inquiries — exact results, {{FirstName}}",
                    "Expert vs. Salesman disconnect, {{FirstName}}?",
                    "{{FirstName}}, noticed your presence in {{City}}",
                    "Your {{industry}} handshake in {{City}}"
                ],
                previews: ["Caught your latest content and had an observation to share..."]
            },
            FAMILY_HOOK: {
                id: 'H4',
                subjects: [
                    "Hey {{FirstName}}, my {{relation}} liked your video",
                    "My {{relation}} saw your {{postType}}, {{FirstName}}",
                    "{{FirstName}}, my {{relation}} sent me your post"
                ],
                previews: ["One of my family members actually shared your content with me..."]
            },
            AUTHORITY_HOOK: {
                id: 'H5',
                subjects: [
                    "Top {{industry}} work in {{City}}, {{FirstName}}",
                    "{{metric}} views and {{inquiryMatch}} inquiries / results for {{FirstName}}",
                    "{{FirstName}}, your {{industry}} work caught my eye",
                    "A question for the {{industry}} leader in {{City}}"
                ],
                previews: ["Came across your profile while looking for top experts..."]
            }
        };
    }

    generate(type, context = {}) {
        const entry = this.templates[type] || this.templates['FOLLOWER_HOOK'];
        const possibleSubjects = entry.subjects;

        const metric = this.metrics[Math.floor(Math.random() * this.metrics.length)];
        const action = this.actions[Math.floor(Math.random() * this.actions.length)];
        const postType = this.postTypes[Math.floor(Math.random() * this.postTypes.length)];
        const relation = this.relations[Math.floor(Math.random() * this.relations.length)];
        const buyingPhrase = this.buyingPhrases[Math.floor(Math.random() * this.buyingPhrases.length)];
        const inquiryMatch = this.inquiryMatches[Math.floor(Math.random() * this.inquiryMatches.length)];

        const rawSubject = possibleSubjects[Math.floor(Math.random() * possibleSubjects.length)];

        const city = context.city || 'your area';
        const name = context.firstName || 'there';
        const platformTerm = context.platform === 'YouTube' ? 'viewer' : 'follower';

        let subject = rawSubject
            .replace(/{{FirstName}}/gi, name)
            .replace(/{{Name}}/gi, name)
            .replace(/{{City}}/gi, city)
            .replace(/{{platform_term}}/gi, platformTerm)
            .replace(/{{industry}}/gi, context.industry || 'Real Estate')
            .replace(/{{metric}}/gi, metric)
            .replace(/{{action}}/gi, action)
            .replace(/{{postType}}/gi, postType)
            .replace(/{{relation}}/gi, relation)
            .replace(/{{buyingPhrase}}/gi, buyingPhrase)
            .replace(/{{inquiryMatch}}/gi, inquiryMatch);

        if (subject.length > 55) {
            subject = subject.substring(0, 52) + "...";
        }

        return {
            id: entry.id,
            subject: subject,
            preview: entry.previews[Math.floor(Math.random() * entry.previews.length)],
            metric,
            action,
            postType,
            relation,
            inquiryMatch
        };
    }
}

module.exports = SubjectEngine;
