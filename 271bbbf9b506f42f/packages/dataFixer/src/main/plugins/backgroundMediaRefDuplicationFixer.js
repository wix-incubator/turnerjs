define(['lodash'], function (_) {
    'use strict';

    function addNewMediaItem(id, item, data) {
        data[id] = _.assign({id: id}, _.omit(item, 'id'));
    }

    function getNewId(prefix, type, refName){
        return prefix + '_' + type + '_' + refName;
    }

    /**
     *
     * @param mediaParent {{BackgroundMediaDataSchema}|{WixVideoDataSchema}} the media parent
     * @param ref {'mediaRef'|'imageOverlay'|'posterImageRef'} the reference attribute, one of: backgroundMedia: mediaRef
     * @param pageData {object} page data
     * @param prefix {string}
     */
    function duplicateAndReferenceMediaItem(mediaParent, ref, type, pageId, pageDocumentData) {
        if (mediaParent[ref].indexOf('#' + pageId) === 0) {
            return;
        }
        var media = _.cloneDeep(pageDocumentData[mediaParent[ref].replace('#', '')]);
        var newId = getNewId(pageId, type, ref);
        addNewMediaItem(newId, media, pageDocumentData);
        mediaParent[ref] = '#' + newId;
    }


    /**
     *
     * @param type {string} 'mobile'|'desktop'
     * @param pageBgItem
     * @param pageData
     */
    function setBackgroundMediaRefPerDevice(type, pageData, pageDocumentData) {
        var bgRef = pageData.pageBackgrounds[type].ref.replace('#', '');
        var bgItem = pageDocumentData[bgRef];
        var mediaItem;
        //we might not find the media data on master page
        if (bgItem && bgItem.mediaRef) {
            mediaItem = pageDocumentData[bgItem.mediaRef.replace('#', '')];

            if (mediaItem.type === 'WixVideo') {
                duplicateAndReferenceMediaItem(mediaItem, 'posterImageRef', type, pageData.id, pageDocumentData);
            }
            if (bgItem.imageOverlay) {
                duplicateAndReferenceMediaItem(bgItem, 'imageOverlay', type, pageData.id, pageDocumentData);
            }
            duplicateAndReferenceMediaItem(bgItem, 'mediaRef', type, pageData.id, pageDocumentData);
        }


    }


    /**
     * For each page background device, check if mediaRef is unique.
     * @param pageData
     * @returns {[{data:pageItem,type:'desktop'|'mobile'}]} of items that should be fixed
     */
    function duplicatedBackgroundMediaItems(pageData, pageDocumentData) {

            if (pageData.pageBackgrounds) {
                setBackgroundMediaRefPerDevice('mobile', pageData, pageDocumentData);
                setBackgroundMediaRefPerDevice('desktop', pageData, pageDocumentData);
            }

    }


    /**
     * @exports utils/dataFixer/plugins/backgroundMediaRefDuplicationFixer
     * @type {{exec: function}}
     */
    var exports = {
        exec: function (pageJson) {
            if (!pageJson.structure) {
                return;
            }
            var documentData = pageJson.data.document_data;
            var pageDataItems = _.filter(documentData, function(item) {
                return item.type === 'Page' || item.type === 'AppPage';
            });

            _.forEach(pageDataItems, function (pageData){
                duplicatedBackgroundMediaItems(pageData, documentData);
            });

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
