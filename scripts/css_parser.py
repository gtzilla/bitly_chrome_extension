"""
    Liscense and Info:
        the BSD (revised) open source license.
        This is a derivative work of the YUI CSS compressor, ported to python and designed 
        for deployment to production servers using tornado and nginx (example.jpg?v=<##>)
        it resolves relative paths .
        
    verion : 0.1
    author: gregory tomlinson
    home: http://github.com/gregory80/CSS-Deploy
"""


import StringIO
import re
import logging
import sys
import os
import datetime


class CSSParser(object):
    
    
    def __init__(self, css_string="", base_web_path="/static/css"):
        self.css_string=css_string # original string, keep this
        self.clean_css="" ## output will go here
        self.processing_css=css_string ## in process (converting this / changing values)
        self.comments=[]
        ## the web page we page
        self.base_web_path=base_web_path
        self.os_base_path="/"
        self._identifier="dA5"
        self.preserve_comment=False
        self._parse_comments()        


    ##
    def output_css(self):
        self._strip_comments()
        self._compress_css()
        created_comment = "/* created: %s */" % datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        return created_comment,self.processing_css

        
    def parse_bg_images(self, css_location):
        self.os_base_path=css_location
        css = self.processing_css
        url_regex = re.compile("url\(([^)]*)\)", re.I)
        
        ## clean up images, add absolute path and ?v=
        cleaed_string = re.sub(url_regex, self._relative_image_replacer, css )
        self.processing_css = cleaed_string




    ## 'private' by convention only
    def _compress_css(self):
        css = self.processing_css
        url_regex = re.compile("(^|\\})(([^{:])+:)+([^{]*\{)")
        cleaned_string = re.sub( url_regex, _psuedo_color_replacer, css )
        # take out space and such not
        cleaned_string = re.sub("\s+", " ", cleaned_string)
        # return the colon we striped out         
        cleaned_string = re.sub("_____PSUEDO_COLON_TOKEN__", ":", cleaned_string)
        self.processing_css=cleaned_string

        

    def _strip_comments(self):
        css = self.processing_css
        ##  strip out all comments
        for idx,comment_token in enumerate(self.comments):
            css = re.sub("____CSSDEPLOY_COMMENT_CANDIDATE_%d___" % idx,  " ", css)
        self.processing_css=css
        

    
    def _parse_comments(self):
        
        """Tokenize the comments for replacement later"""
        css=self.processing_css
        total_css_len=len(css)
        startIndex=css.find("/*", 0)
        while startIndex >= 0:
            startIndex=css.find("/*", startIndex)
            ## ugly                
            endIndex = css.find("*/", startIndex + 2)
            if endIndex < 0:
                endIndex = total_css_len
            ## replace this comment
            ## move to end
            comment_item = css[startIndex+2:endIndex]
            self.comments.append( comment_item )  
            comment_marker ="____CSSDEPLOY_COMMENT_CANDIDATE_%d___" % (len( self.comments ) -1)
            css=css.replace( "/*%s*/" % comment_item, comment_marker, 1 )
            
            if startIndex >=0:
                startIndex+=2
        
        self.processing_css=css
        

            
        
    def _relative_image_replacer(self,match_object):
        if match_object and match_object.group(0):
            item = match_object.groups()[0]
            if item.find("../") >= 0:
                file_path = "url(%s?v=%s)" % (os.path.abspath( os.path.join( self.base_web_path, item ) ), self._identifier )
                return file_path
        return match_object.group()
        
def _psuedo_color_replacer(match_object):
    # safety measure, 'hide' :active and pseudo classes for later space removal
    if match_object and match_object.group():
        item=match_object.group()
        item = item.replace(":", "_____PSUEDO_COLON_TOKEN__")
        return item        

        

            

                      
