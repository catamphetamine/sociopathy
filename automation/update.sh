echo "Updating application"
git pull origin
echo "Restarting application"
./stop.sh
./start.sh