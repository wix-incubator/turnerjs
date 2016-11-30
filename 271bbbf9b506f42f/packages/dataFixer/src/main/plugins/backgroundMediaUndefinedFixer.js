define(['lodash', 'coreUtils'], function(_, coreUtils) {
    'use strict';

    var BG_MEDIA_TYPE = 'BackgroundMedia';

    var BG_ITEM_TEMPLATE = {
        alignType: 'center',
        color: '{color_11}',
        fittingType: 'fill',
        scrollType: 'scroll',
        type: 'BackgroundMedia'
    };

    var PAGE_BACKGROUNDS_TEMPLATE = {
        pageBackgrounds: {
            desktop: {
                custom: true,
                isPreset: true,
                ref: null
            },
            mobile: {
                custom: true,
                isPreset: true,
                ref: null
            }
        }
    };

    function generateBgItemId(idPrefix, item){
        return coreUtils.guidUtils.getUniqueId(item.id, '_') + idPrefix;
    }

    function addNewBgItem(id, pageData) {
        pageData[id] = _.assign({id: id}, BG_ITEM_TEMPLATE);
    }

    /**
     * For each page, check if mobile bg is defined, and if not, fill in with a basic bg object.
     * @param pageData
     */
    function fixUndefinedBackgroundMediaItems(pageData) {
        var pageDataItems = _.filter(pageData, function(item) {
            return item.type === 'Page' || item.type === 'AppPage';
        });

        _.forEach(pageDataItems, function(item) {
            var id;
            _.defaults(item, PAGE_BACKGROUNDS_TEMPLATE);

            if (!item.pageBackgrounds.mobile.ref) {
                id = generateBgItemId('_mobile_bg', item);
                addNewBgItem(id, pageData);
                item.pageBackgrounds.mobile.ref = '#' + id;
            }

            if (!item.pageBackgrounds.desktop.ref) {
                id = generateBgItemId('_desktop_bg', item);
                addNewBgItem(id, pageData);
                item.pageBackgrounds.desktop.ref = '#' + id;
            }
        });

    }



    /**
     * @exports utils/dataFixer/plugins/backgroundMediaFixer
     * @type {{exec: function}}
     */
    var exports = {
        exec: function(pageJson) {
            if (!pageJson.structure) {
                return;
            }

            var data = pageJson.data.document_data;
            var hasBgMedia = _.some(data, {type: BG_MEDIA_TYPE});

            // Run ONLY if we have at least one BackgroundMedia item
            if (hasBgMedia) {
                fixUndefinedBackgroundMediaItems(data);
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
