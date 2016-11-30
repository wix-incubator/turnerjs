define([
    'lodash',
    'documentServices/componentDetectorAPI/componentDetectorAPI',
    'documentServices/dataModel/dataModel',
    'documentServices/siteMetadata/siteMetadata',
    'documentServices/wixapps/utils/blogPaginationCustomizationsGetter',
    'utils'
], function (
    _,
    componentDetectorAPI,
    dataModel,
    siteMetadata,
    blogPaginationCustomizationsGetter,
    utils
) {
    'use strict';

    return {
        switchOnBlogPaginationIfSiteIsNew: function (ps) {
            if (siteIsNew(ps)) {
                addPaginationCustomizationsToFeeds(ps);
                addPaginationCustomizationsToCustomFeeds(ps);
            }
        }
    };

    function siteIsNew(ps) {
        return siteMetadata.generalInfo.isFirstSave(ps);
    }

    function addPaginationCustomizationsToFeeds(ps) {
        addPaginationCustomizationsToAppPartsByName(ps, utils.blogAppPartNames.FEED);
    }

    function addPaginationCustomizationsToCustomFeeds(ps) {
        addPaginationCustomizationsToAppPartsByName(ps, utils.blogAppPartNames.CUSTOM_FEED);
    }

    function addPaginationCustomizationsToAppPartsByName(ps, name) {
        _.forEach(getAppPartPointersByName(ps, name), _.partial(addPaginationCustomizationsToNamedAppPart, ps, name));
    }

    function addPaginationCustomizationsToNamedAppPart(ps, name, pointer) {
        var data = dataModel.getDataItem(ps, pointer);
        data.appLogicCustomizations = data.appLogicCustomizations.concat(
            blogPaginationCustomizationsGetter.getBlogPaginationCustomizationsByAppPartName(name)
        );
        dataModel.updateDataItem(ps, pointer, data);
    }

    function getAppPartPointersByName(ps, name) {
        return _.filter(getAppPartPointers(ps), function (pointer) {
            var data = dataModel.getDataItem(ps, pointer);
            return data.appPartName === name;
        });
    }

    function getAppPartPointers(ps) {
        return componentDetectorAPI.getComponentByType(ps, 'wixapps.integration.components.AppPart');
    }
});
