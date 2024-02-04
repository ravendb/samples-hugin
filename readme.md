# Hugin - Offline knowledge base appliance using RavenDB

Hugin is an offline knowledge base appliance powered by RavenDB, designed to run on a Raspberry Pi.
It is intended for scenarios where access to information is needed without an internet connection.
Simply plug it into power for immediate usability.

## Getting started

1. Connect to the wireless network using SSID: "Hugin (ravendb)"
2. If you are greeted by a sign-in page, you are done.
3. Point your browser to: http://start.ravendb (note, _not_ https).

## The appliance

### TODO: screen shot here

Using Hugin, you have offline access to the following Stack Exchange communities:

* raspberrypi.stackexchange.com
* unix.stackexchange.com
* serverfault.com

The dataset includes all data up and including Dec 2023 and was taken from: https://archive.org/download/stackexchange

I would like to thank both StackExchange for making this available and the actual users
who posted and answered all those questions.

## How this works?

The appliance runs on Raspberry Pi (typically Zero W, but it can be any modern one).
It uses Raspberry Pi OS (Legacy, 32 bits) Lite as the base image and includes the
RavenDB server, the datasets, and the application for viewing, searching, and using it.

The appliance is running a RavenDB Server and hosts all the data locally for offline  
access as well as the web application to search and view the data.

The appliance functions as WiFi Access Point and accepts incoming connections.
When you connect to the WiFi, it will redirect you to: http://start.ravendb,
which is the landing page of the Hugin web application.
From there you have immediate access to the data and full functionality.

### Connecting directly via SSHA

You can also explore the appliance directly using SSH with the following command:

```
 $ ssh rdb@10.1.1.1
   rdb@10.1.1.1's password: awesome
```

The credentials for the machine are:

* ```Username: rdb```
* ```Password: awesome```

### Internal structure

The appliance comprises two components: 

## todo post 👇

1. Access Point configuration (TODO: See separate post for details) 
2. The application & database itself. You can find the following services running:
    * ```ravendb.serice``` - ```/usr/lib/ravendb/server/Raven.Server```
        * RavenDB binaries
        * Configuration: ```/etc/ravendb/settings.json```
        * Data directory -  ```/var/lib/ravendb/data```
    * ```hugin.serivce``` - ```/usr/lib/hugin```
        * Node.js application