@echo off

set MONGODB_DIRECTORY=e:\work\mongodb

rem set OLDDIR=%CD%

cd %MONGODB_DIRECTORY%
call bin\mongod --rest --bind_ip 127.0.0.1 --port 27017 --dbpath data\db

rem chdir /d %OLDDIR% &rem restore current directory