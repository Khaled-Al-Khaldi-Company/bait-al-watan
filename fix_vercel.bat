@echo off
echo Attempting to push to master branch instead of main...
git checkout -b master
git push origin master
echo If this fails, trying to force push...
git push origin master --force
echo DONE. Please check the link again in 1 minute.
pause
