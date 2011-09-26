@echo off

set MONGODB_DIRECTORY=c:\work\mongodb

rem set OLDDIR=%CD%

cd %MONGODB_DIRECTORY%
call bin\mongod --dbpath data\db

rem chdir /d %OLDDIR% &rem restore current directory