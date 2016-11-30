define(['lodash', 'immutable'], function(_, immutable) {
    'use strict';

    var wixImmutable = Object.create(immutable);

    //Facebook won't resolve this bug - https://github.com/facebook/immutable-js/pull/452, so we wrote our own fromJS
    wixImmutable.fromJS = function fromJSBecauseFacebookAreStupid(obj) {
        if (_.isArray(obj)) {
            return immutable.List(_.map(obj, fromJSBecauseFacebookAreStupid));
        }
        if (_.isObject(obj)) {
            return immutable.Map(_.mapValues(obj, fromJSBecauseFacebookAreStupid));
        }
        return obj;
    };

    return wixImmutable;
});
