# PC Hand-Off & Execution Guide

## Context for the AI
**DO NOT SCAN UNRELATED FILES.** We are executing a 3-email dry run for the Cold Email Automation system.
The previous session already finalized the email copies in `Engine/SubjectEngine.js` and `Engine/BodyEngine.js`, and updated `cloud_send.js` to run a strict 3-email test (1 per account: Krishna, Ryan, Rik) with exactly 5 minutes of wait time between them. 
The manual kill-switch in `cloud_send.js` has been removed.

## What the AI needs to do NOW:
The user is ready to run the test from this PC. 
1. **Verify Credentials:** The user needs to run the script. Ask the user if they want to run it via the terminal using `node cloud_send.js`.
2. **Environment Variables:** Remind the user that they will need the passwords (`KRISHNA_PASS`, `RYAN_PASS`, `RIK_PASS`, `SUPABASE_ANON_KEY`) in their local `.env` file since they are running it locally, OR they can trigger the GitHub Action manually from the GitHub website to let the server run it using Secrets.
3. If they run it locally, assist them with executing `node cloud_send.js` in the `ColdEmailAutomation` folder. 
4. **Goal:** Ensure exactly 3 initial emails (p-sent) go out (or are logged to Supabase if Nodemailer is still mocked), and ensure there are no duplicates.
