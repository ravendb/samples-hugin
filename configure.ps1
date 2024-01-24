$SERVER_IP = '192.168.1.37'

rsync -avz ./* rdb@192.168.1.37:/home/rdb --exclude configure.sh

ssh rdb@$SERVER_IP sudo bash ./setup.sh