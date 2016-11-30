'use strict';
const requirejs = require('requirejs');
const path = require('path');
const httpUtils = require('../common/httpUtils');
const packagesUtils = require('requirejs-packages').packagesUtils;
const root = path.resolve(__dirname, '../../..');
const packages = packagesUtils.getPackages(root, 'packages', 'src/main');
const q = require('q');

requirejs.config({
    baseUrl: root,
    packages: packages,
    paths: {
        lodash: '//static.parastorage.com/services/third-party/lodash/2.4.1/dist/lodash.min',
        react: 'js/vendor/react/0.14.3/react-with-addons',
        reactDOM: 'js/vendor/react/0.14.3/react-dom.min',
        reactDOMServer: 'js/vendor/react/0.14.3/react-dom-server.min',
        classNames: 'js/vendor/classnames-1.2.0',
        empty: 'js/vendor/empty',
        Color: 'js/vendor/color-convert/0.2.0/color.min',
        hammer: 'js/vendor/hammerjs/2.0.8/hammer.min',
        experiment: 'js/plugins/experiment/experiment',
        bluebird: 'js/vendor/bluebird/2.9.4/bluebird.min',
        'date-fns': 'js/vendor/date-fns/v1.3.0/date_fns.min',
        fake: 'js/plugins/fake/src/main/fake',
        Squire: 'js/vendor/squire/Squire',
        definition: 'js/plugins/definition/src/main/definition',
        RemoteModelInterface: 'static/wixcode/static/RMI/rmi-bundle',
        ajv: 'js/vendor/ajv/3.4.0/ajv.min',
        speakingurl: 'js/test/vendor/speakingurl/speakingurl.min',
        jsonpatch: 'js/vendor/json-patch/json-patch.umd',
        xss: 'js/vendor/xss/0.2.12/xss.min',
        immutableDiff: 'js/vendor/immutablejsdiff.min',
        pmrpc: 'js/external/pmrpc'
    },
    bundles: {
        empty: ['zepto', 'swfobject', 'TweenMax', 'TimelineMax', 'ScrollToPlugin', 'DrawSVGPlugin', 'mousetrap', 'SoundManager'] //also add to js/vendors/empty.js
    },
    //Pass the top-level main.js/index.js require
    //function to requirejs so that node modules
    //are loaded relative to the top-level JS file.
    nodeRequire: require
});

function requireJsPromise(deps, func) {
    var deferred = q.defer();
    requirejs(deps, function () {
        var result = func.apply(this, arguments);
        deferred.resolve();
        return result;
    });
    return deferred.promise;
}

module.exports = q.all([
    requireJsPromise(['utils'], function (utils) {
        utils.ajaxLibrary.register(httpUtils.ajax);
        return utils.ajaxLibrary.ajax;
    })
]);
