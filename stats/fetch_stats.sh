#!/bin/sh

##
# http://twoalpha.blogspot.com/2007/01/unix-shell-finding-run-time-directory.html
##
dn=`dirname $0`
real_path=`(cd $dn; pwd)`
echo "path = $real_path"


URL="https://chrome.google.com/extensions/detail/iabeihobmhlgpkcgjiloemdbofjbdcic"
tmp_file="chromepage"
records_file="ext_gallery.txt"
curr=`pwd`
curl -o $real_path/$tmp_file $URL


echo `date` >> $real_path/$records_file

awk -f $real_path/stats.awk $real_path/$tmp_file >> $real_path/$records_file
echo "::end::" >> $real_path/$records_file
echo "" >> $real_path/$records_file

rm -rf $real_path/$tmp_file

echo "Stats completed"

exit 0;