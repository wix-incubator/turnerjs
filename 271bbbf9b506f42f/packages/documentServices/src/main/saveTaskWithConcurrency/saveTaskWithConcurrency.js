define(['lodash', 'experiment'], function (_, experiment) {
    'use strict';

    var run = function (func) {

        function normalRunner(lastImmutableSnapshot, currentImmutableSnapshot, resolve, reject) {
            var oldResolver = function (msg) {
                var clientSpecMap = currentImmutableSnapshot.getIn(['rendererModel', 'clientSpecMap']).toJS();
                if (msg && msg.payload.clientSpecMap) {
                    resolve({'rendererModel.clientSpecMap': _.assign({}, clientSpecMap, msg.payload.clientSpecMap)});
                } else {
                    resolve();
                }
            };
            func(lastImmutableSnapshot, currentImmutableSnapshot, oldResolver, reject);
        }

        function concurrentRunner(lastImmutableSnapshot, currentImmutableSnapshot, resolve, reject) {
            var tries = 1;
            var concurrentResolver = function (msg) {
                if (!msg) {
                    resolve();
                    return;
                }

                var clientSpecMap = currentImmutableSnapshot.getIn(['rendererModel', 'clientSpecMap']).toJS();
                if (msg.success === true) {
                    resolve({'rendererModel.clientSpecMap': _.assign({}, clientSpecMap, msg.payload.clientSpecMap)});
                } else if (msg.success === false && msg.errorCode === -40103 && tries === 1) {
                    tries += 1;
                    func(lastImmutableSnapshot, currentImmutableSnapshot, concurrentResolver, reject);
                } else {
                    resolve();
                }
            };

            func(lastImmutableSnapshot, currentImmutableSnapshot, concurrentResolver, reject);
        }


        return function (lastImmutableSnapshot, currentImmutableSnapshot, resolve, reject) {
            var relevantRunner = normalRunner;
            if (experiment.isOpen('retryOnConcurrencyError')) {
                relevantRunner = concurrentRunner;
            }
            relevantRunner(lastImmutableSnapshot, currentImmutableSnapshot, resolve, reject);
        };
    };

    return run;
});
