define([], function () {
    'use strict';

    /**
     * Get a function that when calling it it fail the test for calling the method.
     * @param {String} methodName The method name
     * @param {function()=} callback jasmine done method of your test if the test is async and you want to end the test when calling the method.
     * @returns {function()} The spy method
     */
    function getFailTestMethod(methodName, callback) {
        var reject = jasmine.createSpy(methodName);
        reject.and.callFake(function () {
            expect(reject).not.toHaveBeenCalled();
            callback.apply(null, arguments);
        });

        return reject;
    }

    function isSpy(func) {
        return Boolean(func.and && func.calls);
    }

    return {
        getFailTestMethod: getFailTestMethod,
        isSpy: isSpy
    };
});
