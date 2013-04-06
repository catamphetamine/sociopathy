@echo off

set DIRECTORY=d:\work\redis

rem cd %DIRECTORY%
call %DIRECTORY%\redis-server configuration\windows\redis.conf
