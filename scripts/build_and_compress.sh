# 
#  build_and_compress.sh
#  bitly_chrome_extension
#  
#  Created by gregory tomlinson on 2011-04-08.
#  Copyright 2011 the public domain. All rights reserved.
# 


COMPILER="~/bin/closure_compiler.jar"


CWD=`pwd`
HTML_BASE="${CWD}/../src"


#####################

# java -jar $COMPILER --js
BUILD_FILES="background.html options.html popup.html notification.html metrics.html trending.html signin.html"
# todo
# compress css
# move the graphics
# move the content_plugins
# move the manifest
# zip foler
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
zip -q -r "../bitly_ext-$VERSION.zip" "src" --exclude \*.DS_Store \*bitly_oauth_credentials.js.sample
# rm -rf src_alter

cd -

# cleanup
echo "Clean up tmp folders"
rm -rf ../tmp

echo "upload: bitly_ext-$VERSION.zip"
exit 0;

