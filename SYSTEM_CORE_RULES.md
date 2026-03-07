# 🌟 MASTER SYSTEM SPECIFICATION: COLD EMAIL AUTOMATION (v5.0)
*The Absolute Truth & Definitive Rulebook*

This document consolidates **every constraint, strategy, script, and business protocol** established for the ColdEmailAutomation project. All AI agents MUST read and abide by these rules before executing any generation, logic change, or script build.

---

## 1. THE BUSINESS SYSTEM (The "What We Sell")
Our service runs a **controlled growth system** to double Instagram views in 90 days. **CRITICAL NUANCE:** While the rigid, technical guarantee is exposure, you MUST position the service as something that will **get them buyers and money** (because dominating attention locally leads to revenue). Do not undersell the end result.
*   **The 4 Core Pillars**: Hooks, Scripts, Editing, Analysis. 
*   **The Positioning (CRITICAL RULE)**: We **never** sell individual services like "editing" or "scripting" as the main product. The main product is the **System** (Predictable Growth). Elements like editing, hooks, and analysis must be presented to the prospect as **BONUSES**. This psychologically triggers the perception of getting "more benefits."
*   **Outcome Over Information**: Most creators respect information over attention. We engineer content for *attention, tension, and consequence.* 

---

## 2. COPYWRITING PSYCHOLOGY ("CASHVERTISING" & BELFORT TONES)
The core messaging relies on direct-response principles (Cashvertising LF8 desires) and Jordan Belfort's tonal principles translated to text.
*   **No Technical Jargon Early**: Do not use technical terms in the hook/intro. Build authority by avoiding jargon. Only get technical when precisely naming the fix. 
*   **Prohibited "Salesy" Language**: *Never* use "buy now," "limited time offer," etc. It triggers spam and destroys the "Reasonable Man" and "Sincerity" tone.
*   **Tonal Anchors in Copy**:
    *   *The Reasonable Man*: "Sound fair enough?" "Does the idea make sense to you?"
    *   *The "I Really Want to Know"*: Elicit honest answers regarding pain points.
    *   *Mystery and Intrigue*: Draw the listener in (e.g., "I spotted a specific leak...").

---

## 3. ABSOLUTE OUTREACH PROTOCOLS (The "Assumption Control")
These rules from the `CLIENT OUTREACH INSTRUCTION PROTOCOL` are non-negotiable for any generated copy:
1.  **NO BEHAVIORAL ASSUMPTIONS**: Under no circumstances state, imply, or suggest an action a client is taking unless there is verifiable evidence. 
    *   *DO NOT ASSUME:* What systems they have, how they handle DMs, if they do things manually, or specific operational mistakes.
    *   *WHY:* False specificity destroys credibility and signals manipulation. "I noticed you're manually replying" is prohibited without proof.
2.  **NO FAKING INSIGHT**: Do not invent operational details to sound analytical or urgent. If you don't know, don't claim.
3.  **ALLOWED SPECIFICITY**: You may *only* confidently reference universal, outcome-based business pain points:
    *   Not getting enough buyers or deals.
    *   Attention not converting to revenue.
    *   Burnout from doing everything alone.
    *   Wasted traffic/engagement.

---

## 4. THE INFRASTRUCTURE (LOCAL ONLY)
The system is now **strictly local**. 
*   **[REJECTED]**: GitHub Actions, Cloud Robots, or any server-side automated sending. 
*   **The Engine**: Local execution via `run_scheduler.bat` or manual terminal commands.
*   **The Wake Cycle**: The difference between email sends must be **AT LEAST 15 minutes**.
*   **State Persistence**: State is maintained locally and synced to **Supabase**. Do NOT push state back to GitHub from automated scripts. GitHub is for code storage only.

---

## 5. NON-NEGOTIABLE SAFETY CONSTRAINTS
1.  **Vercel / Supabase Logging Requirements**: 
    *   The **whole report** of each email campaign and every successfully sent email *must* hit the Supabase REST API (the `email_tracker` table) so it reflects properly on the Vercel dashboard. 
    *   **[REJECTED]** `node-fetch`. Use Node's native `https` module.
    *   **[REJECTED]** Passing explicit `email_id` UUIDs. Use the `email` string.
2.  **The "Double-Lock" Duplicate Prevention**: 
    *   Before sending, the script *must physically scan* `leads_tracked.csv`. If the email already has a date in the `p-sent` column, the script **ABORTS** the send. Never spam the client.

---

## 6. EXECUTION & CONTENT PIPELINES
1.  **The Pre-Generation Mandate**: 
    *   **[REJECTED]** Real-time generation. 
    *   The queue must be pre-built in `campaign_queue.json` via `rebuild_exact_queue.js` before executing the schedule.
2.  **Body-Subject Coherence**: 
    *   `BodyEngine.js` must map an "Inquiry" hook straight to "Inquiry" body logic, and "Family" hooks straight to "Family" body contexts. No generic mismatch gaps.
3.  **Data Cleaning**: 
    *   `clean_leads.js` removes "Realtor®", "Group", etc. 
    *   **[REJECTED]** Native `split(',')`. We explicitly use `csv-parse/sync` to handle nested commas in names.
4.  **Email & Subject Line Structures (MANDATORY)**:
    *   All emails and subject lines generated **MUST** adhere to the structures, logic, and reasoning provided in the `email-structures` directory (specifically `high-potential-email-structures/`, `High potential subject lines/`, and `choosen-structures/`). Do not hallucinate generic marketing templates.

---
*Created intentionally to defeat Context Drift. Read this file before executing code.*
