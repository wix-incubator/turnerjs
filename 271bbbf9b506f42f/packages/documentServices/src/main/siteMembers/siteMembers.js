define(['lodash', 'utils', 'documentServices/siteMetadata/siteMetadata', 'documentServices/siteMetadata/clientSpecMap'], function(_, utils, siteMetadata, clientSpecMap) {
    'use strict';

    var VENDOR_ID_TO_MODEL_KEY = {
        google: 'socialLoginGoogleEnabled',
        facebook: 'socialLoginFacebookEnabled'
    };

    function getContactSettingsEndpoint(ps) {
        var metaSiteId = siteMetadata.generalInfo.getMetaSiteId(ps);
        return '/_api/wix-contacts-webapp/dashboard/metasites/' + metaSiteId + '/settings';
    }

    function getSiteMembersApp(ps) {
        return _.first(clientSpecMap.filterAppsDataByType(ps, 'sitemembers'));
    }

    function getSiteMembersSettingsPointer(ps) {
        var siteStructureDataPointer = ps.pointers.data.getDataItemFromMaster(utils.siteConstants.MASTER_PAGE_ID);
        return ps.pointers.getInnerPointer(siteStructureDataPointer, 'smSettings');
    }

    function setAutoApproval(ps, autoApproval, onSuccess, onError) {
        var onAjaxSuccess = function() {
            var siteMembersApp = getSiteMembersApp(ps);
            siteMembersApp.collectionType = autoApproval ? 'Open' : 'ApplyForMembership';
            clientSpecMap.registerAppData(ps, siteMembersApp);
            if (_.isFunction(onSuccess)) {
                onSuccess();
            }
        };

        utils.ajaxLibrary.ajax({
            type: 'POST',
            url: getContactSettingsEndpoint(ps),
            dataType: 'json',
            data: {autoApprove: autoApproval},
            success: onAjaxSuccess,
            error: onError || _.noop
        });
    }

    function isAutoApproval(ps) {
        var siteMembersApp = getSiteMembersApp(ps);
        return siteMembersApp.collectionType === 'Open';
    }

    function setSmSettingsData(ps, data) {
        var smSettingsPointer = getSiteMembersSettingsPointer(ps);
        var currentSMSettings = ps.dal.get(smSettingsPointer);
        var updatedSMSettings = _.merge({}, currentSMSettings, data);
        ps.dal.set(smSettingsPointer, updatedSMSettings);
    }

    function setLoginDialogFirst(ps, loginDialogFirst) {
        setSmSettingsData(ps, {smFirstDialogLogin: !!loginDialogFirst});
    }

    function isLoginDialogFirst(ps) {
        var smSettings = ps.dal.get(getSiteMembersSettingsPointer(ps));
        return !!(smSettings && smSettings.smFirstDialogLogin);
    }

    function setSocialLoginVendorStatus(ps, vendor, isEnabled) {
        var key = VENDOR_ID_TO_MODEL_KEY[vendor];
        if (key) {
            setSmSettingsData(ps, _.set({}, key, !!isEnabled));
        }
    }

    function isSocialLoginEnabled(ps, vendor) {
        var key = VENDOR_ID_TO_MODEL_KEY[vendor];
        var smSettings = ps.dal.get(getSiteMembersSettingsPointer(ps));
        return !!_.get(smSettings, key);
    }

    return {
        setAutoApproval: setAutoApproval,
        isAutoApproval: isAutoApproval,
        setLoginDialogFirst: setLoginDialogFirst,
        isLoginDialogFirst: isLoginDialogFirst,
        setSocialLoginVendorStatus: setSocialLoginVendorStatus,
        isSocialLoginEnabled: isSocialLoginEnabled
    };

});
