define('PointsModel', ['underscore'], function(_) {
  "use strict";
  /* Base Model to represent points on a graph */

  var PointsModel = function Points(modelProps) {
    return {
      // Define a basic structure for a point
      // x val and y val
      structure: _.extend({
        x: {
          title: 'x'
        },

        y: {
          title: 'y'
        }
      }, modelProps),

      // Apply the model structure to a given set of data
      applyTo: function(data) {
        var model = this,
            points = [];

        try {
          _.each(data, function(d) {
            var point = {};

            _.each(model.structure, function(structure, name) {
              point[name] = (structure.map ? structure.map(d, 0) : (structure.title ? parseFloat(d[structure.title]) : 0));
            });

            points.push(point);
          });
        } catch(e) {
          return false;
        }

        // Return the points array
        return points;
      }
    };
  };

  return PointsModel;
});
