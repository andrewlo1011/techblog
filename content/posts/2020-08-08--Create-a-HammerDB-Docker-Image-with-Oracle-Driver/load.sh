#!/bin/bash
echo $ORACLE_EZCONNECT
echo $SYSTEM_USER
echo $SYSTEM_PASSWORD

sed -i -e "s#ORACLE_EZCONNECT#$ORACLE_EZCONNECT#g" /hammerdb/load.tcl 
sed -i -e "s#SYSTEM_PASSWORD#$SYSTEM_PASSWORD#g" /hammerdb/load.tcl 
sed -i -e "s#SYSTEM_USER#$SYSTEM_USER#g" /hammerdb/load.tcl 

cd /hammerdb
./hammerdbcli auto load.tcl

