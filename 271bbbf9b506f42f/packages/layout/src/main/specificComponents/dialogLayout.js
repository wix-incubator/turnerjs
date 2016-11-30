define(['lodash', 'layout/util/layout', 'layout/util/spaceCalculationsRegardingWixAds'], function (_, layout, spaceCalculationsRegardingWixAds) {
    'use strict';

    function patchDialog(id, patchers, measureMap) {
        var dialogSkinPartId = id + 'dialog';
        var dialogHeight = measureMap.height[dialogSkinPartId];
        var screenHeight = measureMap.height.screen;
        var firstUnoccupiedTopCoordinate = spaceCalculationsRegardingWixAds.getFirstUnoccupiedTopCoordinate(measureMap);
        var screenHeightWithoutWixAds = spaceCalculationsRegardingWixAds.getScreenHeightExcludingAds(measureMap);
        var dialogTopMargin = 20;

        patchers.css(id, {'height': screenHeight + 'px'});

        var halfOfRemainingHeight = (screenHeightWithoutWixAds - dialogHeight) / 2;

        patchers.css(dialogSkinPartId, {
            'top': Math.max(halfOfRemainingHeight, dialogTopMargin) + firstUnoccupiedTopCoordinate + "px"
        });
    }

    layout.registerRequestToMeasureChildren("wysiwyg.viewer.components.dialogs.EnterPasswordDialog", [
        ["dialog"]
    ]);
    layout.registerSAFEPatcher("wysiwyg.viewer.components.dialogs.EnterPasswordDialog", patchDialog);

    layout.registerRequestToMeasureChildren("wysiwyg.viewer.components.dialogs.siteMemberDialogs.MemberLoginDialog", [
        ["dialog"]
    ]);
    layout.registerSAFEPatcher("wysiwyg.viewer.components.dialogs.siteMemberDialogs.MemberLoginDialog", patchDialog);

    layout.registerRequestToMeasureChildren("wysiwyg.viewer.components.dialogs.siteMemberDialogs.SignUpDialog", [
        ["dialog"]
    ]);
    layout.registerSAFEPatcher("wysiwyg.viewer.components.dialogs.siteMemberDialogs.SignUpDialog", patchDialog);

    layout.registerRequestToMeasureChildren("wysiwyg.viewer.components.dialogs.siteMemberDialogs.RequestPasswordResetDialog", [
        ["dialog"]
    ]);
    layout.registerSAFEPatcher("wysiwyg.viewer.components.dialogs.siteMemberDialogs.RequestPasswordResetDialog", patchDialog);

    layout.registerRequestToMeasureChildren("wysiwyg.viewer.components.dialogs.siteMemberDialogs.ResetPasswordDialog", [
        ["dialog"]
    ]);
    layout.registerSAFEPatcher("wysiwyg.viewer.components.dialogs.siteMemberDialogs.ResetPasswordDialog", patchDialog);

    layout.registerRequestToMeasureChildren("wysiwyg.viewer.components.dialogs.NotificationDialog", [
        ["dialog"]
    ]);
    layout.registerSAFEPatcher("wysiwyg.viewer.components.dialogs.NotificationDialog", patchDialog);

    layout.registerRequestToMeasureChildren("wysiwyg.viewer.components.dialogs.CreditsDialog", [
        ["dialog"]
    ]);
    layout.registerSAFEPatcher("wysiwyg.viewer.components.dialogs.CreditsDialog", patchDialog);

});
