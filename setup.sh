set -x
set -e

# we assume that we have a Raspbian system running
# with a user named rdb 

# setup wifi properly
sudo raspi-config nonint do_wifi_country IL
sudo rfkill unblock wifi

# update and upgrade the system
sudo apt-get update
sudo apt-get -y upgrade

# install node.js from nodesource (raspbian has only node 12)
curl -fsSL https://deb.nodesource.com/setup_21.x | sudo -E bash - && sudo apt-get install -y nodejs

# install nginx and dnsmasq
sudo apt-get install -y nginx dnsmasq

# configuration of the system
sudo mv etc.wpa_supplicant.wpa_supplicant.conf /etc/wpa_supplicant/wpa_supplicant.conf
sudo mv etc.nginx.sites-available.default /etc/nginx/sites-available/default
sudo mv etc.dhcpcd.conf /etc/dhcpcd.conf
sudo sed -i 's/#net.ipv4.ip_forward=1/net.ipv4.ip_forward=1/g' /etc/sysctl.conf 
sudo mv etc.dnsmasq.conf /etc/dnsmasq.conf
sudo sed -i 's/#DNSMASQ_EXCEPT="lo"/DNSMASQ_EXCEPT="lo"/g' /etc/default/dnsmasq

# restart services and prepare...
sudo systemctl disable wpa_supplicant
sudo systemctl enable dnsmasq
sudo systemctl restart dnsmasq
sudo service dhcpcd restart
sudo nginx -s reload

wget https://daily-builds.s3.amazonaws.com/RavenDB-6.0.4-raspberry-pi.tar.bz2
tar -xvjf RavenDB-6.0.4-raspberry-pi.tar.bz2
rm RavenDB-6.0.4-raspberry-pi.tar.bz2
mkdir -p data/Databases
sudo mv raspberrypi.stackexchange.com data/Databases
mv settings.json RavenDB/Server/settings.json
RavenDB/install-daemon.sh < /bin/yes


# setup the web app
cd ~/web
npm install
sudo mv web.service /etc/systemd/system/web.service
sudo systemctl enable web
sudo systemctl start web
cd ..

curl 'http://127.0.0.1:8080/admin/databases?name=raspberrypi.stackexchange.com&replicationFactor=1' \
  -X 'PUT' --data-raw '{"DatabaseName":"raspberrypi.stackexchange.com"}'

rm setup.sh # delete self
rm install.txt # delete install instructions

echo "Setup complete!"

# we are done!