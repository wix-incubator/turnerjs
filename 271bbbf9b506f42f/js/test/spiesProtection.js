// Use this for finding rouge spies:

((function () {
    'use strict';

    var jasmineCreateSpyTempHolder = jasmine.createSpy;
    jasmine.createSpy = function () {
        throw new Error('Do not create spies (jasmine.createSpy) outside of it/beforeEach/afterEach!! [--dany]');
    };

    beforeAll(function () { //eslint-disable-line santa/no-jasmine-outside-describe
        jasmine.createSpy = function () {
            return jasmineCreateSpyTempHolder.apply(jasmine, arguments);
        };
    });

})());
