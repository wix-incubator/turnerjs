define([
    'lodash',
    'coreUtils'
], function (
    _,
    coreUtils
) {
    'use strict';

    return {
        exec: function (pageJson) {

            _(pageJson.data.document_data)
                .filter({
                    type: 'AppPart',
                    appPartName: coreUtils.blogAppPartNames.SINGLE_POST
                })
                .forEach(function (compData) {
                    var customization = _.find(compData.appLogicCustomizations, {
                        forType: 'Post',
                        fieldId: 'vars',
                        key: 'selectionSharerExperimentOpen',
                        view: compData.viewName
                    });

                    if (!customization) {
                        customization = {
                            forType: 'Post',
                            fieldId: 'vars',
                            key: 'selectionSharerExperimentOpen',
                            view: compData.viewName,
                            type: 'AppPartCustomization',
                            format: ''
                        };
                        compData.appLogicCustomizations.push(customization);
                    }
                })
                .value();
        }
    };
});
