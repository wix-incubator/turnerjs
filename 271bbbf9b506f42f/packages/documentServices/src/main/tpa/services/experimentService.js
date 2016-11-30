define(['lodash'], function (_) {
    'use strict';

    var experiments = {
        isEcomPagesMissingExperimentOn: _.noop
    };

    var setExperiments = function (_experiments) {
        _.merge(experiments, _experiments);
    };

    var getExperiments = function () {
       return experiments;
    };

    return {
        setExperiments: setExperiments,
        getExperiments: getExperiments
    };
});
