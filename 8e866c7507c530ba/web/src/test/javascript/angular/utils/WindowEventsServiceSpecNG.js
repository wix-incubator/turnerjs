describe('Unit: WindowEvents service', function () {
    'use strict';

    var windowEvents;
    var rootScope;
    var _$window;

    beforeEach(module('utils'));

    beforeEach(inject(function ($rootScope, $window, _windowEvents_) {
        rootScope = $rootScope;
        _$window = $window;
        windowEvents = _windowEvents_;
    }));

    describe('On window resize', function() {
        it('should broadcast an event with the new height and width of the window', function() {
            var actualEvent, actualParams;
            rootScope.$on('windowResize', function(ev, params) {
                actualEvent = ev;
                actualParams = params;
            });
            spyOn(_$window, 'getHeight').and.returnValue(100);
            spyOn(_$window, 'getWidth').and.returnValue(200);

            _$window.fireEvent('resize');

            expect(actualParams).toEqual({
                height: 100,
                width: 200
            });
        });
    });

});