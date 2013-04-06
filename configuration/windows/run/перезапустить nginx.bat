@echo off

set NGINX_DIRECTORY=d:\work\nginx

cd %NGINX_DIRECTORY%
call nginx -s reload