@echo off
echo Testing Backend Server...
echo.
echo Testing health endpoint...
curl http://192.168.100.145:8000/api/health
echo.
echo.
echo If you see JSON response above, backend is working!
echo If you see "Connection refused" or error, backend is not running.
echo.
echo To start backend, run: start-backend.bat
echo.
pause
