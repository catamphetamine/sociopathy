#######################################
#                Install the required software
#######################################
#
# install Git
#
apt-get install git
#
# install Node.js
#
apt-get install software-properties-common
apt-get install python-software-properties python g++ make
add-apt-repository ppa:chris-lea/node.js
apt-get update
apt-get install nodejs
#
# install NginX
#
nginx=stable # use nginx=development for latest development version
add-apt-repository ppa:nginx/$nginx
apt-get update 
apt-get install nginx
#
# install ImageMagick
#
apt-get install imagemagick
#
# install MongoDB
#
apt-key adv --keyserver keyserver.ubuntu.com --recv 7F0CEB10
echo "deb http://downloads-distro.mongodb.org/repo/ubuntu-upstart dist 10gen" >> /etc/apt/sources.list
apt-get update
apt-get install mongodb-10gen=2.2.3
#
# install Redis
#
apt-get install redis-server
#
#######################################
#                     Post-installation
#######################################
#
# create the user
#
sociopathy_user_password=
#
echo "Enter the password for user sociopathy" 
read sociopathy_user_password
#
if [ -z "$sociopathy_user_password" ]; then
    echo "You haven't entered password for user sociopathy. Aborting."
		exit 1
fi
#
useradd -m sociopathy -p=$sociopathy_user_password
#
usermod -s /bin/bash sociopathy
#
adduser sociopathy sudo
sudo su sociopathy
cd ~
#
echo "Default port usage:"
#
echo "8080 (backend):"
netstat -antp | grep 8080
#
echo "8081 (frontend):"
netstat -antp | grep 8081
#
echo "8091 (upload server):"
netstat -antp | grep 8091
#
# install some of the required Node.js packages
#
npm install coffee-script
npm install sync
#
# copy the files
#
# clone only the most recent revision
git clone --depth=1 git://github.com/kuchumovn/sociopathy.git repository
#
# maybe redirect all the logs to this folder
#
mkdir logs
#
# this is the database
#
mkdir database
#
# it needs to be backed up daily
#
backup_script=/etc/cron.daily/backup_sociopathy_database.sh
echo $sociopathy_user_password | sudo -S cp repository/automation/backup.sh $backup_script
echo $sociopathy_user_password | sudo -S chmod +x $backup_script
#
# now you need to create your own configuration files (default settings will do for Ubuntu)
#

configuration_name=my

#echo "#########################################"

#read -p "What will be your configuration name? " -e configuration_name

#if [ -z "$configuration_name" ]; then
#    echo "You haven't entered your configuration name. Defaulting to 'my_server'"
#fi

dummy_configuration=ubuntu

if [ -d "repository/configuration/$configuration_name" ]; then
	echo "The \"my\" configuration already exists. What will be your new configuration name?"
	read configuration_name
	
	if [ -z "$configuration_name" ]; then
	    echo "You haven't entered your configuration name. Aborting."
		exit 1
	fi
fi

if [[ "$configuration_name" != "$dummy_configuration" ]]; then
	cp --recursive repository/configuration/$dummy_configuration repository/configuration/$configuration_name
fi

#echo ""
#echo "You may now edit your configuration files"
#echo "located in the '/home/sociopathy/repository/configuration/$configuration_name' folder"

#read -p "Hit any key to continue" -e nothing

#
# now you need to tell NginX to include your enginex.conf file from you configuration folder
#
# 1) open the /etc/nginx/nginx.conf file
# 2) find the following line: "include /etc/nginx/sites-enabled/*;"
# 3) insert line "include /home/sociopathy/repository/configuration/[your configuration name]/enginex.conf;" before the previoiusly found line
#
# for the sed command explanation read
# http://stackoverflow.com/questions/6739258/how-do-i-add-a-line-of-text-to-the-middle-of-a-file-using-bash
#

nginx_configuration=/etc/nginx/nginx.conf

# currently not working
nginx_configuration_already_patched=
#nginx_configuration_already_patched=`cat $nginx_configuration | grep "\"/home/sociopathy/repository/configuration/$configuration_name/enginex.conf\";"`

if [[ "$nginx_configuration_already_patched" == "" ]]; then
sudo sed -i -n "H;\${x;s/include \/etc\/nginx\/sites-enabled\/\*;\n/include \"\/home\/sociopathy\/repository\/configuration\/$configuration_name\/enginex.conf\";\n\t\
&/;p;}" $nginx_configuration
else
	echo "NginX configuration already patched"
fi

#
# to add NginX to autostart see
# http://www.discoded.com/2012/05/22/autostart-nginx-under-ubuntu-linux/
#

echo "You can check NginX errors by viewing the '/var/log/nginx/error.log' file"

echo "The installation is mostly complete. Check the output for signs of any possible errors. See the 'documentation/installing.txt' file for further instructions. Hit any key to continue"
read nothing