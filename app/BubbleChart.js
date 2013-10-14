define('BubbleChart', ['underscore', 'backbone', 'jquery', 'd3', 'ColorMe', 'PointsModel'], function(_, Backbone, $, d3, ColorMe, Points) {
  "use strict";

  // Helper function to repeatedly call a method till a condition is false
  // I can make this into an underscore mixin
  function applyParams(method, context, params, cond) {
    var x, c = 0, l = params.length;

    cond = cond || _.identity;

    do {
      x = method.apply(context, params[c]);
      c++;
    } while(c < l && !cond(x, c));

    return x;
  }

  var BubbleChart = Backbone.View.extend({
    // All the options
    // See the readme for explanations
    options: {
      labels: false,
      grid: { x: true, y: true },
      maxRadius: 30,
      color: null,
      box: false,
      tooltips: true,
      url: '/static/movies.json',
      params: { 'request': 'params', 'go': 'here' },
      titles: {
        main: 'Rating vs Earnings of Movies',
        x: 'IMDB Rating',
        y: 'Total $$$ Made by Movie'
      },
      tooltipTemplate: _.template('<div class="label"><%- label %></div><div class="x">IMDB Rating: <%- x %></div><div class="y">Box Office: $<%- y %></div><div class="size">Budget: $<%- size %></div><div class="color">Genre: <%- color %></div>'),
      minTicks: 4,
      maxTicks: 30,
      approximateTickCount: 7
    },
    initialize: function(options) {
      if (!this.model) {
        // Define the default model structure
        // these data-sets is what the model looks for
        this.model = new Points({
          // Represents category of the color (can be anything-- doesnt have to be a color)
          color: {
            title: 'color',
            map: function(d) {
              return this.title ? d[this.title] : null;
            }
          },

          // Represents a unique label of the point
          label: {
            title: 'label',
            map: function(d) {
              return this.title ? d[this.title] : null;
            }
          },

          // Represents the size of the circle
          size: {
            title: 'size',
            map: function(d, t) {
              return this.title ? parseFloat(d[this.title]) + parseFloat(t) : parseFloat(t) + 1;
            }
          }
        });
      }

      // In-line any data we must have gotten
      if (options.data) {
        this.data = options.data;
      }

      // Create a new scale for colors
      if (!options.color) {
        this.options.color = new ColorMe();
      }

      // Fetch data if not fetched
      if (!this.data || !this.data.length) {
        this.fetchData();
      } else {
        this.render();
      }
    },
    fetchData: function() {
      var self = this,
          options = this.options;

      // Fetch data from the provided url
      // Data can be an array or an object with an array called `results`
      return $.getJSON(options.url, options.params, function(data) {
        if (_.isArray(data)) {
          self.data = data;
        } else if (_.isObject(data)) {
          // Check if the data has any titles
          // Maybe we should generalize this so we have any options be returned by the server?
          if (data.titles) {
            self.options.titles = data.titles;
          }

          self.data = data.results;
        }

        // Call return after fetching data
        self.render();
      });
    },
    // boilerplate methods that should be in any Backbone.View
    isInDom: function() {
      return this.$el.parent().length;
    },
    hide: function() {
      this.$el.addClass('hide');
    },
    show: function() {
      this.$el.removeClass('hide');
    },
    // Helper function to help calculate where the axis are and the number of ticks
    calulateAxisAndTicks: function(scale, approxAxis, tickCount, divideOk, toDecrease) {
      // See if the tick count is out of bounce and just return if it is
      if (tickCount < this.options.minTicks || tickCount > this.options.maxTicks) {
        return;
      }

      // Divide the d3 scale up into ticks
      var ticks = scale.ticks(tickCount);

      // Calculate the distance between ticks. Should be equal for all ticks
      var dtick = ticks[1] - ticks[0];

      // d3's/the accepted formula for calculating acceptable distance between the middle tick and axis
      var acceptable = Math.exp(Math.round(Math.log(dtick)) - 1);

      // Calculate with the middle tick is
      var middleTick = ticks[Math.floor(ticks.length/2)] + (divideOk ? dtick/2 : 0);

      // if the distince between the middle tick and the axis is within acceptable range return
      if (Math.abs(middleTick - approxAxis) < acceptable) {
        return { axis: middleTick, ticks: ticks.length };
      }

      // Check both ways of the middle axis because with one way, I was getting weird results
      if (divideOk) {
        // Just subtract the distance since we added half of it before
        middleTick -= dtick;

        // Do the same calc
        if (Math.abs(middleTick - approxAxis) < acceptable) {
          return { axis: middleTick, ticks: ticks.length };
        }
      }

      // recursively increase or decrease tick count till we get a result
      return this.calulateAxisAndTicks(scale, approxAxis, tickCount + (toDecrease ? -1 : 1), divideOk, toDecrease);
    },
    render: function() {
      // Only proceed with rendering if we have data and we have a model
      if (!this.data || !this.model || !this.isInDom()) {
        return this;
      }

      // Declare some basic variables
      var self = this,
          model = this.model,
          data = this.data,
          options = this.options,
          titles = options.titles,
          format = d3.format(",d"),
          $el = this.$el,
          target = d3.select($el[0]);

      // Empty the container element
      $el.html('');

      // inline the width and the height in options
      // This will be the width and height of the drawing board
      options.width = $el.width();
      options.height = $el.height();

      // Apply the model structure to the data
      var points = model.applyTo(data);

      // let's calculate margins
      var marginLeft = 0, // !options.grid ? 0 : d3.max(points, function(d){ return (Math.log(d.y) / 2.302585092994046) + 1; }) * 9,
          marginBottom = 0, // (!options.grid ? 0 : 20),
          marginTop = (!titles || !titles.main ? 0 : 50),
          marginRight = 0,

          // Calculate the actual width and height of the graph
          w = options.width - marginRight - marginLeft - 1,
          h = options.height - marginBottom - marginTop - 1,

          // Calculate the size scale
          sizeMin = d3.min(points, function(d){ return d.size; }),
          sizeMax = d3.max(points, function(d){ return d.size; }),

          sizeScale = d3.scale.linear().range([1, Math.pow(parseFloat(options.maxRadius), 2) * Math.PI]).domain([sizeMin, sizeMax]),

          xMin = d3.min(points, function(d){ return d.x; }),
          xMax = d3.max(points, function(d){ return d.x; }),

          yMin = d3.min(points, function(d){ return d.y; }),
          yMax = d3.max(points, function(d){ return d.y; });

      // Calculate the scales for the x and y values of the points
      var xScale = d3.scale.linear().range([marginLeft + options.maxRadius, options.width - options.maxRadius - marginRight]).domain([xMin, xMax]),
          yScale = d3.scale.linear().range([options.height - options.maxRadius - marginBottom, marginTop + options.maxRadius]).domain([yMin, yMax]),

          // Calucate the approx position of the axis
          xAxis = (xMax - xMin) / 2 + xMin,
          yAxis = (yMax - yMin) / 2 + yMin,

          // Create the svg
          svg = target.append("svg:svg")
              .attr("width", options.width)
              .attr("height", options.height)
              .append("svg:g");

      // Calculating the number of ticks and the position of axis. This is our method: (Note the next one only runs if the first were unsuccessful)
      // 1. Given an approximate tick count, find the axis going up to the max tick count seeing if any ticks fall under our acceptable distance for error
      // 2. Same as before except now you can divide a tick/space into 2 parts
      // 3. Same as the first one, except go down
      // 4. Same as (2), except go down
      // This method isn't perfect but it is damn good

      var xParams = [
        [xScale, xAxis, options.approximateTickCount],
        [xScale, xAxis, options.approximateTickCount, true], // If we didn't find it
        [xScale, xAxis, options.approximateTickCount - 1, false, true],
        [xScale, xAxis, options.approximateTickCount - 1, true, true]
      ];

      var x = applyParams(this.calulateAxisAndTicks, this, xParams) || { axis: xAxis, ticks: options.approximateTickCount };

      var yParams = [
        [yScale, yAxis, options.approximateTickCount],
        [yScale, yAxis, options.approximateTickCount, true],
        [yScale, yAxis, options.approximateTickCount - 1, false, true],
        [yScale, yAxis, options.approximateTickCount - 1, true, true]
      ];

      var y = applyParams(this.calulateAxisAndTicks, this, yParams) || { axis: yAxis, ticks: options.approximateTickCount };

      xAxis = x.axis;
      xScale = xScale.nice(x.ticks);

      yAxis = y.axis;
      yScale = yScale.nice(y.ticks);

      // Draw the grid (includes axis)
      if (options.grid) {
        if (!_.isObject(options.grid) || options.grid.x) {
          var xrule = svg.selectAll("g.x")
          .data(xScale.ticks(x.ticks))
          .enter().append("g")
            .attr("class", "x");

          // Draw the axis
          xrule.append("line")
            .attr("x1", 0)
            .attr("x2", 0)
            .attr("y1", marginTop)
            .attr("y2", h + marginTop)
            .attr("class", "axis")
            .style("stroke", "#000")
            .style("shape-rendering", "crispEdges")
            .attr("transform", "translate(" + (xScale(xAxis)) + ",0)");

          // Draw grid lines
          if (!_.isObject(options.grid) || !_.isObject(options.grid.x) || options.grid.x.lines) {
            xrule.append("line")
              .attr("x1", xScale)
              .attr("x2", xScale)
              .attr("y1", (options.grid.shortLines || (options.grid.x && options.grid.x.shortLines)) ? xScale(xAxis) - 3 : marginTop)
              .attr("y2", (options.grid.shortLines || (options.grid.x && options.grid.x.shortLines)) ? xScale(xAxis) + 3 : h + marginTop)
              .attr("class", "grid")
              .style("stroke", "#ccc")
              .style("shape-rendering", "crispEdges");
          }

          // Draw the text
          if (!_.isObject(options.grid) || !_.isObject(options.grid.x) || options.grid.x.text) {
            xrule.append("text")
              .attr("x", xScale)
              .attr("y", (yScale(yAxis) + 3))
              .attr("dy", ".71em")
              .attr("text-anchor", "middle")
              .style("font-size", "10px")
              .style("font-family", "Arial, Helvetica, sans-serif")
              .text(xScale.tickFormat(10));
          }

          // Draw titles
          if (titles && titles.x) {
            svg.append("text")
              .attr("x", 6)
              .attr("y", (yScale(yAxis) - 6))
              .attr("class", "axis-title")
              .style("font-size", "12px")
              .style("font-family", "Arial, Helvetica, sans-serif")
              .style("text-anchor", "start")
              .text(titles.x.toString());
          }
        }

        // Same for the y
        if (!_.isObject(options.grid) || options.grid.y) {
          var yrule = svg.selectAll("g.y")
            .data(yScale.ticks(y.ticks))
            .enter().append("g")
              .attr("class", "y")
              .attr("transform", "translate(" + marginLeft + ",0)");

          yrule.append("line")
            .attr("x1", marginLeft)
            .attr("x2", w + marginLeft)
            .attr("y1", 0)
            .attr("y2", 0)
            .attr("class", "axis")
            .style("stroke", "#000")
            .style("shape-rendering", "crispEdges")
            .attr("transform", "translate(0," + (yScale(yAxis)) + ")");

          if (!_.isObject(options.grid) || !_.isObject(options.grid.y) || options.grid.y.lines) {
            yrule.append("line")
              .attr("x1", (options.grid.shortLines || (options.grid.y && options.grid.y.shortLines)) ? yScale(yAxis) -3 : marginLeft)
              .attr("x2", (options.grid.shortLines || (options.grid.y && options.grid.y.shortLines)) ? yScale(yAxis) + 3 : w + marginLeft)
              .attr("y1", yScale)
              .attr("y2", yScale)
              .attr("class", "grid")
              .style("stroke", "#ccc")
              .style("shape-rendering", "crispEdges");
          }

          if (!_.isObject(options.grid) || !_.isObject(options.grid.y) || options.grid.y.text) {
            yrule.append("text")
              .attr("x", (xScale(xAxis) - 3))
              .attr("y", yScale)
              .attr("dy", ".35em")
              .attr("text-anchor", "end")
              .style("font-size", "10px")
              .style("font-family", "Arial, Helvetica, sans-serif")
              .text(yScale.tickFormat(10));
          }

          if (titles && titles.y) {
            svg.append("text")
              // .attr("transform", "rotate(-90)")
              .attr("y", 12 + marginTop)
              .attr("x", (xScale(xAxis) + 6))
              .attr("class", "axis-title")
              .style("font-size", "12px")
              .style("font-family", "Arial, Helvetica, sans-serif")
              .style("text-anchor", "start")
              .text(titles.y.toString());
          }
        }
      }

      // Draw the main title
      if (titles && titles.main) {
        svg.append("text")
          .attr("y", 12)
          .attr("x", marginLeft + w/2)
          .attr("class", "main-title")
          .style("text-anchor", "middle")
          .text(titles.main.toString());
      }

      // Draw a box around our chart if need be
      if (options.box) {
        svg.append("rect")
          .attr("width", w)
          .attr("height", h - marginTop)
          .attr("y", marginTop)
          .style("fill", "none")
          .style("stroke", options.box.color ? options.box.color : "#888")
          .style("shape-rendering", "crispEdges")
          .attr("transform", "translate(" + marginLeft + ",0)");
      }

      // Set the domain for our color scale
      var color = options.color.domain(_.uniq(_.pluck(points, "color"), false));

      // Draw the cirlces at the specfied points
      var point = svg.selectAll("g.point")
        .data(points)
        .enter().append("g")
        .attr("class", "point");

      var circle = point
        .append("circle")
          .style("stroke", function(d) {
            return model.structure.color.title ? d3.rgb(color(d.color)).darker() : d3.rgb(color("undefined")).darker();
          })
          .style("fill", function(d) {
            return model.structure.color.title ? color(d.color) : color("undefined");
          })
          .style("fill-opacity", 0.8)
          .attr("transform", function(d) {
            return "translate(" + xScale(d.x) + "," + yScale(d.y) + ")";
          })
          .attr("r", function(d){
            return model.structure.size.title ? Math.sqrt(sizeScale(d.size)/Math.PI) : parseFloat(options.maxRadius);
          });

      // Create tooltips if enabled
      if (options.tooltips) {
        var tooltip = target.append("div")
          .attr("class", "tooltip")
          .style("opacity", 0);

        // Create the mouse over affect
        circle
          .on("mouseover", function(d) {
            tooltip.transition()
                .duration(200)
                .style("opacity", 0.9);
            tooltip.html(options.tooltipTemplate(d))
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY - 28) + "px");
          })
          .on("mouseout", function(d) {
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
          });
      }

      // Draw labels with points
      if (options.labels) {
        point.append("text")
            .attr("transform", function(d) {
              return "translate(" + xScale(d.x) + "," + yScale(d.y) + ")";
            })
            .attr("text-anchor", "middle")
            .style("font-size", "10px")
            .attr("dy", 3)
            .style("font-family", "Arial, Helvetica, sans-serif")
            .text(function(d) {
              return model.structure.label.title ? d.label : "";
            });
      }

      return this;
    }
  });

  return BubbleChart;
});
