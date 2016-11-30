define([
        'lodash'
    ],
    function (_) {
        'use strict';

        var Either = {

            Left: function (value) {
                return {left: value};
            },

            Right: function (value) {
                return {right: value};
            },

            isRight: _.partialRight(_.has, 'right'),
            get: _.partialRight(_.get, 'right'),

            getOrElse: function (either, defaultValue) {
                if (Either.isRight(either)) {
                    return Either.get(either);
                }
                return defaultValue;
            }
        };

        return Either;
    }
);
