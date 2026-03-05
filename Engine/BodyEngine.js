class BodyEngine {
    constructor() {
        this.variations = {
            JORDAN_V1: [ // Bio Gap Variation
                "I noticed a gap in your bio/link this morning — and while it seems small, it's exactly the kind of result my clients are seeing with our system: turning raw attention into the kind of dominance that makes you the only choice in {{City}}.\n\nI spent some time looking at your latest move in the market. The level of competence you show is clearly high-tier, but I noticed a disconnect in your digital presence which is likely capping your influence and the volume of buyers reaching out to you.\n\nYou have the expertise, but there is a visible friction point in your content that is definitely affecting your reach and the chances of getting more visibility which brings buyers.\n\nWe help businesses like you in fixing the issue of getting more attention to get buyers. Do you want to see the issue so you can fix it to immediately get more reach and maximize your chances of getting buyers with your current setup? Feel free to reply."
            ],
            JORDAN_V2: [ // Metric/Result Variation
                "{{FirstName}}, your {{postType}} got {{metric}} shares and {{inquiryMatch}} inquiries — that's exactly the kind of result my clients are seeing with our system by turning raw visibility into the kind of dominance that makes you the only choice in {{City}}.\n\nI spent some time this morning looking at your latest content in the {{City}} market. The level of competence you show is clearly high-tier, but I noticed a disconnect in your digital presence which is likely capping your influence and the volume of buyers reaching out to you.\n\nYou have the expertise, but there is a visible friction point in your content that is definitely affecting your reach and the chances of getting more visibility which brings buyers.\n\nWe help businesses like you in fixing the issue of getting more attention to get buyers. Do you want to see the issue so you can fix it to immediately get more reach and maximize your chances of getting buyers with your current setup? Feel free to reply."
            ],
            JORDAN_V3: [ // Leak/Disconnect Variation
                "I noticed a subtle 'Expert vs Salesman' disconnect on your page — and fixing that one friction point is exactly how my clients turn raw attention into the kind of dominance that makes you the only choice in {{City}}.\n\nI spent some time looking at your profile this morning. The level of competence you show is clearly high-tier, but I noticed a disconnect in your digital presence which is likely capping your influence and the volume of buyers reaching out to you.\n\nYou have the expertise, but there is a visible friction point in your content that is definitely affecting your reach and the chances of getting more visibility which brings buyers.\n\nWe help businesses like you in fixing the issue of getting more attention to get buyers. Do you want to see the issue so you can fix it to immediately get more reach and maximize your chances of getting buyers with your current setup? Feel free to reply."
            ],
            JORDAN_V4: [ // Volume/Dominance Variation
                "Thinking about your volume in the {{City}} market — capturing that attention is exactly the kind of result my clients are seeing with our system: turning raw influence into the kind of dominance that makes you the only choice locally.\n\nI spent some time this morning looking at your latest moves. The level of competence you show is clearly high-tier, but I noticed a disconnect in your digital presence which is likely capping your influence and the volume of buyers reaching out to you.\n\nYou have the expertise, but there is a visible friction point in your content that is definitely affecting your reach and the chances of getting more visibility which brings buyers.\n\nWe help businesses like you in fixing the issue of getting more attention to get buyers. Do you want to see the issue so you can fix it to immediately get more reach and maximize your chances of getting buyers with your current setup? Feel free to reply."
            ],
            JORDAN_V5: [ // Industry Leader Variation
                "I was looking at your {{industry}} work in {{City}} — and while and your work is impressive, fixing your digital presence is exactly the kind of result my clients are seeing: turning raw expertise into the kind of dominance that makes you the only choice locally.\n\nI spent some time this morning looking at your latest moves. The level of competence you show is clearly high-tier, but I noticed a disconnect in your digital presence which is likely capping your influence and the volume of buyers reaching out to you.\n\nYou have the expertise, but there is a visible friction point in your content that is definitely affecting your reach and the chances of getting more visibility which brings buyers.\n\nWe help businesses like you in fixing the issue of getting more attention to get buyers. Do you want to see the issue so you can fix it to immediately get more reach and maximize your chances of getting buyers with your current setup? Feel free to reply."
            ]
        };
    }

    generate(subjectObj, context = {}) {
        const variantKey = subjectObj.id || 'JORDAN_V1';
        let pool = this.variations[variantKey] || this.variations['JORDAN_V1'];
        const rawBody = pool[0];

        const city = context.city || 'your area';
        const name = context.firstName || 'there';
        const sender = context.senderName || 'Krishna';
        const postType = subjectObj.postType || 'reel';
        const metric = subjectObj.metric || '1.1k';
        const inquiryMatch = subjectObj.inquiryMatch || '14';

        let body = rawBody;

        const replacements = [
            { regex: /{{FirstName}}|\[\[firstname}}|{{Name}}|{{firstname}}/gi, value: name },
            { regex: /{{City}}|\[\[city}}|{{city}}/gi, value: city },
            { regex: /{{metric}}/gi, value: metric },
            { regex: /{{inquiryMatch}}/gi, value: inquiryMatch },
            { regex: /{{postType}}/gi, value: postType },
            { regex: /{{industry}}/gi, value: context.industry || 'Real Estate' }
        ];

        replacements.forEach(r => {
            body = body.replace(r.regex, r.value);
        });

        // The user wanted the body to start with the FIRST SENTENCE often mentioning the context.
        // My variations now do that.

        return `Hey ${name},\n\n${body}\n\nBest,\n\n${sender}`;
    }
}

module.exports = BodyEngine;