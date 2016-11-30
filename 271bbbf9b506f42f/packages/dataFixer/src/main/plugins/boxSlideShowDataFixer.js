define(['lodash', 'coreUtils', 'translationsUtils'], function (_, coreUtils, translationsUtils) {
    'use strict';

    var TRANSLATE_FIELD = 'BOXSLIDESHOW_Regular_Slideshow_Slides_New_Slide_Label';

    function isTemplate() {
        return _.get(typeof window !== 'undefined' && window, 'rendererModel.siteInfo.documentType') === 'Template';
    }

    function fixSlideShowSlideTranslatableFields(docData, requestModel, currentUrl) {
        var lang, trans;
        if (!isTemplate()) {
            return;
        }

        lang = requestModel ? coreUtils.wixUserApi.getLanguage(requestModel.cookie, currentUrl) : "en";
        trans = translationsUtils.boxSlideShowTranslation[lang];
        if (!trans) {
            return;
        }
        _.forOwn(docData, function (dataItem) {
            if (dataItem.type === 'boxSlideShowSlide' || dataItem.type === 'StripContainerSlideShowSlide') {
                var currSlideIndex = dataItem.title ? dataItem.title.split(" ")[1] : "";
                dataItem.title = (trans[TRANSLATE_FIELD] && currSlideIndex) ? trans[TRANSLATE_FIELD].replace("<%= curr_slide %>", currSlideIndex) : dataItem.title;
            }
        });
    }


    /**
     * @exports utils/dataFixer/plugins/boxSlideShowDataFixer
     * @type {{exec: exec}}
     */
    var exports = {
        exec: function (pageJson, pageIdsArray, requestModel, currentUrl) {
            var docData = pageJson.data.document_data;
            fixSlideShowSlideTranslatableFields(docData, requestModel, currentUrl);
        }
    };

    return exports;
});
