define('ColorMe', ['d3'], function(d3) {
  "use strict";

  var ColorMe = function _ColorMe() {

    var values = {},
      domain = [],
      saturation = 0.4,
      light = 0.6;

    var colors = function(x) {
      if(!arguments.length || typeof x !== 'string') {
        return values;
      }

      if(values.hasOwnProperty(x)) {
        return values[x];
      }

      values[x] = d3.hsl(360/domain.length*(domain.indexOf(x)), saturation, light ).toString();
      return values[x];
    };

    colors.values = function() {
      return values;
    };

    colors.saturation = function(x) {
      if (!arguments.length) {
        return saturation;
      }

      saturation = x;
      return colors;
    };

    colors.light = function(x) {
      if (!arguments.length) {
        return light;
      }

      light = x;
      return colors;
    };

    colors.domain = function(x) {
      if (!arguments.length) {
        return domain;
      }

      domain = x;
      //values = {};
      var newValues = {};
      domain.forEach(function(d) {
        var k = d != 'null' ? d : "undefined";
        if(values.hasOwnProperty(k)) {
          newValues[k] = values[k];
        }
      });

      values = newValues;
      return colors;
    };

    colors.empty = function() {
      values = {};

      return colors;
    };

    /* Manually getting/setting values */
    colors.value = function(name,value) {
      if (arguments.length === 1) {
        return values[name];
      }

      values[name] = value;
      return colors;
    };

    return colors;
  };

  return ColorMe;
});
