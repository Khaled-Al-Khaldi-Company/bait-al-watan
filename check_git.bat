@echo off
echo --- GIT REMOTE --- > git_info.txt
git remote -v >> git_info.txt
echo --- GIT BRANCH --- >> git_info.txt
git branch >> git_info.txt
echo --- LAST COMMIT --- >> git_info.txt
git log -1 >> git_info.txt
echo Done. Please send me the content of git_info.txt
pause
