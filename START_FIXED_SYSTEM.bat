@echo off
echo ========================================
echo MedScheduler - Starting Fixed System
echo ========================================
echo.

echo Step 1: Clearing Laravel caches...
cd backend
call php artisan cache:clear
call php artisan config:clear
call php artisan route:clear
echo ✓ Caches cleared
echo.

echo Step 2: Checking database...
call php artisan migrate:status
echo.

echo Step 3: Verifying data...
call php artisan tinker --execute="echo 'Users: ' . App\Models\User::count(); echo PHP_EOL; echo 'Accounts: ' . App\Models\Account::count(); echo PHP_EOL; echo 'Departments: ' . App\Models\Department::count();"
echo.

echo ========================================
echo System is ready!
echo ========================================
echo.
echo IMPORTANT: Before testing, please:
echo 1. Clear your browser cache
echo 2. Clear localStorage (F12 > Application > Local Storage > Clear All)
echo 3. Close and reopen your browser
echo.
echo Then start the servers:
echo.
echo Backend:  cd backend && php artisan serve
echo Frontend: npm run dev
echo.
echo See TESTING_GUIDE.md for complete testing instructions
echo See FIXES_SUMMARY.md for what was fixed
echo ========================================
pause
