@echo off
title Content Elevators — Email Scheduler
echo.
echo ==========================================
echo   Content Elevators — Scheduled Emails
echo   24 emails across Krishna / Ryan / Rik
echo ==========================================
echo.
echo This window must stay open for emails to send.
echo Press Ctrl+C at any time to stop gracefully.
echo.
cd /d "c:\Users\praja\.gemini\antigravity\My projects\Primary-Workspace\ColdEmailAutomation"
node schedule_send.js
echo.
echo Done! You can close this window.
pause
