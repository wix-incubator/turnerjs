define(['lodash', 'coreUtils'], function (_, coreUtils) {
    'use strict';

    var appPartMediaInnerCustomizationFormatFixer = {

        exec: function (pageJson) {
            if (!pageJson.data || !pageJson.data.document_data) {
                return;
            }

            _(pageJson.data.document_data)
                .filter(function isAppPart(component) {
                    return appPartMediaInnerCustomizationFormatFixer.isAppPartType(component.type);
                })
                .forEach(function (appPart) {
                    _(appPart.appLogicCustomizations)
                        .compact()
                        .groupBy('view')
                        .filter(function isMediaInnerView(ignoredCustomizations, view) {
                            return coreUtils.appPartMediaInnerViewNameUtils.isMediaInnerViewName(view);
                        })
                        .forEach(function (mediaInnerCustomizations) {
                            _(mediaInnerCustomizations)
                                .groupBy('fieldId')
                                .filter(function hasOnlyDesktopCustomizations(customizations) {
                                    return _.isEqual(_.pluck(customizations, 'format'), ['']);
                                })
                                .forEach(function (desktopCustomizations) {
                                    _.forEach(desktopCustomizations, function (customization) {
                                        customization.format = '*';
                                    });
                                })
                                .value();
                        })
                        .value();
                })
                .value();
        },


        isAppPartType: function (type) {
            return type === 'AppPart';
        }

    };


    return appPartMediaInnerCustomizationFormatFixer;

});
