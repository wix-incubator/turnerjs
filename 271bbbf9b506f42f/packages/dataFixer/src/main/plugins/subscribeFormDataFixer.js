define(['lodash', 'coreUtils', 'translationsUtils'], function (_, coreUtils, translationsUtils) {
    'use strict';

    var TRANSLATABLE_FIELDS = ['emailFieldLabel', 'errorMessage', 'firstNameFieldLabel', 'lastNameFieldLabel', 'phoneFieldLabel', 'submitButtonLabel', 'subscribeFormTitle', 'successMessage', 'validationErrorMessage'];

    function isTemplate() {
        return _.get(typeof window !== 'undefined' && window, 'rendererModel.siteInfo.documentType') === 'Template';
    }

    function fixSubscribeFormTranslatableFields(docData, requestModel, currentUrl){
        var lang, trans;
        if (!isTemplate()) {
            return;
        }

        lang = coreUtils.wixUserApi.getLanguage(requestModel.cookie, currentUrl);
        trans = translationsUtils.subscribeFormTranslations[lang];
        if (!trans) {
            return;
        }

        _.forOwn(docData, function (dataItem) {
            if (dataItem.type === 'SubscribeForm') {
                _.forEach(TRANSLATABLE_FIELDS, function (field) {
                    dataItem[field] = trans[field] || dataItem[field];
                });
            }
        });
    }

    function fixAddSubmitAction (docData){
        _.forOwn(docData, function (dataItem) {
            if (dataItem.type === 'SubscribeForm') {
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
            fixSubscribeFormTranslatableFields(docData, requestModel, currentUrl);
            fixAddSubmitAction(docData);


        }
    };

    return exports;
});
