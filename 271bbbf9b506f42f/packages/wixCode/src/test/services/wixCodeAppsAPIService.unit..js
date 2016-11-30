define(['wixCode/services/wixCodeAppsAPIService'], function (service) {
    'use strict';

    describe('apps api service', function () {
        it('should invoke the given function w/ the given arguments for a valid already set API', function() {
            var callback = jasmine.createSpy('callback');
            var api = {
                foo: jasmine.createSpy().and.callFake(function () {
                        return new Promise(function () {
                    });
                })
            };

            service.setAppAPI('compId', api);
            service.invokeAppFunctionFor('compId', 'foo', ['1', 2], callback);
            expect(api.foo).toHaveBeenCalledWith('1', 2);
        });

        it('should call the given callback once the api promise gets resolved', function() {
            var callback = jasmine.createSpy('callback');
            var api = {
                foo: jasmine.createSpy().and.callFake(function () {
                    return new Promise(function (resolve) {
                        resolve(function () {
                            expect(callback).toHaveBeenCalled();
                        });
                    });
                })
            };

            service.setAppAPI('compId', api);
            service.invokeAppFunctionFor('compId', 'foo', ['1', 2], callback);
        });
    });
});
