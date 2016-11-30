W.AngularManager.executeExperiment('ngpromotedialog', function () {
    'use strict';

    /**
     * @ngdoc service
     *
     * @description
     * Provides an API for Save and publish related dialogs in the editor.
     */
    angular.module('newSavePublish')
        .factory('savePublishDialogs', function ($rootScope, dialogService, dialogConsts) {
            function promoteDialogClosed(closeParams) {
                var eventName, params = {};
                switch (closeParams.closeReason) {
                    case dialogConsts.CLOSING_REASON.ESC_PRESSED:
                        eventName = 'PROMOTE_DIALOG_CLOSED';
                        params = {c1: 'esc-button'};
                        break;
                    case 'MAYBE_LATER':
                        eventName = 'PROMOTE_DIALOG_CLOSED_MAYBE_LATER';
                        break;
                    case 'DISMISS':
                        eventName = 'PROMOTE_DIALOG_CLOSED';
                        params = {c1: 'x-button'};
                }

                LOG.reportEvent(wixEvents[eventName], params);

            }

            function openSaveDialog() {

            }

            function openPromoteDialog() {
                var options = {
                    width: 704,
                    dialogTemplateUrl: 'dialogs/savepublish/PromoteSiteDialogTemplate.html',
                    modalType: dialogService.CONSTS.TYPES.MODAL,
                    position: dialogService.CONSTS.POSITION.CENTER,
                    onCloseCallback: promoteDialogClosed
                };
                dialogService.open('PromoteSite', options);
            }

            return {
                openSaveDialog: openSaveDialog,
                openPromoteDialog: openPromoteDialog
            };
        });
});