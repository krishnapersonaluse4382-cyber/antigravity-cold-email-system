class BodyEngine {
    constructor() {
        this.variations = {
            H1: [ // Variation 1: The "Jordan" / Authority Dominance Angle (LF8: Superiority)
                "That's exactly the kind of result my clients are seeing with our system—turning raw attention into the kind of dominance that makes you the only choice in {{City}}.\n\nI spent some time this morning looking at your latest moves. The level of competence you show is clearly high-tier, but I noticed a disconnect in your digital presence which is likely capping your influence and the volume of buyers reaching out to you.\n\nYou have the expertise, but there is a visible friction point in your content that is definitely affecting your reach and the chances of getting more visibility which brings buyers.\n\nWe help businesses like you in fixing the issue of getting more attention to get buyers. Do you want to see the issue so you can fix it to immediately get more reach and maximize your chances of getting buyers with your current setup? Feel free to reply."
            ],
            H2: [ // Variation 2: The "Local Authority" Angle (LF8: Social Approval)
                "This is the exact level of momentum we aim for in the first 30 days—converting raw visibility into being the primary authority in {{City}}.\n\nI caught your latest {{postType}} and while your competence is high-tier, I noticed a subtle 'attention leak' on your profile that's probably limiting the number of high-quality buyers reaching out to you.\n\nYou clearly have the status, but there's a visible friction point in your digital presence that is affecting your reach and the chances of getting more visibility for buyers.\n\nWe help businesses like you in fixing the issue of getting more attention to get buyers. Do you want to see the issue so you can fix it to immediately get more reach and maximize your chances of getting buyers with your current setup? Feel free to reply."
            ],
            H3: [ // Variation 3: The "Inquiry Engine" Angle (LF8: Comfort & Financial Success)
                "Seeing results like {{metric}} shares is exactly what my clients experience—it's a sign that your 'Inquiry Engine' is ready to scale, provided the logic is correct.\n\nI was reviewing your {{industry}} work this morning and although the expertise is obvious, I noticed a disconnect that is likely capping your inbound volume and keeping buyers from contacting you.\n\nYou have the skill, but there is a visible friction point in your content that is definitely affecting your reach and the potential for getting more buyers in {{City}}.\n\nWe help businesses like you in fixing the issue of getting more attention to get buyers. Do you want to see the issue so you can fix it to immediately get more reach and maximize your chances of getting buyers with your current setup? Feel free to reply."
            ]
        };
    }

    generate(subjectObj, context = {}) {
        const variantKey = subjectObj.id || 'H1';
        let pool = this.variations[variantKey] || this.variations['H1'];
        if (variantKey === 'H4' || variantKey === 'H5') pool = this.variations['H1'];
        if (variantKey === 'H2') pool = this.variations['H2'];
        if (variantKey === 'H3') pool = this.variations['H3'];

        const rawBody = pool[0]; // Currently 1 per variant

        const city = context.city || 'your area';
        const name = context.firstName || 'there';
        const sender = context.senderName || 'Krishna';
        const postType = context.postType || 'reel';
        const metric = subjectObj.metric || '1.2k';
        const inquiryMatch = subjectObj.inquiryMatch || '19';

        let body = rawBody;

        const replacements = [
            { regex: /{{FirstName}}|\[\[firstname}}|{{Name}}|{{firstname}}/gi, value: name },
            { regex: /{{City}}|\[\[city}}|{{city}}/gi, value: city },
            { regex: /{{metric}}/gi, value: metric },
            { regex: /{{inquiryMatch}}/gi, value: inquiryMatch },
            { regex: /{{postType}}/gi, value: postType },
            { regex: /{{SenderName}}|{{sender}}/gi, value: sender },
            { regex: /{{industry}}/gi, value: context.industry || 'Real Estate' }
        ];

        replacements.forEach(r => {
            body = body.replace(r.regex, r.value);
        });

        const finalBody = `Hey ${name},\n\n${body}\n\nBest,\n\n${sender}`;
        return finalBody;
    }
}

module.exports = BodyEngine;