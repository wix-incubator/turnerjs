define([], function () {
    'use strict';

    return {
        /**
         * Increment a number suffix of a given string
         * @param {string} str Original string
         * @param {string} [suffixSeparator] separator to use before the suffix, defaults to an empty space
         * @returns {string} with incremented suffix
         *
         *      @example
         *      incNumberSuffix('test', '_')   // returns 'test_2'
         *      incNumberSuffix('test_3', '_') // returns 'test_4'
         */
        incNumberSuffix: function(str, suffixSeparator) {
            suffixSeparator = suffixSeparator || ' ';
            var numberSuffix = parseInt(str.split(suffixSeparator).pop(), 10);
            if (isNaN(numberSuffix)) {
                return str + suffixSeparator + '2';
            }
            return str.split(suffixSeparator).slice(0, -1).concat(numberSuffix + 1).join(suffixSeparator);
        }
    };
});


