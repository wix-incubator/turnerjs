W.AngularManager.executeExperiment('ngpromotedialog', function () {
    'use strict';

    angular.module('newSavePublish')
        .controller('PromoteDialogController', PromoteDialogController);
    /**
     * @ngdoc controller
     * @name PromoteDialog.controller:PromoteDialogController
     * @description
     * Promote dialog logic.
     */
        //@ngInject
    function PromoteDialogController($scope, $element, editorResources, configManager) {
        var self = this;
        self.webThemeDir = configManager.webThemeDir;
        self.dontShowAgain = false;
        var websiteUrl = W.Config.getUserPublicUrl();
        var editorStatusAPI = W.Editor.getEditorStatusAPI();
        var firstTimePublish = !editorStatusAPI.isPreviouslyPublished();
        var isPremiumUser = W.Config.isPremiumUser();
        var shoutOutId = '135c3d92-0fea-1f9d-2ba5-2a1dfb04297e';
        self.shoutOutUrl = W.Config.getAppInMyAccountUrl(shoutOutId, true);
        if (W.Experiments.isExperimentOpen('shoutoutAppstate')) {
            self.shoutOutUrl += '&appState=%3Fdl%3Dmessage%26messageId%3Dfeedb3b8-0b1a-413f-bcab-73e805d0f554';
        }

        $scope.$watch('promoteDialogCtrl.dontShowAgain', function (value) {
            $scope.dialog.dontShowAgain(value);
            LOG.reportEvent(wixEvents.DONT_SHOW_THIS_AGAIN_PROMOTE_DIALOG);
        });

        self.onPostInFacebookClick = function () {
            var params = {
                'url': websiteUrl,
                'text': firstTimePublish ? editorResources.translate('PUBLISH_WEB_SHARE_FB_MSG_FIRSTTIME')
                    : editorResources.translate('PUBLISH_WEB_SHARE_FB_MSG_NOT_FIRSTTIME')
            };

            W.Commands.executeCommand('WEditorCommands.PostInFacebook', params);

            //report BI event
            LOG.reportEvent(wixEvents.POST_IN_FB_CLICKED_IN_PUBLISH_SHARE_DIALOG);
        };

        self.onTweetInTwitterClick = function () {
            var params = {
                siteUrl: websiteUrl,
                isPremium: isPremiumUser
            };

            W.Commands.executeCommand('WEditorCommands.ShareInTwitter', params);

            //report BI event
            LOG.reportEvent(wixEvents.POST_IN_TWITTER_CLICKED_IN_PUBLISH_SHARE_DIALOG);
        };

        self.onShoutoutClick = function () {
            LOG.reportEvent(wixEvents.SHOUTOUT_CLICKED_PROMOTE_DIALOG);
        };
    }
});