# скачать и поставить node.js, mongodb
# sudo port install redis
# sudo port install nginx
# sudo launchctl load -w /Library/LaunchDaemons/org.macports.nginx.plist

/home/sociopathy/redis/src/redis-server /home/sociopathy/repository/configuration/neuro/redis.conf &
#nginx &
mongod --dbpath /home/sociopathy/database &
#memcached &
node "/home/sociopathy/repository/node-js-development-mode.js" --main-file /home/sociopathy/repository/code/web/main.coffee --coffee-script "/home/sociopathy/node_modules/coffee-script/bin/coffee" --watch "['/home/sociopathy/repository/code/**/*.js', '/home/sociopathy/repository/code/**/*.coffee']" --options "{ \"server\": \"neuro\" }"
