here="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

cd ..

configuration_folder=`pwd`

configuration=${PWD##*/}

cd ../..

repository=`pwd`

echo "Configuration: $configuration"
echo "Configuration folder: $configuration_folder"

/usr/bin/redis-server $configuration_folder/redis.conf &
/usr/bin/nginx &
/usr/bin/mongod --dbpath ~/database &
#memcached &
/usr/bin/coffee code/web/main.coffee -options "{ \"server\": \"$configuration\" }"
