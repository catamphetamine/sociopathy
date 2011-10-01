@echo off
rem coffee --bare --nodejs code\web\main.coffee
rem node "code/web/main.js"
call coffee.cmd "code/web/main.coffee"
rem node "code/develop.js"
pause