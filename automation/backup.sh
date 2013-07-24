#!/bin/bash
#
Now=$(date +"%d.%m.%Y")
Archive="database_($Now).tar.gz"
#
cd ~
tar czvf $Archive database
mv $Archive database_backup/
#
# delete old backups
Expiration_days=14
find database_backup -type f -mtime "+$Expiration_days" -exec rm {} \;
