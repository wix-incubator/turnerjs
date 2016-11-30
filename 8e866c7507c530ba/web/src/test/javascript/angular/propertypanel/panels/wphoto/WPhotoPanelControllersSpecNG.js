describe('Unit: WPhotoPanelController', function () {
    'use strict';
    var ctrl, scope, rootScope;

    beforeEach(module('propertyPanel'));

    beforeEach(inject(function ($controller, $rootScope) {
        scope = $rootScope.$new();
        rootScope = $rootScope;

        ctrl = $controller('WPhotoPanelController', {
            $scope: scope
        });
    }));

    describe('Data on the scope -', function () {
        it('should contain the imageScalingOptions array', function() {
            expect(ctrl.imageScalingOptions).toBeDefined();
            expect(ctrl.imageScalingOptions instanceof Array).toBeTruthy();
        });

        it('should contain the onClickBehaviorOptions array', function() {
            expect(ctrl.onClickBehaviorOptions).toBeDefined();
            expect(ctrl.onClickBehaviorOptions instanceof Array).toBeTruthy();
        });
    });
});