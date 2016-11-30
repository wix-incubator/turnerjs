define(['lodash'], function (_) {
    'use strict';

    var apps = {
        faq: {
            filterAppPart: {
                appPartName: 'f2c4fc13-e24d-4e99-aadf-4cff71092b88',
                viewName: 'ExpandQuestions'
            },
            filterAppLogicCustomization: {
                'type': 'AppPartCustomization',
                'forType': 'Category',
                'view': 'ToggleMobile',
                'key': 'comp.initialState',
                'fieldId': 'toggle',
                'format': 'Mobile'
            },
            modify: function (customization) {
                return _.assign(customization, {
                    fieldId: 'vars',
                    key: 'initialState'
                });
            }
        }
    };

    function exec(pageJson) {
        _(apps)
            .values()
            .forEach(function (app) {
                _(pageJson.data.document_data)
                    .filter(app.filterAppPart)
                    .forEach(function (part) {
                        part.appLogicCustomizations = _(part.appLogicCustomizations)
                            .map(function (customization) {
                                var shouldModify = _.find([customization], app.filterAppLogicCustomization);
                                return shouldModify ? app.modify(customization) : customization;
                            })
                            .compact()
                            .value();
                    })
                    .value();
            })
            .value();
    }

    return {
        exec: exec
    };
});