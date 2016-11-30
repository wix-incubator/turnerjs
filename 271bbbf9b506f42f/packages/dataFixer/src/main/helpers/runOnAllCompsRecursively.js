define(['lodash'], function(_){
    'use strict';
    function runOnAllCompsRecursively(comps, funcs) {
        _.forEach(comps, function (comp) {
            _.forEach(funcs, function (func) {
                func(comp);
            });
            if (comp.components) {
                runOnAllCompsRecursively(comp.components, funcs);
            }
        });
    }

    return runOnAllCompsRecursively;
});