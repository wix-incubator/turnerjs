/**@class wysiwyg.common.components.subscribeform.viewer.common.FormsMethods*/
define.Class('wysiwyg.common.components.subscribeform.viewer.common.FormsMethods', function (classDefinition) {
    var def = classDefinition;

    def.resources(['W.Config', 'W.Viewer', 'W.Commands', 'W.Utils', 'W.Resources']);

    def.methods({
        _handleMissingEmail: function (fieldName) {
            var data = this.getDataItem(),
                emailFromData = data.get(fieldName),
                emailFromConfig,
                isSuffix = function (str, suffixToCheck) {
                    return str.indexOf(suffixToCheck) === str.length - suffixToCheck.length;
                },
                isWixEmail = function (email) {
                    return email && isSuffix(email, "@wix.com");
                };

            if (emailFromData) return;

            emailFromConfig = this.resources.W.Config.getUserEmail();

            if (!isWixEmail(emailFromConfig)) {
                data.set(fieldName, emailFromConfig);
                this.setComponentProperty('useCookie', true);
            }
        },
        _decryptEmails: function (toEmailField, bbcEmailField, restClient) {
            var serviceBaseUrl = this._getServiceBaseUrl(),
                siteId = W.Config.getSiteId();

            serviceBaseUrl = serviceBaseUrl.replace('{{siteId}}', siteId);

            _.forEach(arguments, function(dataFieldName){
                var mail = this._data.get(dataFieldName);

                if(mail && !this._isDecryptedEmail(mail.trim())) {
                    this._doDecryptRequest(dataFieldName, mail, serviceBaseUrl);
                }
            }, this);
        },
        _doDecryptRequest: function (dataFieldName, encMail, serviceBaseUrl, restClient) {
            if(!restClient || typeof restClient !== 'object') return;

            var absoluteUrl = serviceBaseUrl.replace('{{mail}}', encMail),
                callbacks = {
                    "onSuccess": this._getSuccessCallback(dataFieldName),
                    "onError": this._getErrorCallback(dataFieldName)
                };

            restClient.get(absoluteUrl, {}, callbacks);
        },
        _getSuccessCallback: function (dataFieldName) {
            return function(response) {
                if(response.email) this._data.set(dataFieldName, response.email);
                else this._sendError(dataFieldName, 'Server returned success but no email field in response');
            }.bind(this);
        },
        _getErrorCallback: function (dataFieldName) {
            return function(response) {
                this._data.set(dataFieldName, '');
                this._sendError(dataFieldName, response);
            }.bind(this);
        },
        _getServiceBaseUrl: function () {
            return [
                window.location.protocol,
                '//',
                window.location.host,
                '/html/email/decrypt/{{mail}}/{{siteId}}'
            ].join('');
        },
        _isDecryptedEmail: function(str) {
            return (str.match(/^(([a-zA-Z0-9_\.\-\+])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+|\s*)$/)) ? true : false;
        },
        _sendError: function(dataFieldName, errMsg) {
            var logErrorParams = {
                dataFieldName: dataFieldName,
                originalMail: this._data.get(dataFieldName),
                errorMsg: errMsg
            };

            LOG.reportError(
                wixErrors.CONTACT_FORM_EMAIL_DECRYPT_FAILURE,
                'wysiwyg.viewer.components.ContactForm',
                '_sendError',
                JSON.stringify(logErrorParams)
            );
        },
        _transfortToHtmlEntites: function(string){
            return string.replace(/&/g, "&amp;").replace(/>/g, "&gt;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
        },
        _escapeHtml: function(data){
            return document.createTextNode(data);
        }
    });
});
