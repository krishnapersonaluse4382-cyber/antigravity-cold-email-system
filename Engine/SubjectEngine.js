/**
 * SubjectEngine.js - Multi-Variability Subject Generator
 * Strategy: High-Personalization, Peer-to-Peer, Friend/Follower Framing
 */
class SubjectEngine {
    constructor() {
        this.metrics = ["1k", "1.2k", "1.5k", "800+", "2k", "500+"];
        this.actions = ["likes", "saves", "shares", "comments", "views"];
        this.postTypes = ["reel", "video", "post", "story", "listing"];
        this.relations = ["mom", "dad", "sister", "brother", "cousin", "aunt", "husband", "wife"];
        this.buyingPhrases = [
            "what houses do you have?",
            "which houses are yours?",
            "what homes are available?",
            "which homes do you list?",
            "what listings do you have?",
            "what properties do you have?",
            "can I tour a listing?",
            "what houses are in inventory?",
            "what homes are in stock?"
        ];

        this.templates = {
            ENGAGEMENT_HOOK: {
                id: 'H1',
                subjects: [
                    "Your {{postType}} got {{metric}} {{action}}, {{FirstName}}",
                    "{{FirstName}}, {{metric}} people {{action}} your {{postType}}",
                    "That {{postType}} got {{metric}} {{action}}, {{FirstName}}"
                ],
                previews: ["I was just browsing and noticed your recent engagement..."]
            },
            FOLLOWER_HOOK: {
                id: 'H2',
                subjects: [
                    "Hi {{FirstName}}, your {{platform_term}} here!",
                    "{{Name}}, I've followed you!",
                    "Your new {{platform_term}} here, {{FirstName}}",
                    "Hi {{Name}}, long time {{platform_term}}!"
                ],
                previews: ["I've been watching your content for a while now..."]
            },
            INVENTORY_HOOK: {
                id: 'H3',
                subjects: [
                    "{{FirstName}}, {{buyingPhrase}}",
                    "{{Name}}, {{buyingPhrase}}"
                ],
                previews: ["I'm curious about the current availability of your properties..."]
            },
            FAMILY_HOOK: {
                id: 'H4',
                subjects: [
                    "Hey {{FirstName}}, my {{relation}} liked your video",
                    "My {{relation}} saw your {{postType}}, {{Name}}",
                    "{{FirstName}}, my {{relation}} sent me your post"
                ],
                previews: ["One of my family members actually shared your content with me..."]
            },
            AUTHORITY_HOOK: {
                id: 'H5',
                subjects: [
                    "{{FirstName}}, why're you in the rankings!",
                    "Best {{industry}} ranking, {{Name}}?",
                    "You're in the top ranking, {{FirstName}}!"
                ],
                previews: ["Came across your name in a recent industry report..."]
            }
        };
    }

    generate(type, context = {}) {
        const entry = this.templates[type] || this.templates['FOLLOWER_HOOK'];
        const possibleSubjects = entry.subjects;

        // Pick random components for maximum variability
        const metric = this.metrics[Math.floor(Math.random() * this.metrics.length)];
        const action = this.actions[Math.floor(Math.random() * this.actions.length)];
        const postType = this.postTypes[Math.floor(Math.random() * this.postTypes.length)];
        const relation = this.relations[Math.floor(Math.random() * this.relations.length)];
        const buyingPhrase = this.buyingPhrases[Math.floor(Math.random() * this.buyingPhrases.length)];

        // Pick random template
        const rawSubject = possibleSubjects[Math.floor(Math.random() * possibleSubjects.length)];

        const city = context.city || 'your area';
        const name = context.firstName || 'there';
        const platformTerm = context.platform === 'YouTube' ? 'viewer' : 'follower';

        let subject = rawSubject
            .replace(/{{FirstName}}/gi, name)
            .replace(/{{Name}}/gi, name)
            .replace(/{{City}}/gi, city)
            .replace(/{{platform_term}}/gi, platformTerm)
            .replace(/{{industry}}/gi, context.industry || 'real estate')
            .replace(/{{metric}}/gi, metric)
            .replace(/{{action}}/gi, action)
            .replace(/{{postType}}/gi, postType)
            .replace(/{{relation}}/gi, relation)
            .replace(/{{buyingPhrase}}/gi, buyingPhrase);

        // Ensure length safety (40 chars)
        if (subject.length > 45) {
            subject = subject.substring(0, 42) + "...";
        }

        return {
            id: entry.id,
            subject: subject,
            preview: entry.previews[Math.floor(Math.random() * entry.previews.length)]
        };
    }
}

module.exports = SubjectEngine;
