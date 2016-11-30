/**
 * Created by avim on 25/10/2016.
 */
'use strict';
const _ = require('lodash');

function varStringify(data) {
    return _.map(data, (v, k) => `var ${k}=${JSON.stringify(v)};`).join('\n');
}

module.exports = varStringify;
