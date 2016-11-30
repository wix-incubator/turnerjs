define(['lodash', 'utils'], function kibanaReporter(_, utils) {
    'use strict';

    var levels = {
        INFO: 'info',
        ERROR: 'error'
    };

    function _reportKibana(params, baseDomain) {
        var clonedParams = _.clone(params);
        clonedParams = _transform(clonedParams);

        var urlObject = {
            protocol: 'http:',
            hostname: 'monitoringhub.' + baseDomain,
            path: '/logstash/events/gost',
            query: clonedParams,
            hash: ''
        };
        var url = utils.urlUtils.buildFullUrl(urlObject);
        var image = new window.Image(0, 0);
        image.src = url;
    }

    function _transform(params) {
        var newParams = _.clone(params);
        //if (newParams.message instanceof Error) {
        if (_.isError(newParams.message)) {
            newParams.message = newParams.message.stack;
        }

        if (newParams.hasOwnProperty('message') && !_.isString(newParams.message)) {
            newParams.message = JSON.stringify(newParams.message);
        }

        var paramLengths = {
            message: 512
        };

        _.forEach(paramLengths, function (paramLength, paramName) {
            if (_.isString(params[paramName])) {
                newParams[paramName] = newParams[paramName].substr(0, Math.min(newParams[paramName].length, paramLength));
            }
        });

        return newParams;
    }

    function _getDefaultParams() {
        return {
            source: 'wix-code-client',
            level: levels.INFO,
            userActionId: utils.guidUtils.getGUID()
        };
    }

    function _validateBaseDomain(baseDomain) {
        if (!_.isString(baseDomain) || baseDomain.length === 0) {
            throw new Error('parameter `baseDomain` is invalid, received: ' + baseDomain);
        }
    }

    /**
     * Sends tracing information to Kibana.
     * The default parameters that are sent are:
     *  source='wix-code-client'
     *  level='info'
     *  actionPosition='start'
     *  timestamp (ms from 1/1/1970)
     *  userActionId (GUID string)
     *
     * @param params Can be overriding the default parameters or the following:
     *  action (string)
     *  appId (string)
     *  userId (string)
     *  message (string|Error)
     * @param baseDomain The base domain for the Kibana endpoint, for example "wix.com"
     * @returns {Function} A traceEnd function that automatically sends the following parameters:
     *  timestamp
     *  duration (calculated from the time the trace function was called)
     *  actionPosition='end'
     */
    function traceStart(params, baseDomain) {
        _validateBaseDomain(baseDomain);
        var date = new Date();
        var start = date.getTime();
        var extendedParams = _.assign({}, _getDefaultParams(), params, {
            timestamp: date.toJSON(),
            actionPosition: 'start'
        });
        _reportKibana(extendedParams, baseDomain);
        return function /*_traceEnd*/(endParams) {
            var endDate = new Date();
            var current = endDate.getTime();
            var duration = (current - start) / 1000;
            endParams = _.assign({}, extendedParams, endParams, {
                timestamp: endDate.toJSON(),
                duration: duration,
                actionPosition: 'end'
            });
            _reportKibana(endParams, baseDomain);
        };
    }

    return {
        levels: levels,
        trace: traceStart
    };
});
