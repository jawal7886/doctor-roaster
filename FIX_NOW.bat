@echo off
color 0A
cls
echo ================================================================================
echo                    HOSPITAL HARMONY - BACKEND STARTUP
echo ================================================================================
echo.
echo This will start the Laravel backend server on port 8000
echo.
echo IMPORTANT: Keep this window OPEN while using the application!
echo.
echo ================================================================================
echo.
echo Starting backend server...
echo.
cd backend
php artisan serve --host=0.0.0.0 --port=8000
