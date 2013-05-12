echo "Stopping Redis"
screen -X -S sociopathy.redis quit

echo "Stopping NginX"
screen -X -S sociopathy.nginx quit

echo "Stopping MongoDB"
screen -X -S sociopathy.mongodb quit

echo "Stopping Node.js"
screen -X -S sociopathy.node.js quit