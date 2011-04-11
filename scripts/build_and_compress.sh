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
BUILD_FILES="background.html options.html popup.html notification.html metrics.html trending.html"
# todo
# compress css
# move the graphics
# move the content_plugins
# move the manifest
# zip foler
for ext_file in $BUILD_FILES
do
    python compress_html.py  "${HTML_BASE}/${ext_file}"
done
