# Hugin Appliance Dependencies

- `settings.json` - RavenDB configuration
- `license.json` - RavenDB license
- `ravendb.deb` - RavenDB package
- `hugin.service` - Systemd service file
- `backend/` - Node.js backend application
- `Hugin/` - RavenDB database directory
- `frontend/dist/` - Frontend build location
- `etc.wpa_supplicant.wpa_supplicant.conf` - WiFi configuration
- `etc.nginx.sites-available.default` - Nginx configuration
- `etc.dhcpcd.conf` - DHCP client configuration (loads wpa_supplicant config)
- `etc.dnsmasq.conf` - DNS/DHCP server configuration

## Note
- NetworkManager must be disabled and masked for wpa_supplicant to work correctly in AP mode.