# 
#  build_and_compress.sh
#  bitly_chrome_extension
#  
#  Created by gregory tomlinson on 2011-04-08.
#  Copyright 2011 the public domain. All rights reserved.
# 

#TODO make this the $2 arg, test for exisitence, use default if none
COMPILER="~/bin/closure_compiler.jar"
HOST_FILES="manifest.json"
CWD=`pwd`
HTML_BASE="${CWD}/../src"
KEY=$1
CRX_UPDATE_URL="http://greg.ec2.bitly.net/chrome/bitly_chrome.crx"
CRX_XMLPATH="http://greg.ec2.bitly.net/chrome/update.xml"
CRX_APPID="ehmcgdhfbppghnichhcgkeeokjgplkkd"




#####################

# java -jar $COMPILER --js
BUILD_FILES="background.html options.html popup.html notification.html metrics.html trending.html signin.html"
# Actions
# compress js
# move the graphics
# move the content_plugins
# move the manifest
# move CSS
# zip foler
# CRX folder
# move key
# delete tmp directories

echo "Parse HTML for JS, compress files"
for ext_file in $BUILD_FILES
do
    python compress_html.py  "${HTML_BASE}/${ext_file}"
done

# copy the icon over
echo "Copy primary bitly icon"
mkdir -p ../tmp/src/
cp -r ../src/bitly.png ../tmp/src/

# move the content scripts
echo "Move the Content Scripts"
mkdir -p ../tmp/src/js/content_plugins
cp -r ../src/js/content_plugins/*.js ../tmp/src/js/content_plugins/

# move the css
echo "Move the CSS files"
mkdir -p ../tmp/src/css
cp -r ../src/css/*.css ../tmp/src/css/

# now the graphics and stuff
echo "Move the static files to tmp"
mkdir -p ../tmp/src/s/graphics
cp -r ../src/s/graphics/*.{png,gif,ico} ../tmp/src/s/graphics/


# begin building ext for release

## now increment the trailing version number
perl -pe 's/(\s+.version.: .\d+\.\d+\.\d+\.)(\d+)/$1.($2+1)/eg' -i "../src/manifest.json"
# Increment the value in the compres
cp "../src/manifest.json" ../tmp/src/

VERSION=`cat ../tmp/src/manifest.json | grep '"version"' | awk -F '"' '{print $4}'`
echo "new extension version is $VERSION"

cd ../tmp
mkdir -p "../build"

# check for chrome, use it to compile the CRX
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
if [ ! -f "$CHROME" ]; then
    echo error: ${CHROME} is not accessible
    echo "hint: run this from your mac"
    exit 1;
fi


echo "Created a build directory for ZIP and CRX files"

zip -q -r "../build/bitly_ext-$VERSION.zip" "src" --exclude \*.DS_Store \*bitly_oauth_credentials.js.sample


echo "Insert the update.xml value into manifest"
sed '
/"version":/ a\
\  "update_url" : "'$CRX_XMLPATH'",
' "src/manifest.json" > "src/manifest.json.out"

mv "src/manifest.json.out" "src/manifest.json"

echo "Compiling bitly_chrome_extension.crx";
"$CHROME" --pack-extension=src --pack-extension-key=$KEY --no-message-box
mv "src.crx" "../build/bitly_chrome_extension-$VERSION.crx"
echo "Finished build/bitly_chrome_extension-$VERSION.crx";


#zips go to google gallery, CRX go to alpha / beta release sites

# finish script
# clean up and show what files to use
cd -

# cleanup
echo "Clean up tmp folders"
rm -rf ../tmp

echo "upload: build/bitly_ext-$VERSION.zip"
echo "upload the XML update file to ${CRX_XMLPATH}"
# bash needs to has the version variable exist, declare this block below it
XML_UPDATE_FILE="<?xml version='1.0' encoding='UTF-8'?>
<gupdate xmlns='http://www.google.com/update2/response' protocol='2.0'>
  <app appid='${CRX_APPID}'>
    <updatecheck codebase='${CRX_UPDATE_URL}' version='${VERSION}' />
  </app>
</gupdate>"


echo $XML_UPDATE_FILE > "../build/alpha_update.xml"

exit 0;

