W.AngularManager.executeExperiment('NGCore', function () {
    'use strict';

    angular.module('utils')
        .factory('ngIncludeUtils', function ($timeout) {

            /** @class ngIncludeUtils */
            return {
                listenForAllIncludeLoaded: function(element, scope, callback) {
                    var stopListening, contentLoadedCounter = 0;

                    function waitForContent() {
                        var contentToLoadCounter = element.html().match(/ngInclude/g).length;
                        contentLoadedCounter++;
                        if (contentToLoadCounter === contentLoadedCounter) {
                            stopListening();
                            $timeout(callback, 0);
                        }
                    }

                    stopListening = scope.$on('$includeContentLoaded', waitForContent);
                }
            };
        });
});