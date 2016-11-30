W.AngularManager.executeExperiment("NGCore", function() {
    'use strict' ;

    var app = angular.module('wixElements') ;
    app.directive('wixRadioImageButton', function(editorResources) {
        var templateUrl     = editorResources.getAngularPartialPath('/wixelements/wixradioimagebutton/WixRadioImageTemplate.html') ;
        return {
            restrict: 'E',
            scope: {
                model: "=",
                value: "@",
                imgCssData: "="
            },
            templateUrl: templateUrl,
            link: function(scope, element, attributes) {
                var imageDiv = element.find("div");

                if(attributes.width) {
                    imageDiv.css("width", attributes.width);
                }

                if(attributes.height) {
                    imageDiv.css("height", attributes.height);
                }

                scope.$watch('model', function() {
                    scope.isChecked = (scope.model === scope.value) ;
                });

                scope.updateState = function(state) {
                    var bgValue = "" ;
                    if(scope.isChecked) {
                        bgValue = scope.imgCssData.checked ;
                    } else if(state === "hover" && scope.imgCssData.onHover) {
                            bgValue = scope.imgCssData.onHover ;
                        } else {
                            bgValue = scope.imgCssData.unchecked ;
                        }
                    scope.background =  bgValue ;
                };

                scope.updateState("normal");
            }
        } ;
    }) ;
}) ;