import string
import random

from basic_app import app
from flask import request
import simplejson as json

def randomString(size=6, chars=string.ascii_uppercase + string.digits + string.ascii_lowercase):
    return ''.join(random.choice(chars) for x in range(size))


@app.route('/', methods=['GET'])
def getIndex():
    return app.send_static_file('index.html')

@app.route('/data.json', methods=['GET'])
def getData():
    params = request.args

    xMin = float(params.get('xMin', 0))
    xMax = float(params.get('xMax', 100))

    yMin = float(params.get('yMin', 0))
    yMax = float(params.get('yMax', 100))

    sizeMax = float(params.get('sizeMax', 1000))
    sizeMin = float(params.get('sizeMin', 100))

    colorsCount = int(params.get('colorsCount', 5))

    count = int(params.get('count', 20))

    if colorsCount < 1:
        # return '{ "error": "colorsCount parameter is negative" }'
        colorsCount = 1

    if count < 2:
        # return '{ "error": "count parameter is negative" }'
        count = 2

    points = []

    colors = []
    for c in xrange(colorsCount):
        colors.append(randomString())

    for c in xrange(count):
        point = {
            'x': random.uniform(xMin, xMax),
            'y': random.uniform(yMin, yMax),
            'size': random.uniform(sizeMin, sizeMax),
            'color': random.choice(colors),
            'label': randomString()
        }

        points.append(point)

    return json.dumps(points)
