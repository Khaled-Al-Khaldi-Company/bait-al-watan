@echo off
cls
echo ========================================
echo   جاري نشر التحديثات لـ بيت الوطن...
echo ========================================
echo.

git add .
git commit -m "Auto-publish from Desktop Icon"
git push origin main -f

echo.
echo ========================================
echo   تم الرفع بنجاح! Vercel يبني النسخة الآن.
echo ========================================
pause
