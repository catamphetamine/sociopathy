@echo off
rem coffee --bare --nodejs code\web\main.coffee
rem node "code/web/main.js"
rem taskkill /f /IM node.exe
rem taskkill /F /FI "WINDOWTITLE eq node.js"
title node.js
call coffee.cmd "code/web/main.coffee"
rem node "code/develop.js"
pause