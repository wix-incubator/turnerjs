define([
    'lodash', 
    'imageClientApi', 
    'dataFixer/imageService/imageTransformDataFixers'
], function(_, imageClientApi, imageTransformDataFixers) {
    'use strict';

    function fixBackgroundData(siteData) {
        var masterPageData = siteData.getMasterPageData();
        var theme = masterPageData.theme_data;
        var data = masterPageData.document_data;
        var bgIds = _(data).filter({type: 'BackgroundImage'}).map('id').value();

        // New schema? do nothing
        if (isPagesBgNewSchema(data)) {
            return;
        }

        // If we have no pageBackground object in the mainPage data, migrate
        if (isBgOnlyInTheme(data)) {
            propagateBgToPages(theme, data);

            // else we have the old schema, migrate
        } else {
            _.forEach(bgIds, function(id) {
                getMigratedBgDataItem(data[id]);
            });
        }
    }

    /**
     * Check if a page has reference to background.
     * Assuming that if one page has no ref, all pages has no ref.
     * @param data
     * @returns {boolean}
     */
    function isBgOnlyInTheme(data) {
        var page = _.find(data, {type: 'Page'});
        return !data[page.id].pageBackgrounds;
    }

    /**
     * Check if a page has reference to new data schema background.
     * Assuming that if one page has it, all pages has it.
     * @param data
     * @returns {boolean}
     */
    function isPagesBgNewSchema(data) {
        var page = _.find(data, {type: 'Page'});
        return (data[page.id].pageBackgrounds && data[page.id].pageBackgrounds.type === 'BackgroundMediaUnified');
    }

    /**
     * Convert theme bg string to new data structure ,inject data items to data and link it to all pages.
     * @param theme
     * @param data
     * @param pageIds
     */
    function propagateBgToPages(theme, data) {
        var defaultBgFallbackString = 'none 0 0 center center auto repeat repeat scroll none';
        var pageIds = _(data).filter({type: 'Page'}).map('id').value();

        //Migrate theme string to new data schema
        var bgString = theme.THEME_DATA.siteBg || defaultBgFallbackString;
        var mobileBgString = ((theme.THEME_DATA.mobileBg === '[siteBg]') ? theme.THEME_DATA.siteBg : theme.THEME_DATA.mobileBg) || defaultBgFallbackString;
        var bgData = getMigratedBgString(bgString);
        var mobileBgData = getMigratedBgString(mobileBgString);

        // Generate bg data item ids
        bgData.id = 'customBgImg' + generateRandomId();
        mobileBgData.id = 'customBgImg' + generateRandomId([bgData.id]);

        //Add bg data items to site data.
        data[bgData.id] = bgData;
        data[mobileBgData.id] = mobileBgData;

        //Add a reference to bg to all pages.
        _.forEach(pageIds, function(id) {
            data[id].pageBackgrounds = {
                desktop: {custom: true, isPreset: false, ref: '#' + bgData.id},
                mobile: {custom: true, isPreset: false, ref: '#' + mobileBgData.id}
            };
        });
    }

    /**
     * Generate a random data id, based on html-client DataManager.addDataItemWithUniqueId
     * @param [excludes]
     * @returns {string}
     */
    function generateRandomId(excludes) {
        var id = '';
        excludes = excludes || [];
        while (_.includes(excludes, id)) {
            id = _.random(0, 99999).toString(36).replace(" ", "_");
        }
        return id;
    }

    /**
     * Migrate Bg from theme string
     * @param bgString
     * @returns {*}
     */
    function getMigratedBgString(bgString) {
        var bgArray = _.compact(bgString.split(' '));
        return getMigratedBg.apply(this, bgArray);

    }

    /**
     * HTML-Client background has some annoying fitting type combos, we need to support them.
     * @param fittingType
     * @returns {*}
     */
    function getLegacyFittingTypes(fittingType) {
        // Legacy map for backgrounds from old editor.
        var legacyBgTypesMap = {};
        legacyBgTypesMap[imageClientApi.fittingTypes.TILE] = imageClientApi.fittingTypes.LEGACY_BG_FIT_AND_TILE;
        legacyBgTypesMap[imageClientApi.fittingTypes.TILE_HORIZONTAL] = imageClientApi.fittingTypes.LEGACY_BG_FIT_AND_TILE_HORIZONTAL;
        legacyBgTypesMap[imageClientApi.fittingTypes.TILE_VERTICAL] = imageClientApi.fittingTypes.LEGACY_BG_FIT_AND_TILE_VERTICAL;
        legacyBgTypesMap[imageClientApi.fittingTypes.ORIGINAL_SIZE] = imageClientApi.fittingTypes.LEGACY_BG_NORMAL;

        return legacyBgTypesMap[fittingType] || fittingType;
    }

    /**
     *
     * @param {string} imageId
     * @param {string} imageW
     * @param {string} imageH
     * @param {string} x
     * @param {string} y
     * @param {string} width
     * @param {string} repeatX
     * @param {string} repeatY
     * @param {string} attachment
     * @param {string} color
     * @param {{isHidden: boolean, isPreset: boolean, schemaVersion: number}} [metaData]
     * @returns {{type: string, alignType: string, fittingType: string, attachment: string, imageWidth: number, imageHeight: number, uri: string, color: string, metaData: {isHidden: (metaData.isHidden|boolean), isPreset: (metaData.isPreset|boolean), schemaVersion: number}}}
     */
    function getMigratedBg(imageId, imageW, imageH, x, y, width, repeatX, repeatY, attachment, color, metaData, id) {
        var alignType = imageTransformDataFixers.cssToAlignType(x + ' ' + y);
        var fittingType = imageTransformDataFixers.cssToFittingType({bgRepeat: repeatX + ' ' + repeatY, bgSize: width});
        fittingType = getLegacyFittingTypes(fittingType);

        metaData = metaData || {};
        //Be on the safe side
        if (!color || color === 'none') {
            color = 'rgba(0,0,0,0)';
        }

        return {
            type: 'BackgroundMediaUnified',
            alignType: alignType,
            fittingType: fittingType,
            attachment: attachment,
            imageWidth: Number(imageW),
            imageHeight: Number(imageH),
            mediaType: 'image',
            uri: imageId,
            color: color,
            metaData: { // TODO: HANDLE META DATA
                isHidden: metaData.isHidden || false,
                isPreset: metaData.isPreset || false,
                schemaVersion: 2.0
            },
            id: id
        };

    }

    function getMigratedBgDataItem(data) {

        var originalBgArray = [
            data.url,
            data.imagesizew,
            data.imagesizeh,
            data.positionx,
            data.positiony,
            data.width,
            data.repeatx,
            data.repeaty,
            data.attachment,
            data.color,
            data.metaData,
            data.id
        ];

        return getMigratedBg.apply(this, originalBgArray);
    }

    return {
        fixBackgroundData: fixBackgroundData,
        migrateBgDataItem: getMigratedBgDataItem,
        migrateBgString: getMigratedBgString
    };
});
