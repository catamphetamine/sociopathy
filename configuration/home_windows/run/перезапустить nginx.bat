@echo off

set NGINX_DIRECTORY=c:\work\nginx

cd %NGINX_DIRECTORY%
call nginx -s reload