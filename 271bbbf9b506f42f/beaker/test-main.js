(function(){
    "use strict";

    var tests = Object.keys(window.__karma__.files).filter(function (file) {
        return /\.it\.js/.test(file);
    });

    window.onerror = function() {
        console.error([].slice.call(arguments).map(JSON.stringify));
    };

    var rjsConfig = Object.assign({}, window.getViewerRjsConfig.default({
        scriptsDomainUrl: "https://static.parastorage.com/"
    }));

    Object.assign(rjsConfig.paths, {
        "santa-harness": "beaker/core/santa-harness",
        "componentUtils": "beaker/utils/componentUtils",
        "errorUtils": "beaker/utils/errorUtils",
        "apiCoverageUtils": "beaker/utils/apiCoverageUtils",
        "generalUtils": "beaker/utils/generalUtils",
        "beakerUtils": "beaker/utils",
        "experiment": "js/plugins/experiment/experiment"
    });

    var conf = Object.assign(Object.assign(rjsConfig, {
        deps: tests,
        callback: window.__karma__.start
    }), {baseUrl: '/base'});


    function isPlainObject(obj) {
        return typeof obj === 'object' && !(Array.isArray(obj));
    }

    function addProtocol(url) {
        return (/^\/\//g.test(url) ? 'http:' : '') + url;
    }

    Object.keys(conf.paths)
        .filter(function (key) {
            return isPlainObject(conf.paths[key]);
        }).forEach(function (key) {
        conf.paths[key] = addProtocol(conf.paths[key].source);
    });


    requirejs.config(conf);
}());
