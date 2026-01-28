@echo off
cd /d "%~dp0"
echo Starting ChromaNotes...
echo Opening http://localhost:3000
start http://localhost:3000
npm run dev
pause
