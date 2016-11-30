define(["lodash", "fonts", "wixappsCore"], function (_, /** fonts */ fonts, /** wixappsCore */ wixapps) {
    "use strict";

    function getPackageName(siteData, appId) {
        var clientSpec = siteData.getClientSpecMapEntry(appId);
        return clientSpec && clientSpec.packageName;
    }

    fonts.fontUtils.registerCustomTextDataGetter("AppPart", function (siteData, compData) {
        var packageName = getPackageName(siteData, compData.appInnerID);
        if (!packageName) {
            return null;
        }

        var dataItemPaths = wixapps.wixappsDataHandler.getDataByCompId(siteData, packageName, compData.id);
        if (!dataItemPaths) {
            return null;
        }

        var dataByPath = wixapps.wixappsDataHandler.getDataByPath(siteData, packageName, dataItemPaths);
        var partDataItems = _.compact(_.flattenDeep([dataByPath]));

        var ret = [];
        _.forEach(partDataItems, function (item) {
            _.forEach(item, function (field) {
                var typeName = wixapps.typeNameResolver.getDataItemTypeName(field);
                if (_.includes(["wix:MediaRichText", "wix:RichText"], typeName)) {
                    ret.push(field.text);
                }
            });
        });

        return ret;
    });

    function getDescriptor(siteData, appId) {
        var packageName = getPackageName(siteData, appId);
        return packageName && wixapps.wixappsDataHandler.getDescriptor(siteData, packageName);
    }

    function getFontFamiliesFromViewsInDescriptor(descriptor) {
        var fontFamilies = [];
        _.forEach(descriptor.views, function (viewDef) {
            wixapps.viewsUtils.traverseViews(viewDef, function (view) {
                var fontFamily = view.comp && view.comp.fontFamily;
                if (fontFamily) {
                    fontFamilies.push(fontFamily);
                }
            });
        });

        return fontFamilies;
    }

    function getFontFamiliesFromCustomizations(customizations) {
        return _(customizations).filter({key: 'comp.fontFamily'}).map('value').value();
    }

    fonts.fontUtils.registerCustomFontFamiliesGetter('AppPart', function (siteData, compData) {
        var fontFamilies = [];

        var descriptor = getDescriptor(siteData, compData.appInnerID);
        if (descriptor) {
            fontFamilies = fontFamilies.concat(getFontFamiliesFromViewsInDescriptor(descriptor));
            fontFamilies = fontFamilies.concat(getFontFamiliesFromCustomizations(descriptor.customizations));
        }

        var customizations = _.compact(compData.appLogicCustomizations);
        if (customizations) {
            fontFamilies = fontFamilies.concat(getFontFamiliesFromCustomizations(customizations));
        }

        return fontFamilies;
    });

});
