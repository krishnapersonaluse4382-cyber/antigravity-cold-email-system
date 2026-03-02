/**
 * SubjectEngine.js - Multi-Variability Subject Generator
 */
class SubjectEngine {
    constructor() {
        this.templates = {
            // --- INITIAL HOOKS: HIGH VARIABILITY ---
            FOLLOWER_HOOK: { id: 'H1', subjects: ["Hi {{FirstName}}, your viewer/follower here!", "This one thing is killing your business"] },
            FAMILY_HOOK: { id: 'H2', subjects: ["Hi {{FirstName}}, your viewer/follower here!", "This one thing is killing your business"] },
            AUTHORITY_HOOK: { id: 'H3', subjects: ["Hi {{FirstName}}, your viewer/follower here!", "This one thing is killing your business"] },

            // --- FOLLOW-UP SEQUENCES ---
            FOLLOWUP_1: { id: 'F1_BUMP', subjects: ["Did you see what you posted, {{FirstName}}?", "{{FirstName}}, Can I tour a listing?"] },
            FOLLOWUP_2: { id: 'F2_PROOF', subjects: ["Still thinking about solving your problem...", "Last email"] },
            FOLLOWUP_3: { id: 'F3_BREAKUP', subjects: ["Final follow-up regarding your content"] }
        };
    }

    /**
     * @param {string} type - e.g., 'FOLLOWER_HOOK', 'FOLLOWUP_1'
     * @param {object} context - { firstName, city, industry }
     */
    generate(type, context = {}) {
        const entry = this.templates[type] || this.templates['FOLLOWER_HOOK'];
        const possibleSubjects = entry.subjects || ["Quick question"];

        // Pick one at random for maximum variability
        const rawSubject = possibleSubjects[Math.floor(Math.random() * possibleSubjects.length)];

        const city = context.city || 'your area';
        const name = context.firstName || 'there';

        const subject = rawSubject
            .replace(/{{City}}/gi, city)
            .replace(/{{FirstName}}/gi, name)
            .replace(/{{Name}}/gi, name);

        return {
            id: entry.id,
            subject: subject,
            preview: this._getPreview(entry.id)
        };
    }

    _getPreview(id) {
        const previews = {
            H1: "I've been following your recent updates...",
            H2: "I've been following your recent updates...",
            H3: "I've been following your recent updates...",
            F1_BUMP: "Just floating this to the top of your inbox...",
            F2_PROOF: "I know you're busy touring listings..."
        };
        return previews[id] || "Quick note for you...";
    }
}

module.exports = SubjectEngine;
