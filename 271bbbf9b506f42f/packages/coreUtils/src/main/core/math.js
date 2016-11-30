define(['lodash'], function(_) {
    'use strict';

    function map(value, x1, x2, y1, y2) {
      return (value - x1) * ((y2 - y1) / (x2 - x1)) + y1;
    }

    function parseDegrees(x) {
        if (typeof x !== 'number') {
            return NaN;
        }
        return (x % 360 + 360) % 360;
    }

    function interpolateSegmentsFunction(couples) {
      var xys = _.unzip(couples);
      var xs = xys[0];
      var ys = xys[1];

      return function(val) {
        var seg = 0;

        while (seg < xs.length - 2 && val > xs[seg + 1]) {
          seg++;
        }

        var res = map(val, xs[seg], xs[seg + 1], ys[seg], ys[seg + 1]);
        return res;
      };
    }

    return {
        map: map,
        parseDegrees: parseDegrees,
        interpolateSegmentsFunction: interpolateSegmentsFunction
    };
});
