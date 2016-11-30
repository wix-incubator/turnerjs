define(['lodash', 'utils'], function (_, utils) {
    'use strict';

    var logger = utils.logger;

    var getEditorSessionIdFromURL = function () {
        var queryString = window.parent.location.search.replace(/^\??/, '');
        var params = utils.urlUtils.parseUrlParams(queryString);
        var esi = params.editorSessionId;
        getEditorSessionIdFromURL = function () {
            return esi;
        };
        return esi;
    };

    function getEditorSessionId(ps) {
        return ps.siteAPI.getEditorSessionId() || getEditorSessionIdFromURL();
    }

    function event(ps) {
        var args = _.rest(arguments);
        args[0] = _.defaults({}, args[0], {
            src: 38,
            endpoint: 'editor'
        });
        args[1] = _.defaults({}, args[1], {
            esi: getEditorSessionId(ps)
        });
        return ps.siteAPI.reportBI.apply(ps.siteAPI, args);
    }

    function error() {
        var args = _.toArray(arguments);
        args[1] = _.defaults({}, args[1], {
            endpoint: 'trg',
            evid: 10
        });
        return event.apply(this, args);
    }

    function register() {
        return logger.register.apply(logger, _.rest(arguments));
    }

    return {
        event: event,
        error: error,
        register: register
    };
});
