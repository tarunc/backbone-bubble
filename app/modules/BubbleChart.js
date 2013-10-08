define('BubbleChart', ['underscore', 'backbone', 'jquery', 'd3', 'ColorMe', 'PointsModel'], function(_, Backbone, $, d3, ColorMe, Points) {
  "use strict";

  var BubbleChart = Backbone.View.extend({
    options: {
      labels: false,
      grid: true,
      maxRadius: 30,
      color: null,
      box: true,
      tooltips: true,
      url: '/static/movies.json',
      params: { 'request': 'params', 'go': 'here' },
      titles: {
        main: 'Rating vs Earnings of Movies',
        x: 'IMDB Rating',
        y: 'Total $$$ Made by Movie'
      },
      tooltipTemplate: _.template('<div class="label"><%- label %></div><div class="x">IMDB Rating: <%- x %></div><div class="y">Box Office: $<%- y %></div><div class="size">Budget: $<%- size %></div><div class="color">Genre: <%- color %></div>'),
    },
    initialize: function(options) {
      if (!this.model) {
        this.model = new Points({
          color: {
            title: 'color',
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
      }

      if (options.data) {
        this.data = options.data;
      }

      if (!options.color) {
        this.options.color = new ColorMe();
      }

      if (!this.data || !this.data.length) {
        this.fetchData();
      }
    },
    fetchData: function() {
      var self = this,
          options = this.options;

      return $.getJSON(options.url, options.params, function(data) {
        if (_.isArray(data)) {
          self.data = data;
        } else if (_.isObject(data)) {
          if (data.titles) {
            self.options.titles = data.titles;
          }

          self.data = data.results;
        }

        self.render();
      });
    },
    isInDom: function() {
      return this.$el.parent().length;
    },
    hide: function() {
      this.$el.addClass('hide');
    },
    show: function() {
      this.$el.removeClass('hide');
    },
    render: function() {
      if (!this.data || !this.model) {
        return this;
      }

      var self = this,
          model = this.model,
          data = this.data,
          options = this.options,
          titles = options.titles,
          format = d3.format(",d"),
          $el = this.$el,
          target = d3.select($el[0]);

      $el.html('');

      options.width = $el.width();
      options.height = $el.height();

      var points = model.applyTo(data);

      // let's calculate margins
      var marginLeft = !options.grid ? 0 : d3.max(points, function(d){ return (Math.log(d.y) / 2.302585092994046) + 1; }) * 9,
          marginBottom = (!options.grid ? 0 : 20),
          marginTop = (!titles || !titles.main ? 0 : 20),
          w = options.width - marginLeft - 1,
          h = options.height - marginBottom - marginTop - 2;

      var xScale = d3.scale.linear().range([marginLeft, options.width - 1]).domain([d3.min(points, function(d){ return d.x; }), d3.max(points, function(d){ return d.x; })]),
          yScale = d3.scale.linear().range([h, marginBottom + marginTop]).domain([d3.min(points, function(d){ return d.y; }), d3.max(points, function(d){ return d.y; })]),
          sizeScale = d3.scale.linear().range([1, Math.pow(parseFloat(options.maxRadius), 2)*Math.PI]).domain([ d3.min(points, function(d){ return d.size; }), d3.max(points, function(d){ return d.size; }) ]),

      svg = target.append("svg:svg")
          .attr("width", options.width)
          .attr("height", options.height)
          .append("svg:g");


      if (options.grid) {
        if (!_.isObject(options.grid) || options.grid.x) {
          var xrule = svg.selectAll("g.x")
          .data(xScale.ticks(10))
          .enter().append("g")
            .attr("class", "x");

          if (!_.isObject(options.grid) || !_.isObject(options.grid.x) || options.grid.x.lines) {
            xrule.append("line")
              .attr("x1", xScale)
              .attr("x2", xScale)
              .attr("y1", (options.grid.shortLines || (options.grid.x && options.grid.x.shortLines)) ? h - 3 : marginTop)
              .attr("y2", (options.grid.shortLines || (options.grid.x && options.grid.x.shortLines)) ? h + 3 : h)
              .style("stroke", "#ccc")
              .style("shape-rendering", "crispEdges");
          }

          if (!_.isObject(options.grid) || !_.isObject(options.grid.x) || options.grid.x.text) {
            xrule.append("text")
              .attr("x", xScale)
              .attr("y", h + 3)
              .attr("dy", ".71em")
              .attr("text-anchor", "middle")
              .style("font-size", "10px")
              .style("font-family", "Arial, Helvetica, sans-serif")
              .text(xScale.tickFormat(10));
          }

          if (titles && titles.x) {
            xrule.append("text")
              .attr("x", w + marginLeft - 6)
              .attr("y", h - 6)
              .style("font-size", "12px")
              .style("font-family", "Arial, Helvetica, sans-serif")
              .style("text-anchor", "end")
              .text(titles.x.toString());
          }
        }

        if (!_.isObject(options.grid) || options.grid.y) {
          var yrule = svg.selectAll("g.y")
            .data(yScale.ticks(10))
            .enter().append("g")
              .attr("class", "y")
              .attr("transform", "translate(" + marginLeft + ",0)");

          if (!_.isObject(options.grid) || !_.isObject(options.grid.y) || options.grid.y.lines) {
            yrule.append("line")
              .attr("x1", (options.grid.shortLines || (options.grid.y && options.grid.y.shortLines)) ? -3 : 0)
              .attr("x2", (options.grid.shortLines || (options.grid.y && options.grid.y.shortLines)) ? 3 : w)
              .attr("y1", yScale)
              .attr("y2", yScale)
              .style("stroke", "#ccc")
              .style("shape-rendering", "crispEdges");
          }

          if (!_.isObject(options.grid) || !_.isObject(options.grid.y) || options.grid.y.text) {
            yrule.append("text")
              .attr("x", -3)
              .attr("y", yScale)
              .attr("dy", ".35em")
              .attr("text-anchor", "end")
              .style("font-size", "10px")
              .style("font-family", "Arial, Helvetica, sans-serif")
              .text(yScale.tickFormat(10));
          }

          if (titles && titles.y) {
            yrule.append("text")
              // .attr("transform", "rotate(-90)")
              .attr("y", 6 + marginTop)
              .attr("dy", ".71em")
              .attr("x", 6)
              .style("font-size", "12px")
              .style("font-family", "Arial, Helvetica, sans-serif")
              .style("text-anchor", "start")
              .text(titles.y.toString());
          }
        }
      }

      if (titles && titles.main) {
        svg.append("text")
          .attr("y", marginTop - 3)
          .attr("x", marginLeft + w/2)
          .style("text-anchor", "middle")
          .text(titles.main.toString());
      }

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

      var color = options.color.domain(_.uniq(_.pluck(points, "color"), false));

      var point = svg.selectAll("g.point")
        .data(points)
        .enter().append("g")
        .attr("class","point");

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

      if (options.tooltips) {
        var tooltip = target.append("div")
          .attr("class", "tooltip")
          .style("opacity", 0);

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
