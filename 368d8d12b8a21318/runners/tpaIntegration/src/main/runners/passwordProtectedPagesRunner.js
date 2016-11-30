define([
    'zepto',
    'lodash',
    'https://cdnjs.cloudflare.com/ajax/libs/react/0.14.6/react-with-addons.js',
    'tpaIntegration/driver/driver',
    'jasmine-boot'
    ], function ($, _, React, driver) {
    'use strict';
    describe('password protected pages Tests', function () {
        var ReactTestUtils = React.addons.TestUtils;

        var dialog;
        var passwordPageId = 'ggrsh';
        var validPassword = '123';

        var enterPasswordAndNavToPage = function (pass, callback) {
            callback = _.isFunction(callback) ? callback : _.noop;
            var nextPageInfo = {
                "title": "password-protected",
                "pageId": passwordPageId
            };
            var data = {
                password: pass
            };
            dialog = ReactTestUtils.findRenderedDOMComponentWithClass(window.rendered, "s0");
            dialog.performCloseDialog = function () {
                callback(nextPageInfo.jsonUrls);
                $('#enterPasswordDialogsubmitButton').click();
            };
            dialog.setErrorMessage = function (errKey) {
                callback(errKey);
            };
            window.rendered.siteAspects.siteMembers.handlePasswordEntered(nextPageInfo, data, dialog);
        };

        describe('navigate to password pages', function() {
            it('should show password dialog for protected pages', function (done) {
                driver.waitForDomElement('#enterPasswordDialog', 10, 100)
                    .then(function () {
                        expect(true).toBe(true);
                        done();
                    });
            });

            it('should not have page urls', function () {
                var protectedPage = _.find(window.publicModel.pageList.pages, {pageId: passwordPageId});
                expect(_.isEmpty(protectedPage.urls)).toBeTruthy();
            });

            it('should show error when giving it empty password', function (done) {
                enterPasswordAndNavToPage('', function (errKey) {
                    expect(errKey).toBe('PasswordLogin_Wrong_Password');
                    done();
                });
            });

            it('should show error after giving it wrong credentials', function (done) {
                enterPasswordAndNavToPage('in' + validPassword, function (errKey) {
                    expect(errKey).toBe('PasswordLogin_Wrong_Password');
                    done();
                });
            });

            it('should get page urls and show page after giving it correct credentials', function (done) {
                var hiddenCompSelector = '#comp-ijk0o6q2';
                enterPasswordAndNavToPage(validPassword, function (jsonUrls) {
                    expect(_.isArray(jsonUrls)).toBeTruthy();
                    expect(jsonUrls.length).toBeTruthy();
                    driver.waitForDomElement(hiddenCompSelector, 10, 100)
                        .then(function () {
                            expect(true).toBe(true);
                            done();
                        });
                });
            });
        });
    });
});