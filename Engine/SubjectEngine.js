/**
 * SubjectEngine.js - Multi-Variability Subject Generator
 * Based on Cashvertising principles to maximize open rates and avoid spam finger-printing.
 */
class SubjectEngine {
    constructor() {
        this.templates = {
            // --- INITIAL HOOKS: HIGH VARIABILITY ---
            FOLLOWER_HOOK: { id: 'H1', subjects: ["Quick queston about your {{City}} listing", "Found your profile. Quick question", "Just saw your listing in {{City}}"] },
            FAMILY_HOOK: { id: 'H2', subjects: ["Your YouTube content — a quick thought", "Quick thought on your video strategy", "Loved your recent video. Quick question"] },
            AUTHORITY_HOOK: { id: 'H3', subjects: ["Strategy for your {{City}} listings", "A content specialist's observation", "A quick observation — RE: {{City}}"] },
            CURIOSITY_HOOK: { id: 'H4', subjects: ["Something's missing from your listing?", "Quick q about your video on YouTube", "Are you doing this with your videos?"] },
            RESULT_HOOK: { id: 'H5', subjects: ["I found a gap in your marketing", "How we're boosting views for Realtors", "Video strategy for {{City}} properties"] },

            // --- FOLLOW-UP SEQUENCES ---
            FOLLOWUP_1: { id: 'F1_BUMP', subjects: ["Just bumping this to the top", "Re: Quick question", "Did you see my last email, {{FirstName}}?", "Bringing this back up"] },
            FOLLOWUP_2: { id: 'F2_PROOF', subjects: ["Result from a similar listing", "Case study: 21% more views in 8 days", "Quick update regarding the video strategy", "The social proof I mentioned"] },
            FOLLOWUP_3: { id: 'F3_BREAKUP', subjects: ["One last try...", "Moving on from {{City}}", "Should I take you off the list?", "Final follow-up regarding your content"] }
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
            H1: "Just saw your recent listing and had a quick thought...",
            H2: "I've been following your YouTube channel for a bit now...",
            H3: "I specialize in real estate content and noticed something...",
            H4: "Most realtors in {{City}} are missing this one thing...",
            H5: "We just helped a realtor in a similar market increase views...",
            F1_BUMP: "Just wanted to make sure this didn't get buried in your inbox...",
            F2_PROOF: "I wanted to share exactly what we did for this other property...",
            F3_BREAKUP: "It seems like this isn't a priority for you right now, which is totally fine..."
        };
        return previews[id] || "Quick note for you...";
    }
}

module.exports = SubjectEngine;
