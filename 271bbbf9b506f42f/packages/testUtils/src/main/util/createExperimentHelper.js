define(['lodash', 'testUtils/util/jasmineHelper'], function (_, jasmineHelper) {
    'use strict';

    return function(experiment) {
        function spyOnExp(methodName, fakeMethod) {
            if (!jasmineHelper.isSpy(experiment[methodName])) {
                spyOn(experiment, methodName).and.callFake(fakeMethod); // eslint-disable-line santa/no-spyon-experiment-isopen
                experiment[methodName].exps = {};
            }
        }

        function openExperiments() {
            spyOnExp('isOpen', function (exp) {
                return Boolean(experiment.isOpen.exps[exp]);
            });
            experiment.isOpen.exps = _(arguments)
                .flatten()
                .reduce(function(exps, exp) {
                    exps[exp] = true;
                    return exps;
                }, experiment.isOpen.exps);
        }

        function closeExperiments() {
            if (experiment.isOpen.exps) {
                experiment.isOpen.exps = _.omit(experiment.isOpen.exps, _.flatten(arguments));
            }
        }

        function setExperimentValue(name, value) {
            spyOnExp('getValue', function (exp) {
                return experiment.getValue.exps[exp];
            });
            experiment.getValue.exps[name] = value;
        }

        return {
            openExperiments: openExperiments,
            closeExperiments: closeExperiments,
            setExperimentValue: setExperimentValue
        };
    };
});
