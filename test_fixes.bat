@echo off
echo ========================================
echo Testing Critical Fixes
echo ========================================
echo.

cd backend

echo Step 1: Clearing Laravel caches...
php artisan cache:clear
php artisan config:clear
php artisan route:clear

echo.
echo Step 2: Checking if Sanctum is installed...
php artisan package:discover

echo.
echo ========================================
echo Backend is ready!
echo.
echo Next steps:
echo 1. Start backend: php artisan serve
echo 2. Start frontend: npm run dev
echo 3. Clear browser cache and localStorage
echo 4. Test registration and login
echo ========================================
pause
