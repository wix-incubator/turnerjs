define(['testUtils/util/jasmineHelper'], function(jasmineHelper) {
    'use strict';

    var isSpy = jasmineHelper.isSpy;

    describe('isSpy', function() {
        it('should return false for not a spy', function() {
            expect(isSpy(function(){})).toBe(false);
        });
        it('should return true for a spy', function() {
            expect(isSpy(jasmine.createSpy())).toBe(true);
        });

    });
});
