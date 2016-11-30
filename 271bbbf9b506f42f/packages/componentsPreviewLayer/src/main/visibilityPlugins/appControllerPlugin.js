define([], function(){
    'use strict';

    return function shouldShowAppController(argsObj){
        var controllerType = 'platform.components.AppController';
        return (argsObj.compType !== controllerType) || argsObj.renderFlags.showControllers;
    };
});
