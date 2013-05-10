$configuration_folder=~/repository/configuration/{configuration_name}

if ! screen -list | grep --quiet "sociopathy.redis"; then
	if ! ps -A | grep --quiet "redis-server"; then
		echo "Starting Redis"
		screen -m -d -t sociopathy.redis -S sociopathy.redis bash -c '/usr/bin/redis-server $configuration_folder/redis.conf'
	else
		echo "Redis is already running. Skipping."
	fi
fi

if ! screen -list | grep --quiet "sociopathy.nginx"; then
	if ! ps -A | grep --quiet "nginx"; then
		echo "Starting NginX. If there are any errors you can see them in /var/log/nginx/error.log"
		screen -m -d -t sociopathy.nginx -S sociopathy.nginx bash -c '/usr/bin/nginx'
	else
		echo "Warning. NginX is already running. You might want to restard NginX manually if you changed NginX-related configuration or if you've just installed this application"
	fi
fi

if ! screen -list | grep --quiet "sociopathy.mongodb"; then
	if ! ps -A | grep --quiet "mongod"; then
		echo "Starting MongoDB"
		screen -m -d -t sociopathy.mongodb -S sociopathy.mongodb bash -c '/usr/bin/mongod --dbpath ~/database'
	else
		echo "Mongodb is already running. Skipping."
	fi
fi

if ! screen -list | grep --quiet "sociopathy.node.js"; then
	echo "Starting Node.js"
	screen -m -d -t sociopathy.node.js bash -S sociopathy.node.js bash -c 'forever --pidFile ~/processes/node.js.pid -c coffee ~/repository/code/web/main.coffee options "{ \"server\": \"configuration_name\" }"'
fi