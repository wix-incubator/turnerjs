define(['documentServices/theme/theme', 'documentServices/tpa/services/tpaEventHandlersService'], function(theme, tpaEventHandlersService) {
    'use strict';

    describe("Document Services - tpa - delete handler Service", function() {
        it("should register callback", function() {
            var deleteCallback = jasmine.createSpy("delete callback");
            tpaEventHandlersService.registerDeleteCompHandler("123", deleteCallback);

            expect(tpaEventHandlersService.isDeleteHandlerExists("123")).toBeTruthy();
        });

        it("should execute registered callback", function() {
            var deleteCallback = jasmine.createSpy("delete callback");
            tpaEventHandlersService.registerDeleteCompHandler("123", deleteCallback);
            tpaEventHandlersService.executeDeleteHandler("123");

            expect(deleteCallback).toHaveBeenCalled();
        });

        it("should not execute un registered callback", function() {
            var deleteCallback = jasmine.createSpy("delete callback");
            tpaEventHandlersService.registerDeleteCompHandler("123", deleteCallback);
            tpaEventHandlersService.executeDeleteHandler("1234");

            expect(tpaEventHandlersService.isDeleteHandlerExists("1234")).toBeFalsy();
            expect(deleteCallback).not.toHaveBeenCalled();
        });
    });

    describe('deviceTypeChangeCallbacks - registration and invokation', function() {
        it('should register device type change callback and invoke it', function() {
            var callback = jasmine.createSpy('callback');
            var compId = 'compId';
            tpaEventHandlersService.registerDeviceTypeChangeHandler(compId, callback);
            tpaEventHandlersService.deviceTypeChange();
            expect(callback).toHaveBeenCalled();
        });
    });

    describe('unRegisterHandlers', function() {
        var unRegisterCompId = 'comp1';
        var compId = 'comp2';
        var mockPs = {};

        beforeEach(function(){
            tpaEventHandlersService.unRegisterHandlers(mockPs, unRegisterCompId);
            tpaEventHandlersService.unRegisterHandlers(mockPs, compId);
            spyOn(theme.events.onChange, 'removeListener');
            spyOn(theme.events.onChange, 'addListener').and.callThrough();
        });


       it('should do nothing if the comp was not register to any event', function() {

           var unRegisterCallback = jasmine.createSpy('callback');
           var callback = jasmine.createSpy('callback');

           tpaEventHandlersService.registerDeviceTypeChangeHandler(compId, callback);
           tpaEventHandlersService.registerSiteSavedHandler(compId, callback);

           tpaEventHandlersService.deviceTypeChange('desktop');
           tpaEventHandlersService.siteSaved();
           expect(unRegisterCallback).not.toHaveBeenCalled();
           expect(callback).toHaveBeenCalled();
           expect(callback.calls.count()).toEqual(2);

           tpaEventHandlersService.unRegisterHandlers(mockPs, unRegisterCompId);

           tpaEventHandlersService.deviceTypeChange('desktop');
           tpaEventHandlersService.siteSaved();

           expect(unRegisterCallback).not.toHaveBeenCalled();
           expect(callback).toHaveBeenCalled();
           expect(callback.calls.count()).toEqual(4);
       });

        it('should un register comp from events that it was registered to', function() {
            var unRegisterCallback = jasmine.createSpy('unRegisterCallback');
            var callback = jasmine.createSpy('callback');

            tpaEventHandlersService.registerDeviceTypeChangeHandler(compId, callback);
            tpaEventHandlersService.registerSiteSavedHandler(compId, callback);

            tpaEventHandlersService.registerDeviceTypeChangeHandler(unRegisterCompId, unRegisterCallback);
            tpaEventHandlersService.registerSiteSavedHandler(unRegisterCompId, unRegisterCallback);

            tpaEventHandlersService.unRegisterHandlers(mockPs, unRegisterCompId);

            tpaEventHandlersService.deviceTypeChange('desktop');
            tpaEventHandlersService.siteSaved();

            expect(unRegisterCallback).not.toHaveBeenCalled();
            expect(callback).toHaveBeenCalled();
            expect(callback.calls.count()).toEqual(2);
            expect(theme.events.onChange.removeListener).not.toHaveBeenCalled();
        });

        it('should register and unregister theme change event', function() {
            var callback = jasmine.createSpy('callback');

            tpaEventHandlersService.registerThemeChangeHandler(mockPs, compId, callback);
            expect(theme.events.onChange.addListener).toHaveBeenCalledWith(mockPs, callback);

            tpaEventHandlersService.unRegisterHandlers(mockPs, compId);
            expect(theme.events.onChange.removeListener).toHaveBeenCalled();
        });

    });

});
