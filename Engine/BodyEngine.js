class BodyEngine {
    constructor() {
        this.templates = {
            SOCIAL_PROOF: [
                "I noticed your reel got 1.2k likes/shares lately — that's exactly the kind of result my clients are seeing with our system: turning raw attention into the kind of dominance that makes you the only choice in {{City}}.\n\nI spent some time this morning looking at your latest market activity. The level of competence you show is clearly high-tier, but I noticed a disconnect in your digital presence which is likely capping your influence and the volume of buyers reaching out to you.\n\nYou have the expertise, but there is a visible friction point in your content that is definitely affecting your reach and the chances of getting more visibility which brings buyers.\n\nWe help businesses like you in fixing the issue of getting more attention to get buyers. Do you want to see the issue so you can fix it to immediately get more reach and maximize your chances of getting buyers with your current setup? Feel free to reply."
            ],
            INQUIRY: [
                "That question — 'which houses are yours' or 'what listings do you have' — is exactly the kind of result my clients are seeing with our system: turning raw visibility into the kind of dominance that makes you the only choice in {{City}}.\n\nI spent some time this morning looking at your latest moves in the Houston market. The level of competence you show is clearly high-tier, but I noticed a disconnect in your digital presence which is likely capping your influence and the volume of buyers reaching out to you.\n\nYou have the expertise, but there is a visible friction point in your content that is definitely affecting your reach and the chances of getting more visibility which brings buyers.\n\nWe help businesses like you in fixing the issue of getting more attention to get buyers. Do you want to see the issue so you can fix it to immediately get more reach and maximize your chances of getting buyers with your current setup? Feel free to reply."
            ],
            FAMILY: [
                "My family member actually sent me your content — and that's exactly the kind of result my clients are seeing with our system: turning raw attention into the kind of dominance that makes you the only choice in {{City}}.\n\nI spent some time this morning looking at your latest moves. The level of competence you show is clearly high-tier, but I noticed a disconnect in your digital presence which is likely capping your influence and the volume of buyers reaching out to you.\n\nYou have the expertise, but there is a visible friction point in your content that is definitely affecting your reach and the chances of getting more visibility which brings buyers.\n\nWe help businesses like you in fixing the issue of getting more attention to get buyers. Do you want to see the issue so you can fix it to immediately get more reach and maximize your chances of getting buyers with your current setup? Feel free to reply."
            ]
        };
    }

    generate(subjectObj, context = {}) {
        const variantKey = subjectObj.id || 'SOCIAL_PROOF';
        let pool = this.templates[variantKey] || this.templates['SOCIAL_PROOF'];
        let rawBody = pool[0];

        const city = context.city || 'your area';
        const name = context.firstName || 'there';
        const sender = context.senderName || 'Krishna';

        let body = rawBody;

        const replacements = [
            { regex: /{{FirstName}}|\[\[firstname}}|{{Name}}|{{firstname}}/gi, value: name },
            { regex: /{{City}}|\[\[city}}|{{city}}/gi, value: city }
        ];

        replacements.forEach(r => {
            body = body.replace(r.regex, r.value);
        });

        return `Hey ${name},\n\n${body}\n\nBest,\n\n${sender}`;
    }
}

module.exports = BodyEngine;