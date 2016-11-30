define(['documentServices/siteMembers/siteMembers'], function (siteMembers) {
    'use strict';

    return {
        methods: {
            siteMembers: {
                setAutoApproval: siteMembers.setAutoApproval,
                isAutoApproval: siteMembers.isAutoApproval,
                setLoginDialogFirst: siteMembers.setLoginDialogFirst,
                isLoginDialogFirst: siteMembers.isLoginDialogFirst,
                setSocialLoginVendorStatus: siteMembers.setSocialLoginVendorStatus,
                isSocialLoginEnabled: siteMembers.isSocialLoginEnabled
            }
        }
    };

});
