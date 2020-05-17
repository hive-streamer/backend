#!/usr/bin/env sh
nginx -t -c /etc/nginx/nginx.conf > /dev/null 2>&1

if [[ $? != 0 ]]; then
    echo "Error: Nginx's configuration file contains some errors."
    exit 1;
fi

nginx -s reload
