define(["lodash", "core", "utils", "componentsPreviewLayer/bi/errors"], function (_, /** core */ core, utils, biErrors) {
    "use strict";

    /**
     * @type {core.core.dataRequirementsChecker}
     */
    var dataRequirementsChecker = core.dataRequirementsChecker;

    function isDecrypted(emailStr) {
        return (/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/).test(emailStr);
    }

    function buildUrl(hostUrl, siteId, email) {
        var serviceEndPointTemplate = _.template('/html/email/decrypt/<%=email%>/<%=siteId%>');
        return '//' + hostUrl + serviceEndPointTemplate({email: email, siteId: siteId});
    }

    function reportBiError(siteData, fieldName, fieldValue) {
        utils.logger.reportBI(siteData, biErrors.CONTACT_FORM_EMAIL_DECRYPT_FAILURE, {
            dataFieldName: fieldName,
            originalMail: fieldValue,
            errorMsg: 'Server could not decrypt user email'
        });
    }

    function getEmailRequest(siteData, fieldName, compInfo) {
        var requestsPath = ['requests', compInfo.pageId, compInfo.data.id];
        var destPath = ['contactforms_metadata', compInfo.data.id];
        var fieldValue = _.get(compInfo, ['data', fieldName]);

        return !_.isEmpty(fieldValue) && !isDecrypted(fieldValue.trim()) && !_.has(siteData, requestsPath) &&
            {
                url: buildUrl(siteData.currentUrl.host, siteData.siteId, fieldValue),
                destination: destPath,
                force: true,
                error: function (err, response) {
                    _.set(siteData, requestsPath, {'error': err, 'response': response});
                    reportBiError(siteData, fieldName, fieldValue);
                },
                timeout: 1,
                transformFunc: function (res) {
                    _.set(siteData, requestsPath, 'success');
                    var val = {};
                    val[fieldName] = _.get(res, 'payload.email');
                    return val;
                }
            };
    }

    function formRequestGetter(siteData, compInfo) {
        return _.compact([
            getEmailRequest(siteData, 'toEmailAddress', compInfo),
            getEmailRequest(siteData, 'bccEmailAddress', compInfo)
        ]);
    }

    /**
     * This will get the items for parts on current page in the preview
     */
    dataRequirementsChecker.registerCheckerForCompType("wysiwyg.viewer.components.ContactForm", formRequestGetter);
    dataRequirementsChecker.registerCheckerForCompType("wysiwyg.common.components.subscribeform.viewer.SubscribeForm", formRequestGetter);

    return {
        formRequestGetter: formRequestGetter
    };
});

