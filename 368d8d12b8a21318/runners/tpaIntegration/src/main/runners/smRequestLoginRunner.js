define([
    'zepto',
    'lodash',
    'tpaIntegration/driver/driver',
    'jasmine-boot'
], function ($, _, driver) {
    'use strict';

    describe('smRequestLogin', function () {
        var commentsCompId = 'comp-ippelq95';

        it('should open login dialog when mode=login', function (done) {
            driver.requestLogin(commentsCompId, {mode: 'login'});

            driver.waitForDomElement('#memberLoginDialog', 10, 1000, 'memberLoginDialog was not opened in 10*1000 milsec').then(function (response) {
                expect(response.result).toBe('ok');
                done();
            });
        });

        it('should open sign up dialog when mode=signup', function (done) {
            driver.requestLogin(commentsCompId, {mode: 'signup'});

            driver.waitForDomElement('#signUpDialog', 10, 1000, 'signUpDialog was not opened in 10*1000 milsec').then(function (response) {
                expect(response.result).toBe('ok');
                done();
            });
        });
    });
});
