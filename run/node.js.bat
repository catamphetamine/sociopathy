@echo off
title node.js
chcp 65001
rem call coffee.cmd "code/web/main.coffee"
node "c:\work\node-js-development-mode\node-js-development-mode.js" --main-file code/web/main.coffee --coffee-script c:\work\node\coffee-script\bin\coffee --mute
rem node "c:\work\node-js-development-mode\node-js-development-mode.js" --main-file code/web/app.js --files-to-watch "['*.js']"
pause