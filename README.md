# Backbone-D3 BubbleChart

## Install

#### 1. Install NodeJS (install [NVM](https://github.com/creationix/nvm))

```bash
curl https://raw.github.com/creationix/nvm/master/install.sh | sh
source ~/.nvm/nvm.sh
nvm install 0.10.20
nvm use 0.10.20
```

#### 2. Install Dependencies

```bash
git clone git@github.com:tarunc/backbone-bubble.git && cd backbone-bubble
npm install -g grunt-cli bower
npm install
bower install
```

#### 3. Run
```bash
grunt dev
```

or to run the flask application

```bash
python ./run.py
```

## Usage

```javascript
var bubbleChart = new BubbleChart({
  el: $('#main')[0],
  labels: false, // Labels on the circle
  grid: true, // Can also be:
  // { x: true, y: { shortLines: true, text: true, lines: true } }
  // or { x: { lines: false, text: true }, y: false }
  // or { x: true, y: true, shortLines: true } etc
  maxRadius: 30, // Maximum Radius of a circle. Will scale the size parameter accordingly
  box: true, // Draw a box around the chart
  tooltips: true, // Tooltips on hover (located where the mouse is located)
  url: '/static/movies.json', // Url to server
  params: { 'request': 'params', 'go': 'here' }, // Request parameters
  titles: { // Chart titles
    main: 'Rating vs Earnings of Movies', // Main Chart title
    x: 'IMDB Rating', // X-Axis for the title
    y: 'Total $$$ Made by Movie' // Y-Axis for the title
  },
  // Template for the tooltip
  tooltipTemplate: _.template('<div class="label"><%- label %></div><div class="x">IMDB Rating: <%- x %></div><div class="y">Box Office: $<%- y %></div><div class="size">Budget: $<%- size %></div><div class="color">Genre: <%- color %></div>'),
  // Ticks
  minTicks: 4,
  maxTicks: 30,
  approximateTickCount: 7
});

// Uses PointsModel internally
// Looks for the keys: color, label, size, x, and y.
// PointsModel has x and y built-in since that represents a point.
// All others are optional and extra
var model = new PointsModel({
  color: {
    title: 'color', // property name in json
    // custom data mapper function
    map: function(d) {
      return this.title ? d[this.title] : null;
    }
  },

  label: {
    title: 'label',
    map: function(d) {
      return this.title ? d[this.title] : null;
    }
  },

  size: {
    title: 'size',
    map: function(d, t) {
      return this.title ? parseFloat(d[this.title]) + parseFloat(t) : parseFloat(t) + 1;
    }
  }
});
```

See [static/movies.json](https://github.com/tarunc/backbone-bubble/blob/master/static/movies.json) for the how it expects json data to be structured.

## Test

To run tests for the application, in the command-line, run:

```sh
grunt test
```

## Build

To build the application/example for distribution, in the command-line, run:

```sh
grunt
```

## License

(The MIT License)

Copyright (c) 2013 Tarun Chaudhry &lt;tarunc92@gmail.com&gt;

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
