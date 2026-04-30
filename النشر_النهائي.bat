@echo off
cls
echo ========================================
echo   جاري تهيئة إعدادات Git ونشر التحديثات...
echo ========================================
echo.

git config --global user.email "admin@bait-al-watan.com"
git config --global user.name "Bait Al-Watan Admin"

git add .
git commit -m "UI Enhancements and Deployment Sync"

echo.
echo جاري الدفع إلى المستودع (Push)...
git push origin HEAD:main -f

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ========================================
    echo   ❌ خطأ: فشلت عملية الرفع إلى GitHub!
    echo   يرجى التأكد من صلاحيات الوصول أو تسجيل الدخول.
    echo ========================================
) else (
    echo.
    echo ========================================
    echo   ✅ تم الرفع بنجاح! Vercel يبني النسخة الآن.
    echo ========================================
)

pause
