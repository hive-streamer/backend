#!/usr/bin/env sh
nginx -t -c /etc/nginx/nginx.conf

if [[ $? != 0 ]]; then 
    echo "Error: Nginx's configuration file contains some errors."
    exit 1; 
fi

nginx -s reload
