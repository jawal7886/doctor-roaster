@echo off
echo ========================================
echo   Hospital Harmony - Complete Startup
echo ========================================
echo.
echo Starting Backend Server...
echo.
cd backend
start cmd /k "php artisan serve --host=0.0.0.0 --port=8000"
echo.
echo Backend server starting in new window...
echo.
echo ========================================
echo   LOGIN CREDENTIALS
echo ========================================
echo.
echo Email: ajmanrecovery529@gmail.com
echo Password: password123
echo.
echo ========================================
echo.
echo Backend will be available at:
echo http://192.168.100.145:8000
echo.
echo Frontend should be at:
echo http://192.168.100.145:8080
echo.
echo Press any key to close this window...
pause > nul
