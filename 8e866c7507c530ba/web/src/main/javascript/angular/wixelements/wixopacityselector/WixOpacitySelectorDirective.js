W.AngularManager.executeExperiment("NGPanels", function() {
    'use strict';

    /**
     * @ngdoc directive
     * @name wixElements.directive:wixOpacitySelector
     * @restrict E
     * @element wix-opacity-selector
     * @param {Object} wixData is an object holding a property name (e.g. - "titleColor") and
     * the style object of a component to reference.

     * @description
     * creates a button that allows you to set the color opacity on a component style.
     *
     * @example
     <example>
     <file name="script.js">
     function startExample () {
        var exampleScripts = ['wixelements/wixopacityselector/WixOpacitySelectorDirective.js'] ;
        loadModuleScripts(exampleScripts, start) ;
    }

     function start() {
             angular.module("wixElements").controller("myController", function ($scope) {
             var styleData = null;
             $scope.wixData = {
                "propertyName":   "headerColor",
                "styleData":      styleData
            } ;;
        });
     }

     </file>
     <file name="index.html">
         <div ng-controller="myController">
             <div  style="width:200px">
                 <wix-opacity-selector wix-data="wixData"></wix-opacity-selector>
             </div>
             <span style="margin-right:10px">output:</span>
         </div>
     </file>
     </example>
     *
     */
    angular.module("wixElements").directive("wixOpacitySelector", function (editorResources, editorTheme, colorDialog, dialogConsts) {
        var templatePath = '/wixelements/wixopacityselector/WixOpacitySelectorTemplate.html';

        return {
            restrict: 'E',
            scope: {
                wixData: '='
            },
            templateUrl: editorResources.getAngularPartialPath(templatePath),
            link: function(scope) {
                scope.updateState = function updateState(state) {
                    var position = "0 ";
                    switch(state) {
                        case "hover": {position += "-25px"; break;}
                        case "pressed": {position += "-50px"; break;}
                        default: {position += "0"; break;}
                    }
                    scope.bgPosition = position;
                };

                scope._getAlphaValue = function() {
                    return 100 * scope.wixData.styleData.getPropertyExtraParamValue(scope.wixData.propertyName, 'alpha');
                };

                scope._setAlphaToStyleData = function(alphaValue) {
                    scope.wixData.styleData.setPropertyExtraParamValue(scope.wixData.propertyName, 'alpha', alphaValue, true);
                };

                scope.opacityValue = {value: scope._getAlphaValue()};

                scope.$watch('opacityValue.value',
                    function(newVal) {
                        var val = newVal / 100;
                        scope._setAlphaToStyleData(val);
                    }
                );

                scope.openDialog = function openDialog() {
                    _initializeColorAndAlphaOnScope(scope);
                    colorDialog.openOpacityDialog(scope.color, scope.opacityValue, scope.updateOnClose);
                };

                scope.updateOnClose = function updateOnClose(res) {
                    if(!res || (!res.result && res.closeReason !== dialogConsts.CLOSING_REASON.BACKDROP_CLICKED)) {
                        var alphaValue = scope.initialAlpha / 100;
                        scope._setAlphaToStyleData(alphaValue);
                    }
                };

                function _initializeColorAndAlphaOnScope(scope) {
                    _initializeColor(scope);
                    _initializeAlpha(scope);
                }

                function _initializeColor(scope) {
                    var styleData       = scope.wixData.styleData;
                    var propertyName    = scope.wixData.propertyName;
                    var source          = styleData.getPropertySource(propertyName);
                    var colorValue      = styleData.getProperty(propertyName);
                    scope.color         = _resolveColorFromSource(editorTheme, source, colorValue);
                }

                function _initializeAlpha(scope) {
                    var alpha                   = scope._getAlphaValue();
                    scope.initialAlpha          = alpha;
                    scope.opacityValue.value    = alpha;
                }

                function _resolveColorFromSource(editorTheme, source, colorValue) {
                    var color = colorValue;
                    if (source === 'theme'){
                        var themeColor = editorTheme.getPreviewThemeProperty(colorValue);
                        if(themeColor) {
                            color = themeColor.getHex(false);
                        } else {
                            color = "";
                        }
                    }
                    return color;
                }

                function _initBGImageStyle(editorResources, scope) {
                    var skinsPath = editorResources.topology.skins || 'http://localhost/skins';
                    var transparencyRelPath = "/images/wysiwyg/core/themes/editor_web/button/new-opacity.png";
                    var transparencyImageUrl = skinsPath + transparencyRelPath;
                    scope.bgImg = "url('" + transparencyImageUrl + "')";
                }

                _initBGImageStyle(editorResources, scope);
            }
        };
    });
});