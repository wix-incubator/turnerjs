//This file was auto generated when experiment SM.New was promoted to feature (Wed Oct 17 17:43:57 IST 2012)
/**@class  wysiwyg.editor.managers.SMEditorManager*/
define.Class('wysiwyg.editor.managers.SMEditorManager', function (classDefinition) {
    /**@type bootstrap.managers.classmanager.ClassDefinition */
    var def = classDefinition;

    def.inherits('bootstrap.managers.BaseManager');

    def.binds(['_onProvisionError']);

    def.statics({
        SM_MY_ACCOUNT_LINK: "http://www.wix.com/create/my-account"
    });

    /**@lends wysiwyg.editor.managers.SMEditorManager*/
    def.methods({
        initialize: function () {
            //           W.SMEditor = this;
            //           if(W.Managers && W.Managers.list)
            //               W.Managers.list.push({target:'SMEditor'});
        },

        isReady: function () {
            return true;
        },

        provisionIfNeeded: function (onSuccess, onError) {
            if (this.isServiceProvisioned()) {
                onSuccess(this._getSiteMembersViewManager().getData());
            }
            else if (this.injects().Config.siteNeverSavedBefore()) {
                this._provisionBeforeMetasiteSave(onSuccess, onError);
            }
            else {
                this._provision(onSuccess, onError);
            }
        },

        _getSiteMembersViewManager: function () {
            return this.injects().Preview.getPreviewManagers().SiteMembers;
        },

        _provision: function (onSuccess, onError) {
            W.ServerFacade.smProvision(function (smData) {
                if (this._validateResponse(smData)) {
                    this._getSiteMembersViewManager().setData(smData);
                    onSuccess(smData);
                }
            }.bind(this), function (errorDescription, errorCode) {
                LOG.reportError("Unable to provision the site members service", this.$className, "_provision", errorCode + " " + errorDescription);
                this._onProvisionError(errorCode, onError);
            }.bind(this));
        },

        _provisionBeforeMetasiteSave: function (onSuccess, onError) {
            W.ServerFacade.smProvisionAppBeforeMetasiteSave(function (smData) {
                if (this._validateResponse(smData)) {
                    this._getSiteMembersViewManager().setData(smData);
                    this._preSaveProvisionSuccess = true;
                    onSuccess(smData);
                }
            }.bind(this), function (errorDescription, errorCode) {
                LOG.reportError("Unable to provision the site members service", this.$className, "_provisionBeforeMetasiteSave", errorCode + " " + errorDescription);
                this._onProvisionError(errorCode, onError);
            }.bind(this));
        },

        _onProvisionError: function (errorCode, onError) {
            W.Utils.errorPopup(
                W.Resources.get('EDITOR_LANGUAGE', 'ERROR_PROVISION_SM_TITLE'),
                W.Resources.get('EDITOR_LANGUAGE', 'ERROR_PROVISION_SM'),
                W.Resources.get('EDITOR_LANGUAGE', 'ERROR_CODE_IS') + ' ' + errorCode
            );

            if (onError) {
                onError(errorCode);
            }
        },

        completeProvisionAfterMetasiteSave: function (onComplete) {
            if (!this._preSaveProvisionSuccess) { // if provision was called and succeeded
                onComplete();
                return;
            }

            W.ServerFacade.smCompleteProvisionAfterMetasiteSave(this._getCollectionId(), function () {
                onComplete();
            }, function (errorDescription, errorCode) {
                LOG.reportError("Unable to complete provision for the site members service", this.$className, "completeProvisionAfterMetasiteSave", errorCode + " " + errorDescription);
                onComplete();
            }.bind(this));
        },

        _validateResponse: function (smData) {
            if (!smData) {
                LOG.reportError("site members provisioning response is blank [" + smData + "]", this.$className, "_validateResponse");
            } else if (!smData['smcollectionId']) {
                LOG.reportError("Site members - collection Id is undefined? [" + smData['smcollectionId'] + "]", this.$className, "_validateResponse");
            } else {
                return true;
            }
        },

        isServiceProvisioned: function () {
            return this._getSiteMembersViewManager().isServiceProvisioned();
        },

        _getCollectionId: function () {
            return this._getSiteMembersViewManager().getCollectionId();
        },

        createSiteMembersOnMyAccountLink: function (labelLogic) {
            var anchor = labelLogic._skinParts.label.getElement("a");
            if (W.Config.siteNeverSavedBefore()) {
                anchor.addEvent("click", function () {
                    W.EditorDialogs.openPromptDialog(
                        W.Resources.get('EDITOR_LANGUAGE', 'SITE_MEMBERS_ALERT_TITLE'),
                        W.Resources.get('EDITOR_LANGUAGE', 'SITE_MEMBERS_ALERT_DESCRIPTION'),
                        "Details?",
                        W.EditorDialogs.DialogButtonSet.OK, null, false);
                });
            }
            else {
                anchor.setAttribute("href", this.SM_MY_ACCOUNT_LINK);
                anchor.setAttribute("target", "_blank");
            }
        }
    });
});
