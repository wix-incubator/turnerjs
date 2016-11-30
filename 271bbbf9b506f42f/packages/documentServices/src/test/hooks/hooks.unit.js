define(['documentServices/mockPrivateServices/privateServicesHelper', 'documentServices/hooks/hooks'], function (privateServicesHelper, hooks) {
    'use strict';

    describe('Component Hooks', function () {
        beforeEach(function () {
            hooks.unregisterAllHooks();
        });

        it('should register hooks with no component type', function () {
            var callback = jasmine.createSpy();
            hooks.registerHook(hooks.HOOKS.ADD.BEFORE, callback);

            // Should call the callback with no compType
            hooks.executeHook(hooks.HOOKS.ADD.BEFORE);
            expect(callback.calls.count()).toEqual(1);

            // Should call the callback with compType
            hooks.executeHook(hooks.HOOKS.ADD.BEFORE, 'dummyCompType');
            expect(callback.calls.count()).toEqual(2);

            // Should NOT call the callback when executing a different hook type.
            hooks.executeHook(hooks.HOOKS.ADD.AFTER, 'dummyCompType');
            hooks.executeHook(hooks.HOOKS.ADD.AFTER);
            hooks.executeHook(hooks.HOOKS.REMOVE.BEFORE, 'dummyCompType');
            hooks.executeHook(hooks.HOOKS.REMOVE.BEFORE);
            expect(callback.calls.count()).toEqual(2);
        });

        it('should register hooks with component type', function () {
            var callback = jasmine.createSpy();
            var compType = 'dummyCompType';
            hooks.registerHook(hooks.HOOKS.ADD.AFTER, callback, compType);

            // Should NOT call the callback when executing it with no compType or with different compType
            hooks.executeHook(hooks.HOOKS.ADD.AFTER);
            expect(callback.calls.count()).toEqual(0);

            hooks.executeHook(hooks.HOOKS.ADD.AFTER, 'otherCompType');
            expect(callback.calls.count()).toEqual(0);

            // Should call the callback when executing it with the same compType
            hooks.executeHook(hooks.HOOKS.ADD.AFTER, compType);
            expect(callback.calls.count()).toEqual(1);
        });

        it('should stop executing callbacks after the first callback that return false', function () {
            var falseCallback = jasmine.createSpy().and.returnValue(false);
            var callback = jasmine.createSpy();
            hooks.registerHook(hooks.HOOKS.ADD.IS_OPERATION_ALLOWED, callback);
            hooks.registerHook(hooks.HOOKS.ADD.IS_OPERATION_ALLOWED, falseCallback);
            hooks.registerHook(hooks.HOOKS.ADD.IS_OPERATION_ALLOWED, callback);

            var runAllCallbacks = hooks.executeHook(hooks.HOOKS.ADD.IS_OPERATION_ALLOWED, 'dummyCompType', null, function(obj) { return obj === false; });
            expect(runAllCallbacks).toBe(false);
            expect(callback.calls.count()).toEqual(1);
            expect(falseCallback.calls.count()).toEqual(1);
        });

        it('should execute all registered callbacks', function () {
            var callback = jasmine.createSpy();
            var callback1 = jasmine.createSpy();
            hooks.registerHook(hooks.HOOKS.ADD.IS_OPERATION_ALLOWED, callback);
            hooks.registerHook(hooks.HOOKS.ADD.IS_OPERATION_ALLOWED, callback1);

            var runAllCallbacks = hooks.executeHook(hooks.HOOKS.ADD.IS_OPERATION_ALLOWED, 'dummyCompType', null, function (obj) { return obj === false; });
            expect(runAllCallbacks).toBe(true);
            expect(callback).toHaveBeenCalled();
            expect(callback1).toHaveBeenCalled();
        });

        it('should pass the same args from the executeHook to the callback that was registered', function () {
            var callback = jasmine.createSpy('before add hook');
            hooks.registerHook(hooks.HOOKS.ADD.BEFORE, callback);

            var args = ['test', 2];
            hooks.executeHook(hooks.HOOKS.ADD.BEFORE, 'dummyCompType', args);
            expect(callback).toHaveBeenCalledWith('test', 2);
        });
    });
});