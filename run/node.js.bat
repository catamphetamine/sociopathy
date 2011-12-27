@echo off
title node.js
rem use utf-8 encoding in console output:
chcp 65001
rem call coffee.cmd "code/web/main.coffee"
node "c:\work\node-js-development-mode\node-js-development-mode.js" --main-file code/web/main.coffee --coffee-script "c:\work\sociopathy\node_modules\coffee-script\bin\coffee" --watch "['code/**/*.js', 'code/**/*.coffee']"
rem node "c:\work\node-js-development-mode\node-js-development-mode.js" --main-file code/web/app.js --files-to-watch "['*.js']"
pause