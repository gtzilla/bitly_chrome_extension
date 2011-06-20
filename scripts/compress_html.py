# 
#  compress_html.py
#  bitly_chrome_extension
#  
#  Created by gregory tomlinson on 2011-04-08.
#  Copyright 2011 the public domain. All rights reserved.
# 

import sys,os
from optparse import OptionParser
import subprocess ## deal with the shell

try:
    import json
except ImportError:
    import simplejson as json

try:
    from BeautifulSoup import BeautifulSoup, Tag    
except:
    print "module required: BeautifulSoup"
    raise
    
class ProcessHTML:
    
    def __init__(self, raw_string=""):
        self.raw_string=raw_string
        self.compiler=os.path.expanduser("~/bin/closure_compiler.jar")
        self.dir=os.path.abspath( os.path.dirname(__file__) )
        self.tmp_path=None
        self.html_string=None
        
    def process(self, html_string, curr_filename):
        self.html_string=html_string
        js_files = self._find_scripts(self.html_string)
        files_path = self._read_files( js_files )
        print "num JS files: %s" % len(files_path)

        
        # remove the existing tmp dir
        self.tmp_path=os.path.abspath( os.path.join(self.dir, "..", "tmp",
        "src") )        
        # self._open_subshell( "rm -rf %s" % self.tmp_path )
        try:
            os.makedirs( self.tmp_path )
            os.mkdir( os.path.join(self.tmp_path, "js" ) )
        except:
            pass

        print self._compress_js_files( files_path, curr_filename )
    
    # /bin/sh
    def _open_subshell(self, cmd_process):
        fake_shell = subprocess.Popen( [cmd_process], shell=True, bufsize=0, stdout=subprocess.PIPE )
        out_data, err_data=fake_shell.communicate()
        if not err_data:
            return out_data
        else:
            return err_data    
    
    def _compress_js_files(self, files_path, curr_filename):
        js_compress_filename="compressed_js_%s.js" % curr_filename
        cmd="java -jar %(compiler)s %(js_file_paths)s --js_output_file %(js_output)s" % dict(
            compiler=self.compiler,
            js_file_paths="--js %s" % " --js ".join(files_path),
            js_output=os.path.abspath(os.path.join(self.tmp_path, "js", js_compress_filename  ))
        )
        # run the java compressor in a shell
        self._open_subshell( cmd )
        cleaned_html = self._insert_compressed_script( self.html_string, "js/%s" % js_compress_filename  )
        f=open(os.path.join(self.tmp_path, curr_filename ), 'w')
        f.write( cleaned_html.renderContents() )
        f.close()
    
    # Utilities / helpers
    def _read_files(self, js_files):
        files=[  os.path.abspath( os.path.join(self.dir, "..", "src", js) ) for js in js_files ]
        return files
            
    # html parse for HTML script tags w/ src aka an external file to compress
    
    def _insert_compressed_script(self, html_string, script_path):
        soup,script_tags=self._find_script_elements(html_string)
        new_script=False
        for script in script_tags:
            if not new_script:
                new_script=True
                script['src']=script_path
            else:
                script.extract()            
        return soup
    
    def _find_scripts(self, html_string):
        src_files=[]
        soup,script_tags=self._find_script_elements(html_string)
        for tag in script_tags:
            src_files.append(tag['src'])
        return src_files
    
    def _find_script_elements(self, html_string):
        soup = BeautifulSoup(html_string)
        soup.prettify()
        ## todo, handle this differently if it's a tornado template
        script_tags = soup.findAll(name="script", src=lambda(value): value and len(value) > 1)
        return soup,script_tags
    
def main():
    parser = OptionParser()
    
    # parser.add_option("-c", dest="listen", action="store_true", default=False,
    #                     help="read from a file", metavar="FILE")    
    # parser.add_option("-c", dest="listen", action="store_true", default=False,
    #                     help="read from a file", metavar="FILE")                        
    # 
    # options,args = parser.parse_args()
    
        
    args = sys.argv[1:]
    html=ProcessHTML()    
    for file_name in args:
        html_file_path = os.path.abspath( file_name )
        f=open( html_file_path )
        html_raw_string = f.read()
        html.process(html_raw_string, os.path.basename( file_name ) )
        f.close()
    
    
    pass

if __name__ == "__main__":
    main()
