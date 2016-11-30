W.AngularManager.executeExperiment('NGCore', function () {
    'use strict';

    angular.module('wixElements')
        .directive('wixLink', function (editorResources, linkRenderer, editorCommands, editorComponent, editorUtils, dialogService, EXP_ngpanels) {
            //var _linkRenderer = wixImports.importClass('wysiwyg.common.utils.LinkRenderer');
            return {
                restrict: 'E',
                // Using wixInput template
                templateUrl: editorResources.getAngularPartialPath('/wixelements/wixlink/WixLinkTemplate.html'),
                scope: {
                    placeholder: '@',
                    label: '@',
                    tooltip: '@',
                    wixData: '='
                },
                link: function (scope, element, attrs) {
                    //todo IdanB Create a dedicated input type=link directive.
                    scope.$watch('wixData', function (value) {
                        renderLinkFromData(value);
                    });

                    scope.openLinkDialog = function openLinkDialog(e) {
                        var pos = editorUtils.getPositionRelativeToWindow(e.target);
                        var params = {
                            data: editorComponent.getComponentData().data.getLegacyDataItem(),
                            top: pos.y,
                            left: pos.x
                        };
//                            openAngularLinkDialog();
                        editorCommands.executeCommand('WEditorCommands.OpenLinkDialogCommand', params);


                        return false;
                    };

                    function renderLinkFromData(dataQuery) {
                        if (!dataQuery) {
                            scope.linkLabel = '';
                        } else {
                            scope.linkLabel = linkRenderer.renderLinkForPropertyPanel(dataQuery);
                        }
                    }

//                    function openAngularLinkDialog() {
//                        var options = {
//                            title: 'LINK_DIALOG_DEFAULT_TITLE',
//                            descriptionText: 'LINK_DIALOG_DESCRIPTION',
//                            helplet: 'LINK_DIALOG',
//                            descriptionTemplateUrl: editorResources.getAngularPartialPath('dialogs/linkdialog/LinkDialogDescriptionTemplate.html'),
//                            buttonsSet: dialogService.CONSTS.BUTTONS_SET.OK,
//                            width: 320,
//                            contentUrl: editorResources.getAngularPartialPath('dialogs/linkdialog/LinkDialogTemplate.html'),
//                            modalType: dialogService.CONSTS.TYPES.SEMI_MODAL,
//                            context: {
//                                showDescription: true,
//                                wixData: scope.wixData
//                            }
//                        };
//                        dialogService.open('link', options);
//                    }
                }
            };
        }
    );
});