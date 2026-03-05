# JORDAN BETA 9 — ACTIVE CAMPAIGN QUEUE
1. GOAL: Send 9 emails (3 per account) from Index #96.
2. CURRENT STATUS: Email #1 (Krishna → Jullian) has been successfully sent.
3. NEXT STEPS: Email #2 (Ryan → Yessica) is scheduled for Friday 03:15 AM.
4. AUTOMATION: The GitHub Action `Send Cold Emails` is configured with an hourly cron (`30 * * * *`). It will automatically wake up every hour, check `campaign_queue.json`, and send anything whose `sendAt` has passed.
5. TRACKING: Sent emails are recorded in `leads_tracked.csv` and logged to the Vercel dashboard as "Jordan Beta 9".

### COMPLETED:
- [x] #1 Jullian (Krishna) - Sent Thu 11:15 pm

### UPCOMING:
- [ ] #2 Yessica (Ryan) - Fri 03:15 am
- [ ] #3 Beau (Rik) - Fri 09:30 am
- [ ] #4 Angela (Krishna) - Fri 11:30 am
- [ ] #5 Lynn (Ryan) - Fri 04:30 pm
- [ ] #6 Angelica (Rik) - Fri 10:30 pm
- [ ] #7 Lisa (Krishna) - Sat 09:30 am
- [ ] #8 Brittany (Ryan) - Sat 02:30 pm
- [ ] #9 Emilio (Rik) - Sat 07:30 pm
