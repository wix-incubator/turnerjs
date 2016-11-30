define(['coreUtils/core/functionUtils'], function (functionUtils) {
    'use strict';

    describe('functionUtils', function () {

        describe('runMultiple', function(){

            it('should execute all callbacks with same arguments', function(){
                var callback1 = jasmine.createSpy();
                var callback2 = jasmine.createSpy();
                var callback3 = jasmine.createSpy();

                var arg1 = 'something';
                var arg2 = 3.14;
                var arg3 = [];
                var arg4 = {};
                var arg5 = true;

                var runMultipleFunc = functionUtils.runMultiple([callback1, callback2, callback3]);

                runMultipleFunc(arg1, arg2, arg3, arg4, arg5);

                expect(callback1).toHaveBeenCalledWith(arg1, arg2, arg3, arg4, arg5);
                expect(callback2).toHaveBeenCalledWith(arg1, arg2, arg3, arg4, arg5);
                expect(callback3).toHaveBeenCalledWith(arg1, arg2, arg3, arg4, arg5);
            });

        });

    });
});
