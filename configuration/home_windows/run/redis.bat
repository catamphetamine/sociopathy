@echo off

set DIRECTORY=c:\work\redis

rem cd %DIRECTORY%
call %DIRECTORY%\redis-server configuration\home_windows\redis.conf
