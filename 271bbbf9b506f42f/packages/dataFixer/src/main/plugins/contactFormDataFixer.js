define(['lodash', 'coreUtils', 'translationsUtils'], function (_, coreUtils, translationsUtils) {
    'use strict';

    var TRANSLATABLE_FIELDS = ['addressFieldLabel', 'emailFieldLabel', 'errorMessage', 'messageFieldLabel', 'nameFieldLabel', 'phoneFieldLabel', 'subjectFieldLabel', 'submitButtonLabel', 'successMessage', 'validationErrorMessage'];

    function isTemplate() {
        return _.get(typeof window !== 'undefined' && window, 'rendererModel.siteInfo.documentType') === 'Template';
    }

    function fixContactFormTranslatableFields(docData, requestModel, currentUrl){
        var lang, trans;
        if (!isTemplate()) {
            return;
        }

        lang = coreUtils.wixUserApi.getLanguage(requestModel.cookie, currentUrl);
        trans = translationsUtils.contactFormTranslations[lang];
        if (!trans) {
            return;
        }
        _.forOwn(docData, function (dataItem) {
            if (dataItem.type === 'ContactForm') {
                _.forEach(TRANSLATABLE_FIELDS, function (field) {
                    dataItem[field] = trans[field] || dataItem[field];
                });
            }
        });
    }

    function fixAddSubmitAction (docData){
        _.forOwn(docData, function (dataItem) {
            if (dataItem.type === 'ContactForm') {
                if (!dataItem.onSubmitBehavior){
                    dataItem.onSubmitBehavior = 'message';
                }
            }
        });
    }

    /**
     * @exports utils/dataFixer/plugins/contactFormDataFixer
     * @type {{exec: exec}}
     */
    var exports = {
        exec: function (pageJson, pageIdsArray, requestModel, currentUrl) {
            var docData = pageJson.data.document_data;
            fixContactFormTranslatableFields(docData, requestModel, currentUrl);
            fixAddSubmitAction(docData);
        }
    };

    return exports;
});
