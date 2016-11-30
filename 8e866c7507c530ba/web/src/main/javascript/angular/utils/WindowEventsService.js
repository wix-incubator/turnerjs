W.AngularManager.executeExperiment('NGCore', function () {
    'use strict';

    angular.module('utils')
        .factory('windowEvents', function ($window, $rootScope) {

            function broadcastWindowResize(e) {
                $rootScope.$broadcast('windowResize', {
                    height: $window.getHeight(),
                    width: $window.getWidth()
                });
            }

            return {
                init: function () {
                    $window.addEvent('resize', _.throttle(broadcastWindowResize, 50));
                }
            };
        })
        .run(function (windowEvents) {
            windowEvents.init();
        });
});