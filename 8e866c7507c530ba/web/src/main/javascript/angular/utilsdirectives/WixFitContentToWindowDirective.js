W.AngularManager.executeExperiment('NGDialogManagement', function () {
    'use strict';

    angular.module('utilsDirectives')
        .directive('wixFitContentToWindow', function ($document, $window, $timeout, /** @type ngIncludeUtils */ ngIncludeUtils) {
            return {
                restrict: 'A',
                scope: {
                    contentElmClass: '@wixFitContentToWindow',
                    enforceMaxContentHeight: '@',
                    waitForNgIncludes: '@'
                },
                link: function (scope, element, attr) {
                    var contentElmClass = scope.contentElmClass || 'wix-content-wrapper';

                    var topMargin = attr.topMargin || 0,
                        bottomMargin = attr.bottomMargin || 0,
                        contentElement,
                        contentHeight,
                        windowHeight;

                    if (scope.waitForNgIncludes === 'true') {
                        // listening on the outer (dialog) scope, instead of the directive's isolate scope
                        ngIncludeUtils.listenForAllIncludeLoaded(element, scope.$parent, init);
                    } else {
                        $timeout(init, 0);
                    }

                    function init() {

                        contentElement = element[0].getElementsByClassName(contentElmClass);

                        if (contentElement.length) {
                            contentElement = contentElement[0];

                            scope.$parent.$on('updateContentSizeIfNeeded', fitContentHeightToWindow);
                            scope.$on('windowResize', fitContentHeightToWindow);

                            fitContentHeightToWindow();
                        }
                    }

                    function fitContentHeightToWindow() {
                        contentHeight = getContentHeight();
                        var parentHeightWithoutContent = calcHeightWithoutContent();
                        windowHeight = $document[0].documentElement.clientHeight;

                        var requiredContentHeight = contentElement.scrollHeight;
                        var possibleHeight = windowHeight - bottomMargin - topMargin - parentHeightWithoutContent;

                        if (scope.enforceMaxContentHeight || (requiredContentHeight > possibleHeight)) {
//                            max-height from content style will limit the actual display height
                            contentElement.setStyle('height', possibleHeight);
                        } else {
                            contentElement.setStyle('height', 'auto');
                        }

                        scope.$parent.$emit('fitContentToWindowDone');
                    }

                    /**
                     * subtracts content height from the total element height
                     */
                    function calcHeightWithoutContent() {
                        var totalHeight = element[0].getSize().y;
                        return totalHeight - contentHeight;
                    }

                    function getContentHeight() {
                        // need the real
                        return parseInt($window.getComputedStyle(contentElement).getPropertyValue('height'), 10);
                    }
                }
            };
        });
});
