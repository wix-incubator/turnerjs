W.AngularManager.executeExperiment('NGPanels', function () {
    'use strict';

    angular.module('propertyPanel')
        .config(function (propertyPanelNavigationProvider) {
            propertyPanelNavigationProvider.registerPropertyPanel('wysiwyg.viewer.components.BgImageStrip', '/propertyPanel/panels/testpanel/TestPanelView.html');
        })
        .controller('TestPanelController', function ($scope, dialogService, editorResources, /** dialogs.legacyDialogs */ legacyDialogs) {
            this.btnLabel = "'Show Flying Mussa!'";
            this.selectOptions = [
                { value: 'fill', label: 'Types.WPhotoProperties.displayMode.fill'},
                { value: 'full', label: 'Types.WPhotoProperties.displayMode.full'},
                { value: 'stretch', label: 'Types.WPhotoProperties.displayMode.stretch'},
                { value: 'fitWidth', label: 'Types.WPhotoProperties.displayMode.fitWidth'}
            ];

            this.switchState = true;

            var level = 0;

            var self = this;

            /*function openLegacyDialog () {
                W.EditorDialogs.openNGTestDialog();
            }

            this.openTestDialog = function () {
                var dialogInstance = dialogService.open('TestDialog', {
                    title: 'Some title',
                    helpId: '/node/21351',
                    descriptionText: 'Some Description',
                    helplet: 'LINK_DIALOG',
                    singleInstance: false,
                    buttonsSet: dialogService.CONSTS.BUTTONS_SET.DELETE_CANCEL,
                    position: dialogService.CONSTS.POSITION.SIDE,
                    positionLeft: 200,
                    level: (level++),
                    contentUrl: editorResources.getAngularPartialPath('dialogs/TestDialogTemplate.html'),
                    modalType: dialogService.CONSTS.TYPES.SEMI_MODAL,
                    width: 600,
                    //height: 600,
                    draggable: true,
                    context: {
                        key: 'val',
                        openDialog: self.openTestDialog,
                        openLegacyDialog: openLegacyDialog
                    }
                });

                dialogInstance.closePromise.then(function(res) {
                    console.log('Dialog closed:', res);
                });
            };*/
            this.openTestDialog = function () {
                legacyDialogs.openTestDialog();
            };

            this.firstSlider = 6;
            this.secondSlider = -3;
        });
});