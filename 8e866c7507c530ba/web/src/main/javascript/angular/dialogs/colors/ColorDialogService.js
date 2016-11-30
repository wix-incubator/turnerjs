W.AngularManager.executeExperiment('NGPanels', function () {
    'use strict';

    /**
     * @ngdoc service
     * @name dialogs.factory:colorDialog
     *
     * @description
     * Provides an API for Color related (color) dialog in the editor.
     */
    angular.module('dialogs')
        .factory('colorDialog', function (dialogService, editorResources) {
            function openOpacityDialog(color, opacityValue, callback) {
                dialogService.open('opacityDialog', {
                    title: 'ADJUST_DIALOG_TITLE',
                    singleInstance: true,
                    buttonsSet: dialogService.CONSTS.BUTTONS_SET.OK_CANCEL,
                    position: dialogService.CONSTS.POSITION.ABSOLUTE,
                    positionLeft: 200,
                    positionTop: 200,
                    contentUrl: editorResources.getAngularPartialPath('wixelements/wixopacityselector/OpacityDialogTemplate.html'),
                    modalType: dialogService.CONSTS.TYPES.SEMI_MODAL,
                    width: 400,
                    draggable: true,
                    onCloseCallback: callback,
                    context: {
                        backgroundImage: _getCheckersBackgroundImage(),
                        opacityValue: opacityValue,
                        color: color
                    }
                });
            }

            function _getCheckersBackgroundImage() {
                return "url('" + editorResources.topology.wysiwyg + "/images/web/transparency.gif" + "')";
            }

            function openColorSelectorDialog(colorElement, selectedColor, selectedColorSource, closeCallback) {
                var options = {
                    title: 'ANGULAR_COLOR_PICKER_SITE_COLORS',
                    width: 195,
                    contentUrl: editorResources.getAngularPartialPath('dialogs/colors/ColorSelectorDialogTemplate.html'),
                    modalType: dialogService.CONSTS.TYPES.SEMI_MODAL,
                    onCloseCallback: closeCallback,
                    position: dialogService.CONSTS.POSITION.ELEMENT,
                    element: colorElement,
                    context: {
                        selectedColor: selectedColor,
                        colorSource: selectedColorSource
                    }
                };
                dialogService.open('ColorSelector', options);
            }

            return {
                openOpacityDialog: openOpacityDialog,
                openColorSelectorDialog: openColorSelectorDialog
            };
        });
});