(function(packagesList) {
    'use strict';
    /*global getViewerRjsConfig:false*/

    function assign(dest, src) {
        Object.keys(src).forEach(function (key) {
            dest[key] = src[key];
        });
    }

    function isPlainObject(obj) {
        return typeof obj === 'object' && !(Array.isArray(obj));
    }

    function addProtocol(url) {
        return (/^\/\//g.test(url) ? 'http:' : '') + url;
    }

    var testExtensionPattern = new RegExp(window.__karma__.config.santaTestPattern || '\.spec\.js$');

    var config = getViewerRjsConfig.default({scriptsDomainUrl: 'http://static.parastorage.com/'});
    Object.keys(config.paths)
        .filter(function (key) {
            return isPlainObject(config.paths[key]);
        }).forEach(function (key) {
            config.paths[key] = addProtocol(config.paths[key].source);
        });

    assign(config.paths, {
        Squire: 'js/vendor/squire/src/Squire',
        definition: 'js/plugins/definition/src/main/definition',
        fake: 'js/plugins/fake/src/main/fake',
        skintest: 'js/plugins/skintest/src/main/skintest',
        experiment: 'js/plugins/experiment/experiment'
    });

    assign(config, {
        packages: packagesList.map(function (name) {
            return {
                name: name,
                location: 'packages/' + name + '/src/main',
                main: name
            };
        }),
        baseUrl: '/base/',
        deps: Object.keys(window.__karma__.files).filter(new RegExp().test.bind(testExtensionPattern)),
        callback: window.__karma__.start
    });

    requirejs.config(config);

    requirejs(['utils', 'zepto'], function (utils, $) {
        utils.ajaxLibrary.register($.ajax);
        utils.ajaxLibrary.enableJsonpHack();
    });
}(window.packagesList));
