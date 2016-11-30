define([
    'documentServices/componentDetectorAPI/componentDetectorAPI',
    'documentServices/dataModel/dataModel',
    'documentServices/wixapps/utils/getBlogNewSocialShareButtonsCustomizationForView',
    'lodash',
    'utils'
], function (
    componentDetectorAPI,
    dataModel,
    getBlogNewSocialShareButtonsCustomizationForView,
    _,
    utils
) {
    'use strict';

    return useNewBlogSocialShareButtons;

    function useNewBlogSocialShareButtons(ps) {
        _(componentDetectorAPI.getComponentByType(ps, 'wixapps.integration.components.AppPart'))
            .filter(function (pointer) {
                var data = dataModel.getDataItem(ps, pointer);
                return data.appPartName === utils.blogAppPartNames.SINGLE_POST;
            })
            .forEach(function (pointer) {
                var data = dataModel.getDataItem(ps, pointer);
                var customization = getBlogNewSocialShareButtonsCustomizationForView(data.viewName);
                data.appLogicCustomizations.push(customization);
                dataModel.updateDataItem(ps, pointer, data);
            })
            .value();
    }
});
