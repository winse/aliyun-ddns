#!/bin/bash

#curl -o /dev/null -s http://server.domain.com/hack?hostname=foo.bar.com

DOMAIN=${1:-foo.bar.com}
IP=$(curl -sS http://2018.ip138.com/ic.asp | iconv -f gbk -t utf8 | sed -n 's#<center>\(.*\)</center>#\1#p' | grep -Po '\[\K[\d.]+' )
#curl -sS "http://127.0.0.1:8080/hack?hostname=$DOMAIN&ip=$IP"
bin/alidns.js --host $DOMAIN --ip $IP
