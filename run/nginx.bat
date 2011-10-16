rem @echo off

set NGINX_DIRECTORY=c:\work\nginx

set DIRECTORY=%CD%

cd %NGINX_DIRECTORY%

tasklist.exe /V /NH /FI "imagename eq nginx.exe" 2>nul|FIND "INFO: " >nul 2>&1
IF ERRORLEVEL 1 taskkill.exe /T /F /FI "imagename eq nginx.exe" >nul 2>&1

call start nginx

cd %DIRECTORY%