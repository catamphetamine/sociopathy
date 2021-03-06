# sudo port install redis
# sudo port install nginx
# sudo launchctl load -w /Library/LaunchDaemons/org.macports.nginx.plist

cd ../../..

/opt/local/bin/redis-server configuration/home_osx/redis.conf &
/opt/local/sbin/nginx &
~/work/mongodb/bin/mongod --dbpath ~/work/sociopathy_data/database &
memcached &
node "/Users/kuchumovn/work/code/node-js-development-mode.js" --main-file code/web/main.coffee --coffee-script "node_modules/coffee-script/bin/coffee" --watch "['code/**/*.js', 'code/**/*.coffee']" --options "{ \"server\": \"mac\" }"
