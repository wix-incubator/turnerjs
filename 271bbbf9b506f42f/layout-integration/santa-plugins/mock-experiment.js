define(['lodash'], function (_) {
    'use strict';

    var runningExperiments = {};

    function isOpen(name) {
        return Boolean(runningExperiments[name.toLowerCase()]);
    }

    function openExperiments(){
        _.forEach(arguments, function(exp){
            runningExperiments[exp.toLowerCase()] = 1;
        });
    }
    function closeExperiments(){
        if (!arguments.length) {
            runningExperiments = {};
        } else {
            _.forEach(arguments, function(exp){
                delete runningExperiments[exp.toLowerCase()];
            });
        }
    }

    function setExperiments(experimentsMap){
        experimentsMap = experimentsMap || {};
        runningExperiments = _.mapKeys(experimentsMap, function(v, exp){
            return exp.toLowerCase();
        });
    }

    return {
        isOpen: isOpen,
        openExperiments: openExperiments,
        closeExperiments: closeExperiments,
        setExperiments: setExperiments
    };
});
