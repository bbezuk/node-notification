node-notification
=================

Part of node/socket.io framework to enable real time push notifications for web application

Framework given is composed from client javascript, run from browser, and server node.js (http://nodejs.org/ , tested with node 0.6.X version)
script that proxied behind ngnix script.

Purpose of this repository is to show straightforward and elegant code framework that can handle multiple concurrent subscriptions from clients, and 
use variant of push notifications on web applications.

It has been tested in production with moderate usage over extensive periods of time

Also included is ngnix configuration file, modified so it can serve as proxy for websocket protocol, note: ngnix must be built with tcp_proxy module

TODO::

Test multiple connections and updates 
Add more error testing