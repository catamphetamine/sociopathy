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
adduser sociopathy sudo
sudo --user sociopathy
#cd /home/sociopathy
#sudo -u sociopathy
#
# install some of the required Node.js packages
#
pwd
cd ~
npm install coffee-script
npm install sync
#
# copy the files
#
git clone git://github.com/kuchumovn/sociopathy.git repository
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
sudo cp repository/automation/backup.sh $backup_script
sudo chmod +x $backup_script
#
# now you need to create your own configuration files (default settings will do for Ubuntu)
#
echo "#########################################"

read -p "What will be your configuration name? " -e configuration_name

if [ -z "$configuration_name" ]; then
    echo "You haven't entered your configuration name. Defaulting to 'my_server'"
fi

dummy_configuration=ubuntu

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

sudo sed -n 'H;${x;s/include \/etc\/nginx\/sites-enabled\/\*;\n/include \/home\/sociopathy\/repository\/configuration\/$configuration_name\/enginex.conf;\
&/;p;}' /etc/nginx/nginx.conf

#
# you can also add NginX to autostart
# http://www.discoded.com/2012/05/22/autostart-nginx-under-ubuntu-linux/
#

echo "You can check NginX errors by viewing the '/var/log/nginx/error.log' file"

read -p "The installation is mostly complete. Check the output for signs of any possible errors. See the 'documentation/installing.txt' file for further instructions. Hit any key to continue" -e nothing