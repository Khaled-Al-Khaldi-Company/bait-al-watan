@echo off
cls
echo ========================================
echo   جاري نشر التحديثات لـ بيت الوطن...
echo ========================================
echo.

git --version >nul 2>&1
if errorlevel 1 (
  echo خطأ: git غير معرف. تأكد من تثبيت Git وإضافته إلى PATH.
  pause
  exit /b 1
)

git status --short >nul 2>&1
if errorlevel 1 (
  echo خطأ: لم يتم العثور على مستودع Git صالح في هذا المجلد.
  pause
  exit /b 1
)

git branch --show-current >current_branch.txt 2>nul
set /p current_branch=<current_branch.txt
del current_branch.txt
if "%current_branch%"=="" (
  echo خطأ: لا يمكن تحديد الفرع الحالي.
  pause
  exit /b 1
)

echo الفرع الحالي: %current_branch%
echo.

git diff --quiet --ignore-submodules
if errorlevel 1 (
  echo توجد تغييرات محلية. جاري الإضافة والكوميت...
  echo.
) else (
  echo لا توجد تغييرات جديدة للنشر.
  pause
  exit /b 0
)

echo أدخل رسالة الكوميت (اتركها فارغة لاستخدام الرسالة الافتراضية):
set /p commit_msg=
if "%commit_msg%"=="" set commit_msg=تحديث سريع للنشر

git add .
git commit -m "%commit_msg%"
git push origin %current_branch%

echo.
echo ========================================
echo   تم الرفع بنجاح! Vercel يبني النسخة الآن.
echo ========================================
pause
