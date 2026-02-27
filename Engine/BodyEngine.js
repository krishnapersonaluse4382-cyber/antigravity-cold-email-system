/**
 * BodyEngine.js - Cashvertising Edition
 * Implements 90-day content loop scaling (Hooks, Scripts, Editing, Analysis).
 */

class BodyEngine {
    constructor() { }

    generate(subjectObj, data) {
        const { firstName, senderName } = data;
        const id = subjectObj.id;

        if (id === 'FOLLOWER_GENERIC') {
            return `Hi ${firstName}, your viewer/follower here!

I’ve been watching your videos and honestly, I’m inspired by the depth you bring to the Real Estate space. But as I was watching your latest one this morning, I noticed a subtle "Attention Leak" that I see even the top 1% making.

It’s the exact reason why most high-level pros stay at their current reach even when their information is gold. Your content is informative, but the brain isn't being "imprisoned" by the hook phase, so people subconsciously scroll before your value even kicks in.

I’ve spent the last year building a 90-day content loop specifically to stop this. It’s a system that combines psychological Hooks, submerged Scripts, and emotional Editing to make sure your expertise translates into the exposure it actually deserves. Usually, this 4-step framework doubles a profile's reach because it stops the viewer from thinking about anything else but your video.

I recorded a 90-second Loom walkthrough of your page showing exactly where that leak is.

Open to seeing it?

Best,
${senderName}`;
        }

        if (id === 'FAMILY_DAD') {
            return `Hey ${firstName},

My dad actually just flagged your video to me. He's a fan, but looking at it from my perspective, I spotted a "Silent Barrier" on your profile that is likely capping your growth.

It’s like having a high-end storefront where the door is accidentally locked. You're sharing incredible value, but the current way your videos are structured is allowing people to tune out. In a market like yours, that’s a lot of potential buyers just walking past your door every single day.

I help people fix this using a 90-day system—Hooks, Scripts, strategic Editing, and deep Analysis. It’s designed to synchronize your expertise with how the human brain actually processes social media, ensuring the exposure you’re currently leaving on the table finally comes back to you as ROI.

I've already mapped out an "Exposure Audit" for your recent videos. Leading with a fix is just my way of proving I can actually deliver.

Should I send the video over?

Best,
${senderName}`;
        }

        if (id === 'AUTHORITY_RANKING') {
            return `Hey ${firstName},

Saw your name in a recent ranking and it caught my eye because you clearly belong at the top. But looking at your content loop, there’s an "Authority Disconnect" happening that most leaders ignore until it's too late.

This is actually the EXACT message my clients are receiving after making one major shift in their content loop. Right now, your videos share great info, but the presentation style says "standard creator" while your actual expertise says "Market Leader." This gap is what stops the algorithm from rewarding you, because the viewers' subconscious sees a mismatch and loses interest.

I help high-level pros bridge this gap in 90 days. We use a specific system of psychological Hooks and Storytelling frameworks to make your visual presence match your actual competence. It's about turning your informative content into an emotional connection that brings in more buyers and doubles your visibility.

I recorded a quick walkthrough for you showing exactly how this shift looks for your page.

Let me know and I'll send it over.

Best,
${senderName}`;
        }

        return `Hey ${firstName}, I recorded a quick 90-second walkthrough for your profile regarding your current video reach. Open to seeing it?`;
    }
}

module.exports = BodyEngine;
