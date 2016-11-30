/**
 * Created by avim on 17/11/2016.
 */
'use strict';
const _ = require('lodash');
const fs = require('fs');
const path = require('path');

// https://raw.githubusercontent.com/sindresorhus/globals/master/globals.json
const GLOBALS = JSON.parse(fs.readFileSync(path.join(__dirname, 'globals.json')).toString());
const BROWSER_ENV = ['builtin', 'es5', 'es6', 'browser'];
const NODE_ENV = ['builtin', 'es5', 'es6', 'node'];

const BROWSER_GLOBALS = _(BROWSER_ENV).map(_.get.bind(_, GLOBALS)).reduce(_.assign, {});
const NODE_GLOBALS = _(NODE_ENV).map(_.get.bind(_, GLOBALS)).reduce(_.assign, {});

const BROWSER_ONLY_GLOBALS = _.difference(_.keys(BROWSER_GLOBALS), _.keys(NODE_GLOBALS));

function lockBrowserGlobalsAccess() {
    var globalsTouched = [];
    _.forEach(BROWSER_ONLY_GLOBALS, (k) => {
        Object.defineProperty(global, k, {
            get: function () {
                globalsTouched.push(new Error().stack);
                return;
            },
            configurable: true
        });
    });

    return globalsTouched;
}

function unlockBrowserGlobalsAccess() {
    _.forEach(BROWSER_ONLY_GLOBALS, (k) => delete global[k]);
}

function assertBrowserGlobalsNotTouched(globalsTouched) {
    expect(globalsTouched).toEqual([]);
}

module.exports = {
    lockBrowserGlobalsAccess,
    unlockBrowserGlobalsAccess,
    assertBrowserGlobalsNotTouched
};
