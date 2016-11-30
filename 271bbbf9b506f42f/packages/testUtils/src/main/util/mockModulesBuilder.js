define(['lodash', 'fake'], function(_, fake){
    'use strict';

    /**
     * @param {string[]} moduleNames
     * @param {object<string, object>} functionOverrides a map between module name and field overrides
     * @param {function(object...)} callback
     */
    return function mockModules(moduleNames, functionOverrides, callback){
        require(moduleNames, function(){
            var origModules = arguments;
            var modules = _.map(origModules, function(origModule, index){
                return fake.mockObject(origModule, functionOverrides[moduleNames[index]]);
            });
            callback.apply(undefined, modules);
        });
    };

});
