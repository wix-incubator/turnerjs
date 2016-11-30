define(['lodash', 'imageClientApi', 'dataFixer/imageService/imageTransformDataFixers', 'coreUtils'], function (_, imageClientApi, fixers, coreUtils) {
    'use strict';

    var BG_MEDIA_TYPE = 'BackgroundMedia';
    var BG_IMAGE_TYPE = 'BackgroundImage';
    //var BG_OLD_PREFIX = 'customBgImg';
    var BG_IMAGE_PREFIX = 'bgImage';
    var BG_MEDIA_PREFIX = 'mediaBg';
    var BG_DATA_DELIMITER = '-';

    /**
     * Create BackgroundMedia Items on MasterPage
     * @param {object} theme
     * @param {object} masterPageData
     */
    function createBackgroundMediaOnMaster(masterPageData, theme) {
        // Pages data items from master page
        var pageDataItems = _.filter(masterPageData, function (item) {
            return item.type === 'Page' || item.type === 'AppPage';
        });
        var pageIds = _.map(pageDataItems, 'id');
        var hasBgImage = _.some(pageDataItems, function (item) {
            return item.pageBackgrounds && item.pageBackgrounds.desktop.ref;
        });

        if (hasBgImage) {
            convertBgImageToBgMediaItems(masterPageData);
        } else {
            var fallbackThemeDesktopBg = theme.siteBg;
            var fallbackThemeMobileBg = !theme.mobileBg || theme.mobileBg === '[siteBg]' ? theme.siteBg : theme.mobileBg;
            createBgDataFromTheme(masterPageData, fallbackThemeDesktopBg, fallbackThemeMobileBg, pageIds);
        }
    }

    /**
     * Create BackgroundMedia items on Page (if there were BackgroundImage items before)
     * @param {object} pageData page.data.document_data
     */
    function createBackgroundMediaOnPages(pageData) {
        convertBgImageToBgMediaItems(pageData);
    }

    /**
     * Covert all BackgroundImage items to BackgroundMedia items
     * @param {object} data masterPage.data.document_data or page.data.document_data
     */
    function convertBgImageToBgMediaItems(data) {
        var backgroundImageDataItems = _.filter(data, {type: BG_IMAGE_TYPE});
        _.forEach(backgroundImageDataItems, function (item) {
            convertBgImageToBgMediaItem(data, item);
        });
    }

    /**
     * Covert a single BackgroundImage item to BackgroundMedia item
     * @param {object} data masterPage.data.document_data or page.data.document_data
     * @param {object} backgroundImageItem
     */
    function convertBgImageToBgMediaItem(data, backgroundImageItem) {
        var bgId = backgroundImageItem.id;
        var imageId = coreUtils.guidUtils.getUniqueId(BG_IMAGE_PREFIX + BG_DATA_DELIMITER);
        var backgroundMediaItem = generateDataItemsFromBgImageData(backgroundImageItem);
        addBgMediaItemsToData(data, backgroundMediaItem, bgId, imageId);
    }

    /**
     * Add converted BackgroundMedia to the page/master page data
     * @param {object} data masterPage.data.document_data or page.data.document_data
     * @param {object} backgroundMediaItem
     * @param {string} bgId
     * @param {string} imageId
     */
    function addBgMediaItemsToData(data, backgroundMediaItem, bgId, imageId) {
        data[bgId] = _.assign({id: bgId}, backgroundMediaItem.bgItem);
        if (backgroundMediaItem.imageItem) {
            data[bgId].mediaRef = '#' + imageId;
            data[imageId] = _.assign({id: imageId}, backgroundMediaItem.imageItem);
        }
    }

    /**
     * Use the theme siteBg data to generate the BackgroundMedia data items
     * @param {object} masterPageData masterPage.data.document_data
     * @param {array} pageIds page ids from siteAsJson.masterPage.data.document_data
     * @param {string} themeDesktopBg siteBg string from siteAsJson.masterPage.data.theme_data.THEME_DATA
     * @param {string} themeMobileBg mobileBg string from siteAsJson.masterPage.data.theme_data.THEME_DATA
     * @param {Array} pageIds
     */
    function createBgDataFromTheme(masterPageData, themeDesktopBg, themeMobileBg, pageIds) {
        var desktopBackgroundItems = generateDataItemsFromBgString(themeDesktopBg);
        var mobileBackgroundItems = generateDataItemsFromBgString(themeMobileBg);

        _.forEach(pageIds, function (pageId) {
            var desktopBgId = coreUtils.guidUtils.getUniqueId(BG_MEDIA_PREFIX, BG_DATA_DELIMITER);
            var mobileBgId = coreUtils.guidUtils.getUniqueId(BG_MEDIA_PREFIX, BG_DATA_DELIMITER);
            var desktopImageId = desktopBgId.replace(BG_MEDIA_PREFIX, BG_IMAGE_PREFIX);
            var mobileImageId = mobileBgId.replace(BG_MEDIA_PREFIX, BG_IMAGE_PREFIX);

            setBgToPage(masterPageData, desktopBackgroundItems, pageId, desktopBgId, desktopImageId, 'desktop');
            setBgToPage(masterPageData, mobileBackgroundItems, pageId, mobileBgId, mobileImageId, 'mobile');
        });
    }

    /**
     * Set BackgroundMedia to a page while recycling old BackgroundImage data id
     * @param {object} data masterPage.data.document_data or page.data.document_data
     * @param {object} bgDataItems the generated data items
     * @param {string} pageId page id
     * @param {string} bgId old BackgroundImage id
     * @param {string} imageId  Image id
     * @param {string} device 'mobile' or 'desktop'
     */
    function setBgToPage(data, bgDataItems, pageId, bgId, imageId, device) {
        data[pageId].pageBackgrounds = data[pageId].pageBackgrounds || {desktop: '', mobile: ''};
        data[pageId].pageBackgrounds[device] = {ref: '#' + bgId, custom: true, isPreset: false};
        addBgMediaItemsToData(data, bgDataItems, bgId, imageId);
    }

    /**
     * create BackgroundMedia item from theme siteBg string
     * @param {string} bgString theme siteBg string
     * @returns {{bgItem:object, imageItem:object|undefined}}
     */
    function generateDataItemsFromBgString(bgString) {
        var bgObject = getBgObjectFromOldValues.apply(this, _.compact(bgString.split(' ')));
        return generateDataItemsFromBg(bgObject);
    }

    /**
     * create BackgroundMedia item from BackgroundImage Data
     * @param {string} bgString theme siteBg string
     * @returns {{bgItem:object, imageItem:object|undefined}}
     */
    function generateDataItemsFromBgImageData(data) {
        var bgObject = getBgObjectFromOldValues.apply(this, [
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
            data.metaData
            //data.id
        ]);
        return generateDataItemsFromBg(bgObject);
    }

    /**
     * Helper function to convert bg array to object
     * @param imageId
     * @param imageW
     * @param imageH
     * @param x
     * @param y
     * @param width
     * @param repeatX
     * @param repeatY
     * @param attachment
     * @param color
     * @returns {{imageId: *, imageW: *, imageH: *, x: *, y: *, width: *, repeatX: *, repeatY: *, attachment: *, color: *}}
     */
    function getBgObjectFromOldValues(imageId, imageW, imageH, x, y, width, repeatX, repeatY, attachment, color, metaData) {
        metaData = metaData || {};
        return {
            imageId: imageId,
            imageW: imageW,
            imageH: imageH,
            x: x,
            y: y,
            width: width,
            repeatX: repeatX,
            repeatY: repeatY,
            attachment: attachment,
            color: color,
            metaData: {
                isPreset: metaData.isPreset || false,
                schemaVersion: '2.0',
                isHidden: metaData.isHidden || false
            }
        };
    }

    /**
     * Build the data items for our background
     * @param {object} bgObject
     * @returns {{bgItem:object, imageItem:object|undefined}}
     */
    function generateDataItemsFromBg(bgObject) {
        var dataItems = {bgItem:{}};
        var color = 'rgb(255,255,255)';
        var alignType = fixers.cssToAlignType(bgObject.x + ' ' + bgObject.y);
        var fittingType = fixers.cssToFittingType({
            bgRepeat: bgObject.repeatX + ' ' + bgObject.repeatY,
            bgSize: bgObject.width
        });
        var scrollType = (bgObject.attachment === 'fixed') ? 'fixed' : 'scroll';

        fittingType = getLegacyFittingTypes(fittingType);

        if (bgObject.color && bgObject.color !== 'none') {
            color = bgObject.color;
        }

        if (bgObject.imageId && bgObject.imageId !== 'none') {
            dataItems.imageItem = {
                type: 'Image',
                uri: bgObject.imageId,
                width: parseInt(bgObject.imageW, 10),
                height: parseInt(bgObject.imageH, 10),
                metaData: {
                    isPreset: false,
                    schemaVersion: '1.0',
                    isHidden: false
                }
            };
        }

        dataItems.bgItem = {
            type: "BackgroundMedia",
            color: color,
            alignType: alignType,
            fittingType: fittingType,
            scrollType: scrollType,
            metaData: bgObject.metaData
        };

        return dataItems;
    }

    /**
     * HTML-Client background has some annoying fitting type combos, we need to support them.
     * @param fittingType
     * @returns {string}
     */
    function getLegacyFittingTypes(fittingType) {
        // Legacy map for backgrounds from old editor.
        var legacyBgTypesMap = {};
        legacyBgTypesMap[imageClientApi.fittingTypes.TILE] = imageClientApi.fittingTypes.LEGACY_BG_FIT_AND_TILE;
        legacyBgTypesMap[imageClientApi.fittingTypes.TILE_HORIZONTAL] = imageClientApi.fittingTypes.LEGACY_BG_FIT_AND_TILE_HORIZONTAL;
        legacyBgTypesMap[imageClientApi.fittingTypes.TILE_VERTICAL] = imageClientApi.fittingTypes.LEGACY_BG_FIT_AND_TILE_VERTICAL;
        legacyBgTypesMap[imageClientApi.fittingTypes.LEGACY_ORIGINAL_SIZE] = imageClientApi.fittingTypes.LEGACY_BG_NORMAL;

        return legacyBgTypesMap[fittingType] || fittingType;
    }

    function fixCorruptedBG(theme) {
        theme.siteBg = fixBgData(theme.siteBg);
        if (theme.mobileBg && theme.mobileBg !== '[siteBg]') {
            theme.mobileBg = fixBgData(theme.mobileBg);
        }
    }

    function fixBgData(bgString) {
        var bgParts = _.compact(bgString.split(' '));
        var bgObject = getBgObjectFromOldValues.apply(this, bgParts);
        var color = bgObject.color;
        if (color) {
            color = color.replace('[', '{');
            color = color.replace(']', '}');
            bgParts[9] = color;
        }
        return bgParts.join(' ');
    }

    /**
     * @exports utils/dataFixer/plugins/backgroundMediaFixer
     * @type {{exec: function}}
     */
    var exports = {
        exec: function (pageJson) {
            if (!pageJson.structure) {
                return;
            }

            var theme = pageJson.data.theme_data && pageJson.data.theme_data.THEME_DATA;
            var data = pageJson.data.document_data;
            var hasBgMedia = _.some(data, {type: BG_MEDIA_TYPE});
            var hasBgImage = _.some(data, {type: BG_IMAGE_TYPE});

            if (hasBgMedia && !hasBgImage) {
                return;
            }

            if (pageJson.structure.type === 'Document') {
                fixCorruptedBG(theme);
                createBackgroundMediaOnMaster(data, theme);
            } else {
                createBackgroundMediaOnPages(data);
            }
        }
    };

    return exports;
});

/**
 * Convert BackgroundImage or theme siteBG to BackgroundMedia Items
 *    @typeDef {object} BackgroundMediaDataSchema
 *    @property {string} mediaType (color, image, video, slideShow)
 *    @property {string} mediaRef (ImageData, VideoData, SlideShowData)
 *    @property {string} color (htmlColor, themeColor)
 *    @property {string} alignType
 *    @property {string} fittingType
 *    @property {string} scrollType (fixed, scroll, local)
 *    @property {string} imageOverlay (ImageData)
 *    @property {string} colorOverlay (htmlColor, themeColor)
 *
 *    @typeDef {object} WixVideoDataSchema
 *    @property {string} title
 *    @property {string} videoId
 *    @property {array<object>} qualities
 *    @property {string} qualities.quality
 *    @property {number} qualities.width
 *    @property {number} qualities.height
 *    @property {array} qualities.formats
 *    @property {string} posterImageRef (ImageData)
 *    @property {number} opacity (0...1)
 *    @property {number} duration
 *    @property {boolean} loop
 *    @property {boolean} autoplay
 *    @property {boolean} preload
 *    @property {boolean} controls
 *    @property {boolean} mute
 *    @property {{name: '', id: ''}} artist
 *
 *    @typeDef {object} ImageDataSchema
 *    @property {string} link ref
 *    @property {string} title
 *    @property {string} uri
 *    @property {string} description
 *    @property {number} height
 *    @property {number} width
 *    @property {number} borderSize
 *    @property {string} alt
 *    @property {string} originalImageDataRef ref
 *    @property {number} opacity (0...1)
 *    @property {{name: '', id: ''}} artist
 */
