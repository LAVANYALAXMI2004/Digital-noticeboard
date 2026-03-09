@echo off
REM Auto-start NGP Notice Board backend with PM2 on system reboot
cd /d "%~dp0digital-noticeboard-backend"
call npx pm2 resurrect
