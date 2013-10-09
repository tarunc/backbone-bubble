from basic_app import app
from flask import request
import simplejson as json

@app.route('/', methods=['GET'])
def getIndex():
    return app.send_static_file('index.html')

