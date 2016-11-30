W.AngularManager.executeExperiment('NGCore', function () {
    'use strict';

    /**
     * @ngdoc directive
     * @name wixElements.directive:wixImage
     * @restrict E
     * @element wix-image
     * @param {number=} img-height - The height of the image to be displayed
     * @param {number=} img-width - The width of the image to be displayed
     * @param {string} wix-data - The id of the image to retrieve.
     * @description
     * draws an image at the specified location
     * @example
     <example>
     <file name="script.js">
     function startExample () {
        var exampleScripts = ['wixelements/wiximage/WixImageDirective.js'] ;
        loadModuleScripts(exampleScripts, start) ;
    }

     function start() {
            var app = angular.module('wixElements');
            app.controller("Controller", function ($scope, $http) {
                this.url = 'http://wpshoppingcartreviews.com/wp-content/uploads/2011/12/wix.jpg';
            });
     }
     </file>
     <file name="index.html">
     <div style="position: absolute; height: 300px; width: 100%;">
     <div ng-controller="Controller as controller">
     <wix-image wix-data="controller.url" img-height="100px" img-width="105px"
     ng-style="{'border':'4px dashed #004e8b', 'position': 'absolute', 'padding': '15px'}"></wix-image>
     </div>
     </div>
     </file>
     </example>
     */
    angular.module('wixElements').directive('wixImage', function (editorResources, imageUtils) {
        var templateUrl = editorResources.getAngularPartialPath('/wixelements/wiximage/WixImageTemplate.html');

        return {
            restrict: 'E',
            templateUrl: templateUrl,
            scope: {
                imgHeight: '@',
                imgWidth: '@',
                imgStyle: '@',
                wixData: '='
            },
            link: function (scope, element, attrs) {
                var evaluatedImgStyle = scope.imgStyle && JSON.parse(scope.imgStyle);
                scope.imageExtendedStyle = evaluatedImgStyle || {};
                createImageStyle(scope.wixData);
                scope.$watch('wixData', createImageStyle);

                function createImageStyle(background) {
                    var backgroundUrl;
                    var imageRequestedSize = {x: parseInt(scope.imgWidth), y: parseInt(scope.imgHeight)};
                    var backgroundPyramid = imageUtils.getUrlForPyramid(imageRequestedSize, background);
                    backgroundUrl = backgroundPyramid.url;

                    scope.imageExtendedStyle["background-image"] = 'url(' + backgroundUrl + ')';
                    scope.imageExtendedStyle.height = scope.imgHeight;
                    scope.imageExtendedStyle.width = scope.imgWidth;
                }
            }
        };
    });
});