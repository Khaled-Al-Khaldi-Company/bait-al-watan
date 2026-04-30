@echo off
cls
echo ========================================
echo   جاري تهيئة إعدادات Git ونشر التحديثات...
echo ========================================
echo.

git config --global user.email "admin@bait-al-watan.com"
git config --global user.name "Bait Al-Watan Admin"

git add .
git commit -m "Enhance Project Details Page and Fix Math"
git push origin HEAD:main -f

echo.
echo ========================================
echo   تم الرفع بنجاح! Vercel يبني النسخة الآن.
echo ========================================
pause
