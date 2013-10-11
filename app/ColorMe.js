define('ColorMe', ['d3'], function(d3) {
  "use strict";

  // Boilerplate function to generate a set of colors given a domain
  var ColorMe = function _ColorMe() {
    var values = {},
      domain = [],
      saturation = 0.4,
      light = 0.6;

    // Make it like d3.scale
    // Passing in a value maps it do its domain
    var colors = function(x) {
      if(!arguments.length || typeof x !== 'string') {
        return values;
      }

      // return if we have seen that property before
      if(values.hasOwnProperty(x)) {
        return values[x];
      }

      // otherwise just tell d3 to generate a new color
      values[x] = d3.hsl(360/domain.length * (domain.indexOf(x)), saturation, light).toString();
      return values[x];
    };

    // Method to get all values
    colors.values = function() {
      return values;
    };

    // Getter/Setter methods to set new light and saturation
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

    // Set a new domain for the colors
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

    // method to reset the model
    colors.empty = function() {
      values = {};

      return colors;
    };

    // Manually getting/setting values
    colors.value = function(name, value) {
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
