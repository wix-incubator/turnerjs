W.AngularManager.executeExperiment("NGCore", function () {
    'use strict';

    angular.module("wixElements").directive("wixColorSelector", function wixColorSelector(editorResources, editorTheme, editorCommands, editorUtils, colorDialog, EXP_ngpanels) {
        var templatePath = '/wixelements/wixcolorselector/WixColorSelectorTemplate.html';
        return {
            restrict: 'E',
            scope: {
                wixData: '='
            },
            templateUrl: editorResources.getAngularPartialPath(templatePath),
            link: function (scope, element) {
                scope.styleData = scope.wixData.styleData;
                scope.propertyName = scope.wixData.propertyName;

                scope.$watch('styleData._skinParser._properties', updateColorAndAlpha, true);

                _initDirectiveStyles();

                updateColorAndAlpha();

                scope.openColorPicker = function _openColorPicker() {
                    var currentColorSource = scope.styleData.getPropertySource(scope.propertyName);
                    var currentColor = scope.styleData.getProperty(scope.propertyName);
                    colorDialog.openColorSelectorDialog(element, currentColor, currentColorSource, onColorDialogClosed);
                };

                function onColorAdjust(colorValue, source) {
                    scope.styleData.changePropertySource(scope.propertyName, colorValue.toString(), source);
                    scope.$root.safeApply(updateColorAndAlpha);
                }

                function onColorDialogClosed(closeParams) {
                    if (!closeParams.result) {
                        return;
                    }

                    var color = closeParams.context.selectedColor;
                    var colorSource = closeParams.context.colorSource;

                    onColorAdjust(color, colorSource);
                }

                function _initDirectiveStyles() {
                    _createTransparencyBGStyle();
                    _createButtonImage();
                }

                function updateColorAndAlpha() {
                    var colorSource = scope.styleData.getPropertySource(scope.propertyName);
                    var colorValue = scope.styleData.getProperty(scope.propertyName);
                    var alpha = scope.styleData.getPropertyExtraParamValue(scope.propertyName, 'alpha');

                    scope.color = _resolveColorFromSource(colorValue, colorSource);
                    scope.alpha = alpha;
                }

                function _resolveColorFromSource(colorValue, colorSource) {
                    if (!colorValue) {
                        return "";
                    }
                    var color = colorValue;
                    if (colorSource === 'theme') {
                        color = editorTheme.getPreviewThemeProperty(colorValue);
                        color = color.getHex(false);
                    }
                    return color;
                }


                function _createTransparencyBGStyle() {
                    var webPath = editorResources.topology.wysiwyg || 'http://localhost/wysiwg';
                    var transparencyRelPath = "/images/web/transparency.gif";
                    var transparencyImageUrl = webPath + transparencyRelPath;

                    scope.transparentBackgroundStyle = {
                        'backgroundImage': _createBGUrl(transparencyImageUrl)
                    };
                }

                function _createButtonImage() {
                    var skinsPath = editorResources.topology.skins || 'http://localhost/skins';
                    var buttonRelPath = "/images/wysiwyg/core/themes/editor_web/button/color_picker_btn.png";
                    var buttonImageUrl = skinsPath + buttonRelPath;

                    scope.buttonURL = _createBGUrl(buttonImageUrl);
                }

                function _createBGUrl(bgImg) {
                    var urlStart = "url('";
                    var urlEnd = "')";
                    return urlStart + bgImg + urlEnd;
                }
            }
        };
    });
});