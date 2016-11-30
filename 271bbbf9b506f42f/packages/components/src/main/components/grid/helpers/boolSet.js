define([
        'lodash'
    ],
    function (_) {
        'use strict';

        var BoolSet = _.flow(
          _.partialRight(_.chunk, 2),
          _.partialRight(_.filter, _.last),
          _.partialRight(_.map, _.first)
        );

        return BoolSet;
    }
);
