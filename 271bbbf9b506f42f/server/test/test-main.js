'use strict';
var tests = Object.keys(window.__karma__.files).filter(function (file) {
    return /server\/test\/.*\.spec\.js/.test(file);
});

window.onerror = function () {
    console.error([].slice.call(arguments).map(JSON.stringify));
};

var rjsConfig = Object.assign({}, window.getViewerRjsConfig.default({
    scriptsDomainUrl: 'https://static.parastorage.com/'
}));

Object.assign(rjsConfig.paths, {
    experiment: 'js/plugins/experiment/experiment'
});

var conf = Object.assign(Object.assign(rjsConfig, {
    deps: tests,
    callback: window.__karma__.start
}), {baseUrl: '/base'});

requirejs.config(conf);
