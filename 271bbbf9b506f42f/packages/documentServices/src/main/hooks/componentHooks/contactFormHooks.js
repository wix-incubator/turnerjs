define(['lodash'], function (_) {
    'use strict';

    var CONTACT_FORM_COMP_TYPE = 'wysiwyg.viewer.components.ContactForm';
    var CONTACT_FORM_DATA_TYPE = 'ContactForm';

    function resolveContactFormMetaData(privateServices, contactFormDataItem) {
        var contactFormsMetaDatas = privateServices.dal.get(privateServices.pointers.general.getContactFormsMetaData());
        var metaDataForContactForm = contactFormsMetaDatas[contactFormDataItem.id];
        _.merge(contactFormDataItem, metaDataForContactForm);
    }

    function updateContactFormMetaData(privateServices, componentPointer, dataItem) {
        if (dataItem) {
            var contactFormsMetaDataPointer = privateServices.pointers.general.getContactFormsMetaData();
            var contactFormsMetaDatas = privateServices.dal.get(contactFormsMetaDataPointer);
            var metaDataForContactForm = contactFormsMetaDatas[dataItem.id];
            var updatedContactFormMetaData = _.assign({}, metaDataForContactForm, _.pick(dataItem, _.keys(metaDataForContactForm)));
            var contactFormMetaDataPointer = privateServices.pointers.getInnerPointer(contactFormsMetaDataPointer, dataItem.id);
            privateServices.dal.set(contactFormMetaDataPointer, updatedContactFormMetaData);
        }
    }

    function initContactFromHooks(hooks) {
        hooks.registerHook(hooks.HOOKS.DATA.AFTER_GET, resolveContactFormMetaData, CONTACT_FORM_DATA_TYPE);
        hooks.registerHook(hooks.HOOKS.DATA.UPDATE_BEFORE, updateContactFormMetaData, CONTACT_FORM_COMP_TYPE);
    }

    return {
        initContactFromHooks: initContactFromHooks
    };
});
