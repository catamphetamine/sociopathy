echo "Updating application"
cd repository
git pull origin
cd ..
echo "Restarting application"
./stop.sh
./start.sh