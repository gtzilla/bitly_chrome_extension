#!/bin/sh

mkdir -p /bitly/local/bitly_chrome_extension
echo "deploying bitly_chrome_extension"
/bitly/local/bin/git checkout-index -a -f --prefix=/bitly/local/bitly_chrome_extension/
