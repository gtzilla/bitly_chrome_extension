

import os,sys
import logging
import subprocess

try:
    import json
except ImportError:
    import simplejson as json

# TODO needs options parsing. handle outfile, update_url, a flag to not
# increment
class BasicChrome:
    def js_commands(self):
        scripts = self.extract_js()
        commands=[]
        for script in scripts:
            path=os.path.abspath(os.path.join("..", "src", script))
            commands.append("--js %s" % path)
        out_file=self.js_out_file % self.get("version")
        self.out_file=self.out_file %  self.get("version")
        if not os.path.exists( out_file ):
            if not os.path.exists( os.path.dirname( out_file ) ):
                os.makedirs( os.path.dirname( out_file ) )
            open(out_file, 'w').close()
        commands.append("--js_output_file %s" % out_file )

        return commands


class ChromeManifestMultiple:

    def __init__(self, prefix="cs_script_"):
        self.prefix=prefix
        """The idea is simple
            
            bassically, I want to step over multiple objects in the content
            list, parse it, then replace the JS scripts with the 'new' value

            It has to be done 'in place' - like while I am stepping over the
            array

Sample:

        "content_scripts":[{
        "matches":["http://*/*", "https://*/*"],
        "js":["js/cs_localStorage.js", "js/cs_ajax.js"]
    },{
        "matches":[
            "https://*.facebook.com/*", 
            "https://*.twitter.com/*",
            "https://*.google.com/*",
            "https://*.google.com/*"

        ],
        "js":["js/cs_isTargeted.js"]
    }]

        
        """
        pass
    def read_manifest(self):
        # load a string file path
        pass

class ChromeManifestSimple( BasicChrome ):

    def __init__(self, file_path):
        self.manifest=on_file(file_path)
        self.out_file="content_scripts_compress_%s.js"
        self.js_out_file=os.path.abspath(os.path.join("..", "tmp", "src", "js", "content_scripts_compress_%s.js"))
        self.compiler=os.path.expanduser("~/bin/closure_compiler.jar")
    
    def set(self, name, value):
        self.manifest[name]=value

    def set_js(self):
        items=self.manifest.get("content_scripts")
        for item in items:
            item["js"]=["js/%s" % self.out_file]

    def get(self, name):
        return self.manifest.get(name) or None
    def out(self):
        return json.dumps( self.manifest, indent=4 )

    def increment_version(self):
        ver = self.manifest.get("version")
        numbers = ver.split(".")
        numbers[-1]="%s" % (int(numbers[-1])+1)
        self.manifest['version']=".".join(numbers)

    def extract_js(self):
        items = self.get("content_scripts") or {}
        js=[]
        for item in items:
            js.extend( item.get("js" or []) )
        return js




def build_js_files( compiler, commands ):
    js_commands = " ".join(commands)
    return run_subshell( "java -jar %s %s" % ( compiler, js_commands )  )

def run_subshell(cmd_process):
    fake_shell = subprocess.Popen( [cmd_process], shell=True, bufsize=0, stdout=subprocess.PIPE )
    out_data, err_data=fake_shell.communicate()
    if not err_data:
        return out_data
    else:
        return err_data 

def on_file(name):
    f = open( os.path.abspath(name) )
    json_data=None
    try:
        json_data=json.loads( f.read() )
    except:
        pass

    return json_data


def main():
    args=sys.argv[1:]
    file_path=args[0]
    manifest = ChromeManifestSimple( file_path )
    #manifest.increment_version()
    build_js_files( manifest.compiler, manifest.js_commands() )
    manifest.set_js()
    print manifest.out()
    if len(args) > 1:
        f=open(args[1], 'w')
        f.write( manifest.out() )
        f.close()
main()


