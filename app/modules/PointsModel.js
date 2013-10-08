define('PointsModel', ['underscore'], function(_) {
  "use strict";
  /* Base Model to represent points on a graph */

  var PointsModel = function Points(modelProps) {
    return {
      structure: _.extend({
        x: {
          title: 'x'
        },

        y: {
          title: 'y'
        }
      }, modelProps),

      reset: function() {
        var model = this;

        _.each(this.structure, function(structure) {
          structure.value = [];
        });
      },

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

        return points;
      },

      isValid: function() {
        return this.structure.x.value.length !== 0 && this.structure.y.value.length !== 0;
      }
    };
  };

  return PointsModel;
});
