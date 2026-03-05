class BodyEngine {
    generate(subjectObj, context = {}) {
        const name = context.firstName || 'there';
        const senderName = context.senderName || 'Krishna';
        const type = subjectObj.id;

        let hook = "";
        if (type === 'SOCIAL_PROOF') {
            hook = `That's exactly the kind of result my clients are seeing with our system—turning raw attention into the kind of dominance that makes you the only choice in your area.`;
        } else if (type === 'INQUIRY') {
            hook = `Thinking about your volume in the Houston market—capturing that attention is exactly the kind of result my clients are seeing with our system—turning raw attention into the kind of dominance that makes you the only choice in your area.`;
        } else if (type === 'FAMILY') {
            hook = `What I shared with my mom this morning—capturing that attention is exactly the kind of result my clients are seeing with our system—turning raw attention into the kind of dominance that makes you the only choice in your area.`;
        } else {
            hook = `That's exactly the kind of result my clients are seeing with our system—turning raw attention into the kind of dominance that makes you the only choice in your area.`;
        }

        const body = `Hey ${name},

${hook}

I spent some time this morning looking at your latest moves in the Houston market. The level of competence you show is clearly high-tier, but I noticed a disconnect in your digital presence which is likely capping your influence and the volume of buyers reaching out to you.

You have the expertise, but there is a visible friction point in your content that is definitely affecting your reach and the chances of getting more visibility which brings buyers.

We help businesses like you in fixing the issue of getting more attention to get buyers. Do you want to see the issue so you can fix it to immediately get more reach and maximize your chances of getting buyers with your current setup? Feel free to reply.

Best,

${senderName}`;

        return body;
    }
}

module.exports = BodyEngine;