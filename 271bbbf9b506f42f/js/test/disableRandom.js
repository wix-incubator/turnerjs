/*eslint santa/enforce-package-access:0, no-extend-native:0*/
/*eslint-env broswer*/


Math._random = Math.random;

Math.random = function() {
    'use strict';
    return 0.666; // https://xkcd.com/221
};

/*eslint-enable no-extend-native*/
//////////////////////////////////
