configuration_folder="~/repository/configuration/{configuration_name}"

if ! screen -list | grep --quiet "sociopathy.redis"; then
	if ! ps -A | grep --quiet "redis-server"; then
		echo "Starting Redis"
		screen -S sociopathy.redis -d -m bash -c '/usr/bin/redis-server $configuration_folder/redis.conf'
	else
		echo "Redis is already running. Skipping."
	fi
fi

if ! screen -list | grep --quiet "sociopathy.nginx"; then
	if ! ps -A | grep --quiet "nginx"; then
		echo "Starting NginX. If there are any errors you can see them in /var/log/nginx/error.log"
		screen -S sociopathy.nginx -d -m bash -c '/usr/bin/nginx'
	else
		echo "Warning. NginX is already running. You might want to restard NginX manually if you changed NginX-related configuration or if you've just installed this application."
	fi
fi

if ! screen -list | grep --quiet "sociopathy.mongodb"; then
	if ! ps -A | grep --quiet "mongod"; then
		echo "Starting MongoDB"
		screen -S sociopathy.mongodb -d -m bash -c '/usr/bin/mongod --dbpath ~/database'
	else
		echo "Mongodb is already running. Skipping."
	fi
fi

if ! screen -list | grep --quiet "sociopathy.node.js"; then
	echo "Starting Node.js"
	screen -S sociopathy.node.js -d -m bash -c 'forever --pidFile ~/processes/node.js.pid -c coffee ~/repository/code/web/main.coffee options "{ \"server\": \"{configuration_name}\" }"'
else
	echo "Node.js is already running. Skipping."
fi