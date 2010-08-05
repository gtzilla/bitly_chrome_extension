import os
import os.path
import logging
import tornado.web
import tornado.httpserver
import tornado.ioloop
import tornado.options

import current_version

class ContentHandler(tornado.web.RequestHandler):
    def get(self):
        self.render("index.html", current_version = current_version.__version__)

class Application(tornado.web.Application):
    def __init__(self):
        app_settings = {
            'debug' : False,
            "template_path" : os.path.join(os.path.dirname(__file__), "templates"),
            "static_path" : os.path.join(os.path.dirname(__file__), "static"),
            }
        handlers = [
                (r"^/$", ContentHandler),
                (r"/install/bitly_chrome_extension.crx", tornado.web.RedirectHandler,
                    dict(url="http://github.com/downloads/bitly/bitly_chrome_extension/bitly_chrome_extension-" + current_version.__version__ + ".crx")),
                ]
        tornado.web.Application.__init__(self, handlers, **app_settings)

def main():
    tornado.options.define("port", default=7995, help="Listen on port", type=int)
    tornado.options.parse_command_line()
    logging.info("starting chrome extension website on %s:%d" % ('0.0.0.0', tornado.options.options.port))
    
    http_server = tornado.httpserver.HTTPServer(Application())
    http_server.listen(tornado.options.options.port)
    tornado.ioloop.IOLoop.instance().start()

if __name__ == "__main__":
    main()
