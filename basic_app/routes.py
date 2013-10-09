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
    xMin = float(request.args.get('xMin', -100))
    xMax = float(request.args.get('xMax', 100))

    yMin = float(request.args.get('yMin', -100))
    yMax = float(request.args.get('yMax', 100))

    sizeMax = float(request.args.get('sizeMax', 1000))
    sizeMin = float(request.args.get('sizeMin', 100))

    colorsCount = int(request.args.get('colorsCount', 5))

    count = int(request.args.get('count', 20))

    points = []

    colors = []
    for c in xrange(colorsCount):
        colors.append(randomString())

    for c in xrange(count):
        point = {}
        point['x'] = random.uniform(xMin, xMax)
        point['y'] = random.uniform(yMin, yMax)
        point['size'] = random.uniform(sizeMin, sizeMax)
        point['color'] = random.choice(colors)
        point['label'] = randomString()

        points.append(point)

    return json.dumps(points)
