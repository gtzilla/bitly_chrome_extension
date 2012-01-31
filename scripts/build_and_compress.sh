# 
#  build_and_compress.sh
#  bitly_chrome_extension
#  
#  Created by gregory tomlinson on 2011-04-08.
#  Copyright 2011 the public domain. All rights reserved.
# 

#TODO make this the $2 arg, test for exisitence, use default if none
set -e


COMPILER="~/bin/closure_compiler.jar"
HOST_FILES="manifest.json"
CWD=`pwd`
HTML_BASE="${CWD}/../src"
KEY=$1
BETA_KEY=$2
CRX_UPDATE_URL="http://greg.ec2.bitly.net/chrome/bitly_chrome.crx"
CRX_XMLPATH="http://greg.ec2.bitly.net/chrome/update.xml"
CRX_XMLPATH_BETA="http://chrome-beta.bitly.com/chrome/update.xml"

CRX_APPID="ehmcgdhfbppghnichhcgkeeokjgplkkd"
CRX_BETA_APPID="dpfppfppkpelbmfcbkjfpekkliijmbbk"


if [ ! -f "$BETA_KEY" ]
then
    echo $BETA_KEY
    echo "no beta key!"
    exit 1
fi


#Edit with caution, script directories are relative

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
echo "Move the Content Scripts and Worker Scripts"
mkdir -p ../tmp/src/js/content_plugins ../tmp/src/js/workers

cp -r ../src/js/content_plugins/*.js ../tmp/src/js/content_plugins/
cp -r ../src/js/workers/*.js ../tmp/src/js/workers/

# move the css
echo "Move the CSS files"
mkdir -p ../tmp/src/css
cp -r ../src/css/*.css ../tmp/src/css/
cp -r ../src/css/*.less ../tmp/src/css/


# now the graphics and stuff
echo "Move the static files to tmp"
mkdir -p ../tmp/src/s/graphics
cp -r ../src/s/graphics/*.{png,gif,ico} ../tmp/src/s/graphics/
cp -r ../src/s/graphics/vis/*.{png,gif,ico} ../tmp/src/s/graphics/vis/


# begin building ext for release

## now increment the trailing version number
perl -pe 's/(\s+.version.: .\d+\.\d+\.\d+\.)(\d+)/$1.($2+1)/eg' -i "../src/manifest.json"
# Increment the value in the compres
cp "../src/manifest.json" ../tmp/src/

VERSION=`cat ../tmp/src/manifest.json | grep '"version"' | awk -F '"' '{print $4}'`
echo "new extension version is $VERSION"




cd ../tmp
WD=`pwd`
echo "Compile the content scripts, update the manifest"
python ../scripts/manifest_parse.py src/manifest.json src/manifest.json

# do versioning to beta & alpha
mkdir -p "../build/alpha" "../build/beta"

# check for chrome, use it to compile the CRX
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
if [ ! -f "$CHROME" ]; then
    echo error: ${CHROME} is not accessible
    echo "hint: run this from your mac"
    exit 1;
fi


echo "Created a build directory for ZIP and CRX files"

zip -q -r "../build/bitly_ext-$VERSION.zip" "src" --exclude \*.DS_Store \*bitly_oauth_credentials.js.sample


echo "Insert the update.xml value into manifest for alpha and beta releases"
sed '
/"version":/ a\
\  "update_url" : "'$CRX_XMLPATH'",
' "src/manifest.json" > "manifest.json.alpha"

sed '
/"version":/ a\
\  "update_url" : "'$CRX_XMLPATH_BETA'",
' "src/manifest.json" > "manifest.json.beta"



mv "manifest.json.alpha" "src/manifest.json"

echo "Compiling bitly_chrome_extension.crx";
"$CHROME" --pack-extension=$WD/src --pack-extension-key=$KEY --no-message-box
mv "$WD/src.crx" "$WD/../build/alpha/bitly_chrome_extension-$VERSION.crx"
echo "Finished build/alpha/bitly_chrome_extension-$VERSION.crx >
http://chrome-beta.bitly.com/chrome/";


# build the beta version (different url for manifest.json)

mv "manifest.json.beta" "src/manifest.json"
echo "src/manifest.json.beta"

echo "Compiling bitly_chrome_extension.crx";
"$CHROME" --pack-extension=$WD/src --pack-extension-key=$BETA_KEY --no-message-box
mv "$WD/src.crx" "$WD/../build/beta/bitly_chrome_extension-$VERSION.crx"
echo "Finished build/beta/bitly_chrome_extension-$VERSION.crx > ${CRX_UPDATE_URL}";



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
cat $KEY

XML_UPDATE_FILE="<?xml version='1.0' encoding='UTF-8'?>
<gupdate xmlns='http://www.google.com/update2/response' protocol='2.0'>
  <app appid='${CRX_APPID}'>
    <updatecheck codebase='http://chrome-beta.bitly.com/alpha/bitly_chrome_extension-$VERSION.crx' version='${VERSION}' />
  </app>
</gupdate>"

XML_UPDATE_FILE_BETA="<?xml version='1.0' encoding='UTF-8'?>
<gupdate xmlns='http://www.google.com/update2/response' protocol='2.0'>
  <app appid='${CRX_BETA_APPID}'>
    <updatecheck codebase='http://chrome-beta.bitly.com/chrome/bitly_chrome_extension-$VERSION.crx' version='${VERSION}' />
  </app>
</gupdate>"



echo $XML_UPDATE_FILE > "../build/alpha/update.xml"
echo $XML_UPDATE_FILE_BETA > "../build/beta/update.xml"

exit 0;

