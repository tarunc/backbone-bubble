define("router", ["backbone", "BubbleChart"], function(Backbone, BubbleChart) {
  "use strict";

  // Defining the application router.
  return Backbone.Router.extend({
    routes: {
      "": "index"
    },

    index: function() {
      var bubbleChart = new BubbleChart({
        el: $('#main')[0],
        // Pass in additional custom options here
        url: '/data.json'
      });
    }
  });
});
