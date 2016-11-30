'use strict';
const _ = require('lodash'),
    fs = require('fs'),
    path = require('path'),
    jsonpatch = require('jsonpatch'),
    httpUtils = require('./httpUtils'),
    santaContextGenerator = require('./node-santa-context'),
    jsdom = require('jsdom'),
    color = require('color');

const santaRoot = path.resolve(__dirname, '..', '..', '..');
const requireJsConfig = JSON.parse(fs.readFileSync(path.join(santaRoot, 'server', 'resources', 'generated', 'local-requirejs-config.json')));

const animations = {addTickerEvent: _.noop};

const browserSpecificPackagesDefaultValue = _.constant(_.noop);
const browserSpecificPackages = {
    zepto: browserSpecificPackagesDefaultValue,
    DrawSVGPlugin: browserSpecificPackagesDefaultValue,
    swfobject: browserSpecificPackagesDefaultValue,
    TweenMax: browserSpecificPackagesDefaultValue,
    TimelineMax: browserSpecificPackagesDefaultValue,
    ScrollToPlugin: browserSpecificPackagesDefaultValue,
    mousetrap: browserSpecificPackagesDefaultValue,
    SoundManager: browserSpecificPackagesDefaultValue,
    speakingurl: browserSpecificPackagesDefaultValue,
    jjv: browserSpecificPackagesDefaultValue,
    animations: animations,
    reactDOM: browserSpecificPackagesDefaultValue,
    pmrpc: browserSpecificPackagesDefaultValue,
    jsonpatch: _.constant(jsonpatch),
    color: _.constant(color)
};

function validLocalPath(sourcePath) {
    return _.isString(sourcePath) && !_.startsWith(sourcePath, '//');
}

requireJsConfig.paths = _.mapValues(requireJsConfig.paths, function (pathData) {
    return (validLocalPath(pathData) && pathData) ||
        (validLocalPath(pathData.source) && pathData.source) ||
        (validLocalPath(pathData.min) && pathData.min);
});

function noopify(obj) {
    _.forOwn(obj, function (val, key) {
        if (_.isFunction(val)) {
            obj[key] = _.noop;
        } else if (_.isPlainObject(val)) {
            noopify(val);
        }
    });
}

function createRequireJS(options) {
    options = options || {};
    options.enableClientSideLogging = options.enableClientSideLogging || false;
    options.context = options.context || 'NODE_SANTA_REQUIRE';

    const santaContext = santaContextGenerator();

    const requirejs = require('requirejs');

    const localRequire = requirejs.config(_.omit(_.assign({}, requireJsConfig, {
        baseUrl: santaRoot,
        context: options.context
    }), 'shim'));

    const context = requirejs.s.contexts[options.context];

    _.forEach(_.assign({experiment: santaContext.experiment}, browserSpecificPackages), function (packageDef, packageName) {
        context.defQueue.push([packageName, [], packageDef]);
        context.defQueueMap[packageName] = true;
    });

    localRequire('utils').ajaxLibrary.register(httpUtils.ajaxHarness.bind(null, santaContext.updateContext));

    const jsdomDefaultView = jsdom.jsdom({
        features: {
            FetchExternalResources: false,
            ProcessExternalResources: false
        }
    }).defaultView;
    const fragment = localRequire('coreUtils').fragment;
    fragment.document = {
        createDocumentFragment: jsdomDefaultView.document.createDocumentFragment.bind(jsdomDefaultView.document),
        createTextNode: jsdomDefaultView.document.createTextNode.bind(jsdomDefaultView.document),
        createElement: jsdomDefaultView.document.createElement.bind(jsdomDefaultView.document)
    };
    fragment.Node = jsdomDefaultView.Node;



    if (!options.enableClientSideLogging) {
        const loggingUtils = localRequire('loggingUtils');
        noopify(loggingUtils);
        loggingUtils.performance.time = function (name, code) {
            return code.apply(this, Array.prototype.slice.call(arguments, 4));
        };
    }
    santaContext.initializeContext();
    localRequire.initializeContext = santaContext.initializeContext;
    localRequire.getSessionlessExperiments = santaContext.getSessionlessExperiments;
    return localRequire;
}

module.exports = createRequireJS;


