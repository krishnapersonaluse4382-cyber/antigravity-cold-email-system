class SubjectEngine {
    constructor() {
        this.metrics = ["1.1k", "1.4k", "2.1k", "900+", "1.8k", "3.2k"];
        this.inquiryMatches = ["14", "18", "9", "21", "25", "11"];
        this.postTypes = ["reel", "video", "post"];

        this.templates = [
            {
                id: 'JORDAN_V1',
                subjects: ["{{FirstName}}, noticed a gap in your bio", "bio-link question for you, {{FirstName}}"],
            },
            {
                id: 'JORDAN_V2',
                subjects: ["{{FirstName}}, your {{postType}} got {{metric}} shares", "{{metric}} views and {{inquiryMatch}} inquiries for {{FirstName}}"],
            },
            {
                id: 'JORDAN_V3',
                subjects: ["Expert vs Salesman disconnect, {{FirstName}}?", "The \"visibility leak\" on your page, {{FirstName}}"],
            },
            {
                id: 'JORDAN_V4',
                subjects: ["Thinking about your volume in {{City}}, {{FirstName}}", "{{FirstName}}, your dominance in {{City}}"],
            },
            {
                id: 'JORDAN_V5',
                subjects: ["A quick question about your {{industry}} profile, {{FirstName}}", "Regarding your {{industry}} work in {{City}}, {{FirstName}}"]
            }
        ];
    }

    generate(type, context = {}) {
        // We pick a random template from our 5 Jordan Variations
        const template = this.templates[Math.floor(Math.random() * this.templates.length)];
        const rawSubject = template.subjects[Math.floor(Math.random() * template.subjects.length)];

        const metric = this.metrics[Math.floor(Math.random() * this.metrics.length)];
        const inquiryMatch = this.inquiryMatches[Math.floor(Math.random() * this.inquiryMatches.length)];
        const postType = this.postTypes[Math.floor(Math.random() * this.postTypes.length)];
        const city = context.city || 'your area';
        const name = context.firstName || 'there';

        let subject = rawSubject
            .replace(/{{FirstName}}/gi, name)
            .replace(/{{City}}/gi, city)
            .replace(/{{industry}}/gi, context.industry || 'Real Estate')
            .replace(/{{metric}}/gi, metric)
            .replace(/{{inquiryMatch}}/gi, inquiryMatch)
            .replace(/{{postType}}/gi, postType);

        return {
            id: template.id,
            subject: subject,
            metric,
            inquiryMatch,
            postType
        };
    }
}

module.exports = SubjectEngine;
