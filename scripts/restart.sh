#!/usr/bin/env sh

# Make sure Nginx configuration file is correct
/usr/sbin/nginx -t -c /etc/nginx/nginx.conf

if [[ $? != 0 ]]; then 
    echo "Error: Nginx's configuration file contains some errors."
    exit 1; 
fi

/etc/init.d/nginx reload

# Make sure Nginx is running or display the error message
if [ -e /var/run/nginx.pid ]; then
    echo "Nginx restarted successfully."
else
    echo "Nginx failed to restart."
    exit 1;
fi