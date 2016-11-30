define(["lodash", "fonts", "wixappsCore", "wixappsBuilder/core/appRepo", 'wixappsBuilder/core/appPart2DataFetchingStateManager'], function (_, /** fonts */ fonts, /** wixappsCore */ wixapps, /** appRepo */ appRepo, dataFetchingStateManager) {
    "use strict";


    function getFontFamiliesFromViews(views) {
        var fontFamilies = [];
        _.forEach(views, function (viewDef) {
            wixapps.viewsUtils.traverseViews(viewDef, function (view) {
                if (view.comp.fontFamily) {
                    fontFamilies.push(view.comp.fontFamily);
                }
            });
        });
        return fontFamilies;
    }


    fonts.fontUtils.registerCustomTextDataGetter("AppBuilderComponent", function (siteData, compData) {
        var appService = siteData.getClientSpecMapEntry(compData.appInnerID);
        if (!appService) {
            return null;
        }

        if (!dataFetchingStateManager.hasPartLoadedSuccessfully(siteData, appService, compData.appPartName)) {
            return null;
        }

        var packageName = "appbuilder";
        var repo = wixapps.wixappsDataHandler.getDescriptor(siteData, packageName);
        var dataSelector = repo && appRepo.getDataSelector(repo, compData.appPartName, siteData, appService, repo.applicationInstanceVersion);
        if (!dataSelector) {
            return null;
        }

        var dataItemPaths = dataSelector.getData();
        if (!dataItemPaths || dataItemPaths.length === 0) {
            return null;
        }

        var dataByPath = wixapps.wixappsDataHandler.getDataByPath(siteData, packageName, dataItemPaths);
        var partDataItems = _.compact(_.flattenDeep([dataByPath]));

        var ret = [];
        _.forEach(partDataItems, function (componentData) {
            _.forEach(componentData, function (field) {
                var typeName = wixapps.typeNameResolver.getDataItemTypeName(field);
                if (_.includes(["wix:MediaRichText", "wix:RichText"], typeName)) {
                    ret.push(field.text);
                }
            });
        });

        return ret;
    });


    fonts.fontUtils.registerCustomFontFamiliesGetter('AppBuilderComponent', function (siteData/*, compData*/) {
        var fontFamilies = [];

        var descriptor = wixapps.wixappsDataHandler.getDescriptor(siteData, 'appbuilder');
        if (descriptor && !_.isEmpty(descriptor.views)) {
            fontFamilies = fontFamilies.concat(getFontFamiliesFromViews(descriptor.views));
        }

        return fontFamilies;
    });

});