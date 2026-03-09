@echo off
:: Windows Task Scheduler batch for daily crawler
cd /d %~dp0
echo Running daily crawler...
node dailyCrawler.js
