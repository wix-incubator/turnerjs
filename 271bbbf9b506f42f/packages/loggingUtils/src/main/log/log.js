define(['lodash', 'coreUtils'], function (_, coteUtils) {
    'use strict';

    var log = console.log.bind(console);
    var BASE_DEPRECATION_MESSAGE = 'DocumentServices|Deprecated|';

    var debugEnabled = typeof window === 'undefined' ? true : coteUtils.urlUtils.parseUrl(_.get(window, ['location', 'href'], '')).query.debug === 'all';
    var verbose = debugEnabled ? log : _.noop;

    return {
        verbose: verbose,
        info: log,
        warn: console.warn.bind(console),
        error: console.error.bind(console),
        warnDeprecation: function (deprecationMessage) {
            console.error.call(console, BASE_DEPRECATION_MESSAGE + deprecationMessage);
        }
    };
});
