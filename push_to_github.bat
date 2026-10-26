@echo off
cd /d "C:\Users\GENERAL EVANS\.gemini\antigravity\scratch\TRENDIE-MODELS-Agency-Platform"
echo ==============================================
echo Pushing Trendie Models updates to GitHub...
echo ==============================================
git add .
git commit -m "update: automated platform and deployment changes"
git push -u origin main
echo ==============================================
echo Successfully pushed to GitHub!
echo ==============================================
pause
