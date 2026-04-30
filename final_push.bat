@echo off
echo Cleaning up and pushing final updates...
git add .
git reset git_info.txt
git commit -m "Clean push without secrets"
git push origin main
echo DONE! Please check the site in 1 minute.
pause
