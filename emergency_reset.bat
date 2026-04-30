@echo off
echo [1/4] Fetching latest state from GitHub...
git fetch origin
echo [2/4] Resetting local branch to match GitHub...
git reset --mixed origin/main
echo [3/4] Re-adding only code changes (Fixed paths)...
git add src/
git add prisma/
git add package.json
git add public/
echo [4/4] Committing and pushing clean version...
git commit -m "Final clean deployment with fixed syntax"
git push origin main --force
echo ===========================================
echo ALL DONE! This should definitely build successfully now.
echo ===========================================
pause
