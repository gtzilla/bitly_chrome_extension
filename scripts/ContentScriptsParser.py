

""" Just a Parser

    Get all those JS files from a content script

    [CSS too?]

    Compress it into a simple file, and save the output

    Update the manifest accordingly

    Return a modified manifest

    Args

        Manifest [required]
        Manifest Out File
        JS Path Resolve [OS path resolution]
        Path to Google Closure Compiler
            [default, ~/bin/closure_compiler.js]

        -- Advanced compilation? Default to On 
            since scripts are sandboxed

"""

import os,sys
import logging
import subprocess

try:
    import json
except ImportError:
    import simplejson as json

class JSONFiles:
    def __init__(self, base_path=""):
        self.data=None
        self.base_path=base_path

    def open(self, filename):
        f=open(os.path.abspath( os.path.join( self.base_path, fiename )))
        try:
            data = json.loads( f.read() )
        except:
            data=None
        self.data=data
        f.close()
        return self.data

    def write(self, filepath, data=None):
        if not data:
            data=self.data or None

        f=open(os.path.abspath(os.path.join(self.base_path, filepath)), 'w')
        f.write( json.dumps( data ))
        f.close()

class JSCompress:

    def foo(self):
        pass

class ContentScriptsParser:

    def __init__(self):
        print "hi"
