

import os,sys
import logging

try:
    import json
except ImportError:
    import simplejson as json



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
    for file_path in args:
        json_data=on_file( file_path )
        print json.dumps(json_data, indent=4)


main()


