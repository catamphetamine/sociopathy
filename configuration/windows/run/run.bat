@echo off

set here=%~dp0

echo %here%

cd %here%

cd ../../..

start "MongoDB" "%here%mongodb.bat"
start "Redis" "%here%redis.bat"
start "Node.js" "%here%node.js.bat"
call "%here%nginx.bat"
