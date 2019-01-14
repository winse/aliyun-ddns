#!/bin/bash

#curl -o /dev/null -s http://server.domain.com/hack?hostname=foo.bar.com

#set -x

DOMAIN=${1:-foo.bar.com}
#IP=$(curl -sS http://2019.ip138.com/ic.asp | iconv -f gbk -t utf8 | sed -n 's#<center>\(.*\)</center>#\1#p' | grep -Po '\[\K[\d.]+' )
IP=$(curl -sS ip.cip.cc)
#curl -sS "http://127.0.0.1:8080/hack?hostname=$DOMAIN&ip=$IP"

# check
LAST_IP=$( [ -f lastip ] && cat lastip  )
echo $IP |tee lastip
if ! ipcalc -4 -c "$IP" ; then
  echo "bad ipv4: $IP";
  exit;
fi
if [ "$IP" == "$LAST_IP" ] ; then
  exit;
fi

# time
/usr/sbin/ntpdate ntp1.aliyun.com

# server 
DOMAIN="bigvpn.winseliu.com"
bin/alidns.js --host $DOMAIN --ip $IP