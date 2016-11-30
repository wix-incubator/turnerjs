define(['lodash'], function (_) {
    'use strict';

    function toIntegers(arrOfNumbersAsStrings) {
        return _.map(arrOfNumbersAsStrings, function (val) {
            return Number(val);
        });
    }

    function getNextId(routers) {
        if (_.isEmpty(routers)) {
            return 1;
        }

        var integerIds = toIntegers(_.keys(routers));
        return _.max(integerIds) + 1;
    }

    return {
        getNextId: getNextId
    };
});
