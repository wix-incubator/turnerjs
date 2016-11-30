// Karma configuration
/*eslint santa/enforce-package-access:0*/
module.exports = function (config) {
    'use strict';
    require('../../js/test/karmaConf')(config, true, __dirname.split(require('path').sep).pop());
};

