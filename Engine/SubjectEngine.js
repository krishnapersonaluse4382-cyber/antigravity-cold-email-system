class SubjectEngine {
    constructor() {
        // EXACT BENCHMARKS from High potential subject lines/Examples/SUBJECT_LINE_BENCHMARKS.md
        this.templates = [
            "Your reel got 1.2k likes, {{FirstName}}",
            "{{FirstName}}, 1k people saved your video",
            "Your story got 800 shares, {{FirstName}}",
            "{{FirstName}}, your post got 1k comments",
            "That video got 2k saves, {{FirstName}}",
            "{{FirstName}}, 1.5k shares on your reel!",
            "1.1k people shared your post, {{FirstName}}",
            "{{FirstName}}, what houses do you have?",
            "{{FirstName}}, which houses are yours?",
            "{{FirstName}}, what homes are available?",
            "{{FirstName}}, which homes do you list?",
            "{{FirstName}}, what listings do you have?",
            "{{FirstName}}, what properties do you have?",
            "{{FirstName}}, can I tour a listing?",
            "Hey {{FirstName}}, my mom liked your video",
            "My dad saw your reel, {{FirstName}}",
            "{{FirstName}}, my cousin sent me your post",
            "Hey {{FirstName}}, my brother follows you",
            "My sister liked your listing, {{FirstName}}",
            "{{FirstName}}, my aunt sent me your video"
        ];
    }

    generate(dummy, context = {}) {
        const raw = this.templates[Math.floor(Math.random() * this.templates.length)];
        const name = context.firstName || 'there';
        const city = context.city || 'your area';

        let subject = raw
            .replace(/{{FirstName}}/gi, name)
            .replace(/{{City}}/gi, city)
            .replace(/{{Name}}/gi, name);

        // Identify the type for BodyEngine coherence
        let id = 'GENERIC';
        if (subject.toLowerCase().includes('likes') || subject.toLowerCase().includes('shares') || subject.toLowerCase().includes('saves') || subject.toLowerCase().includes('comments')) {
            id = 'SOCIAL_PROOF';
        } else if (subject.toLowerCase().includes('houses') || subject.toLowerCase().includes('homes') || subject.toLowerCase().includes('listing') || subject.toLowerCase().includes('tour')) {
            id = 'INQUIRY';
        } else if (subject.toLowerCase().includes('mom') || subject.toLowerCase().includes('dad') || subject.toLowerCase().includes('cousin') || subject.toLowerCase().includes('brother') || subject.toLowerCase().includes('sister') || subject.toLowerCase().includes('aunt')) {
            id = 'FAMILY';
        }

        return {
            id: id,
            subject: subject,
            raw: raw // useful for debugging
        };
    }
}

module.exports = SubjectEngine;
