define(['lodash'], function (_) {

    'use strict';

    function hashCustomization(customization) {
        var rule = _.omit(customization, 'value');
        return JSON.stringify(rule);
    }

    return {
        exec: function (pageJson) {
            _(pageJson.data.document_data)
                .filter({type: 'AppPart'})
                .forEach(function (appPart) {
                    var customizations = appPart.appLogicCustomizations;
                    var index = customizations.length;
                    var stateByHash = {};
                    while (index) {
                        index -= 1;
                        var hash = hashCustomization(customizations[index]);
                        if (!stateByHash[hash]) {
                            stateByHash[hash] = true;
                        } else {
                            customizations.splice(index, 1);
                        }
                    }
                })
                .value();
        }
    };

});
