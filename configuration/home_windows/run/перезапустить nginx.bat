@echo off

set NGINX_DIRECTORY=e:\work\nginx

cd %NGINX_DIRECTORY%
call nginx -s reload