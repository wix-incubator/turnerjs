define(['lodash', 'tpaIntegration/bootstrap/bootstrap', 'bluebird'], function(_, bootstrap, Promise) {
    'use strict';

    var init = function (global, core) {
        bootstrap.init(core);
        var specMatch = /[?&]jasminespec=([^&]+)/i.exec(global.location.search);
        if (_.isUndefined(specMatch)) {
            throw new Error('Invalid format of the "jasmineSpec" query parameter. Expected: package:name');
        }
        var specParam = decodeURIComponent(specMatch[1]);
        var specParamParts = specParam.split(':');
        if (specParamParts.length !== 2) {
            throw new Error('Invalid format of the "jasmineSpec" query parameter. Expected: package:name');
        }
        var specArtifact = specParamParts[0];
        var specName = specParamParts[1];

        var runner = specArtifact + specName;
        onSiteReady(100, 10).then(function () {
            bootstrap.run(global, runner);
        });
    };

    var onSiteReady = function (tries, timeout) {
        return new Promise(function (resolve, reject) {
            var checkSelector = setInterval(function () {
                var siteState = _.result(window, 'rendered.refs.siteAspectsContainer.isMounted');
                tries--;
                if (siteState) {
                    resolve();
                    clearInterval(checkSelector);
                } else if (tries === 0) {
                    reject();
                    clearInterval(checkSelector);
                }
            }, timeout);
        });
    };

    return {
        init: init
    };
});
