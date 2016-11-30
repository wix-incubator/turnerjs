/**
 * Created by Dan_Shappir on 5/5/15.
 */
define(['lodash'], function (_) {
    'use strict';
    return function (classNames) {
        return _.keys(_.pick(classNames, _.identity)).join(' ');
    };
});
