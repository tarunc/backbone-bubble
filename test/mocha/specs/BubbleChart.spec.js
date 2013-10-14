define(function(require) {
  "use strict";

  var BubbleChart = require('BubbleChart');
  var _ = require('underscore');
  var d3 = require('d3');
  var $ = require('jquery');

  describe("BubbleChart", function() {
    var bubbleChart;

    if (!$('#main').length) {
      $(document.body).append('<div id="main"></div>');
    }

    beforeEach(function() {
      bubbleChart = new BubbleChart({
        el: $('#main')[0],
        data: [
          {
            "label": "Avatar",
            "color": "Action",
            "size": "425000000",
            "y": "760507625",
            "x": "8.0"
          },
          {
            "label": "The Blind Side",
            "color": "Drama",
            "size": "35000000",
            "y": "255959475",
            "x": "7.6"
          },
          {
            "label": "The Chronicles of Narnia: The Lion, the Witch and the Wardrobe",
            "color": "Adventure",
            "size": "180000000",
            "y": "291710957",
            "x": "-6.9"
          }
        ],
        titles: {
          main: 'Test Graph'
        }
      });
    });

    it("should have a model", function() {
      expect(bubbleChart.model).to.be.an('object');
    });

    it("should have options", function() {
      expect(bubbleChart.options).to.be.an('object');
      expect(bubbleChart.options.titles).to.be.an('object');
      expect(bubbleChart.options.titles.main === 'Test Graph').to.be.true;
    });

    it("should have 3 data points", function() {
      expect(bubbleChart.data).to.be.an('array');
      expect(bubbleChart.data.length).to.equal(3);
    });

    it("should have an svg", function() {
      bubbleChart.render();

      var target = d3.selectAll('#main');
      expect(target.length).to.equal(1);
      expect(target[0].length).to.equal(1);

      var svg = d3.selectAll('svg');
      expect(svg.length).to.equal(1);
      expect(svg[0].length).to.equal(1);

      svg = target.selectAll('svg');
      expect(svg.length).to.equal(1);
      expect(svg[0].length).to.equal(1);
    });

    it("should have drawn 3 points", function() {
      bubbleChart.render();

      var points = d3.selectAll('g.point');
      expect(points.length).to.equal(1);
      expect(points[0].length).to.equal(3);
    });

    it("should have drawn > 2 axis", function() {
      bubbleChart.render();

      var axis = d3.selectAll('line.axis');
      expect(axis.length).to.equal(1);
      expect(axis[0].length).to.above(2);
    });
  });
});