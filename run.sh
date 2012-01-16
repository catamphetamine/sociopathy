# скачать и поставить node.js, mongodb
# sudo port install redis
# sudo port install nginx
# sudo launchctl load -w /Library/LaunchDaemons/org.macports.nginx.plist

/opt/local/bin/redis-server redis.conf
/opt/local/sbin/nginx
../mongodb/bin/mongod --dbpath ../mongo_database
memcached
node "../node-js-development-mode.js" --main-file code/web/main.coffee --coffee-script "node_modules/coffee-script/bin/coffee" --watch "['code/**/*.js', 'code/**/*.coffee']" --options "{ \"server\": \"grimbit\" }"
