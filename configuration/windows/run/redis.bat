@echo off

set DIRECTORY=c:\work\redis

rem cd %DIRECTORY%
call %DIRECTORY%\redis-server configuration\windows\redis.conf
