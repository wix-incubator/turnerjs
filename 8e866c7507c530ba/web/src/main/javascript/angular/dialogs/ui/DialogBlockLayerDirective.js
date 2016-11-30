W.AngularManager.executeExperiment('ngpromotedialog', function () {
    'use strict';

    angular.module('newSavePublish')
        .directive('dialogBlockLayer', function ($document, editorResources, dialogWindows) {
            return {
                restrict: 'E',
                template: '<div class="wix-dialog-block-layer" ng-click="onBlockLayerClicked($event)"></div>',
                link: function (scope, element, attrs) {
                    if (attrs.backdrop !== 'false') {
                        element.children('.wix-dialog-block-layer').addClass('wix-dialog-backdrop-dark');
                    }

                    scope.onBlockLayerClicked = function (e) {
                        if (attrs.backdrop !== 'static') {
                            dialogWindows.onBackdropClicked(e.pageX, e.pageY);
                        }
                    };
                }
            };
        });
});