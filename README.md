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

## Usage

```javascript
var bubbleChart = new BubbleChart({
  el: $('#main')[0],
  labels: false, // Labels on the circle
  grid: true, // Can also be:
  // { x: true, y: { shortLines: true, text: true, lines: true } } or { x: { lines: false, text: true }, y: false }
  // { x: true, y: true, shortLines: true } etc
  maxRadius: 30, // Maximum Radius of a circle. Will scale the size parameter accordingly
  box: true, // Draw a box around the chart
  tooltips: true, // Tooltips
  url: '/static/movies.json', // Url to server
  params: { 'request': 'params', 'go': 'here' }, // Request parameters
  titles: { // Chart titles
    main: 'Rating vs Earnings of Movies', // Main Chart title
    x: 'IMDB Rating', // X-Axis for the title
    y: 'Total $$$ Made by Movie' // Y-Axis for the title
  },
  // Template for the tooltip
  tooltipTemplate: _.template('<div class="label"><%- label %></div><div class="x">IMDB Rating: <%- x %></div><div class="y">Box Office: $<%- y %></div><div class="size">Budget: $<%- size %></div><div class="color">Genre: <%- color %></div>'),
});

// Uses PointsModel internally
// Searches for the keys: color, label, size, x, and y. PointsModel has x and y built-in since that represents a point.
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

See [static/movies.json](https://github.com/tarunc/backbone-bubble/blob/master/static/movies.json) for the how it expects data.
