# Platforms Directory
This directory is used to organize your outreach leads based on their origin platform. 

## Structure
- `/youtube`: Leads scraped from YouTube comments/channels.
- `/linkedin`: Leads from LinkedIn profiles or Sales Navigator.
- `/instagram`: Leads from IG influencer lists or profiles.
- `/facebook`: Leads from FB Groups or Business pages.

## How to use
1. Drop your scraped CSV files into the corresponding platform folder.
2. Ensure the CSV has headers: `Name`, `Email`.
3. You can add optional columns: `Industry`, `City`, `Campaign`.
4. The automation script will pick up these leads and log them specifically under the correct `lead_source` in the Vercel Dashboard.

## Dashboard Correlation
The Refined Dashboard (v2) uses the folder name or the `Source` column to filter statistics by platform, allowing you to see which platform provides the best response rate.
