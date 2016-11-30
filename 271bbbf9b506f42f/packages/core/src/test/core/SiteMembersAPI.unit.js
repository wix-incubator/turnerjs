define(['lodash', 'core/core/SiteMembersAPI', 'utils'], function (_, SiteMembersAPI, utils) {
    'use strict';
    var baseUrl = "https://users.wix.com/wix-sm/";
    var path = {
        login: "/api/member/login",
        register: "/api/member/register",
        apply: "/api/member/apply",
        sendForgotPasswordMail: "/api/member/sendForgotPasswordMail",
        resetMemberPassword: "/api/member/changePasswordWithMailToken"
    };
    var onSuccess, onError, options;

    describe("SiteMembersAPI Tests", function () {
        beforeEach(function () {
            onSuccess = function () {
            };
            onError = function () {
            };

            var siteData = {
                serviceTopology: {
                    scriptsDomainUrl: "https://users.wix.com/wix-sm/",
                    siteMembersUrl: "https://users.wix.com/wix-sm/"
                },
                currentUrl: {
                    full: ""
                },
                getMetaSiteId: function () {
                    return "";
                },
                getClientSpecMapEntriesByType: function () {
                    return [
                        {
                            smcollectionId: ""
                        }
                    ];
                }
            };

            spyOn(utils.ajaxLibrary, 'get').and.callFake(function () {
            });

            spyOn(utils.ajaxLibrary, 'temp_jsonp').and.callFake(function () {
            });

            SiteMembersAPI.initializeData(siteData);
            options = {
                type: "POST",
                complete: SiteMembersAPI.onAjaxComplete,
                context: SiteMembersAPI
            };
        });

        describe('regular requests', function () {
            describe('Register', function () {
                it('should not access via jsonp when experiment is open', function () {
                    var registerData = {
                        email: "etai@a.com",
                        collectionId: "",
                        metaSiteId: "",
                        password: "1234",
                        accept: 'json'
                    };
                    var url = baseUrl + path.register;
                    options = _.merge(options, {data: registerData, url: url});
                    SiteMembersAPI.register(registerData, onSuccess, onError);
                    expect(utils.ajaxLibrary.get.calls.mostRecent().args[0]).toContain(options);
                    expect(utils.ajaxLibrary.get.calls.mostRecent().args[0]).not.toContain({accept: 'jsonp'});
                });
            });

            describe('Login', function () {
                it('should not access via jsonp when experiment is open', function () {
                    var registerData = {
                        email: "etai@a.com",
                        collectionId: "",
                        metaSiteId: "",
                        password: "1234",
                        accept: 'json'
                    };
                    var url = baseUrl + path.login;
                    options = _.merge(options, {data: registerData, url: url});
                    SiteMembersAPI.login(registerData, onSuccess, onError);
                    expect(utils.ajaxLibrary.get.calls.mostRecent().args[0]).toContain(options);
                    expect(utils.ajaxLibrary.get.calls.mostRecent().args[0]).not.toContain({accept: 'jsonp'});
                });
            });

            describe('Forgot password', function () {
                it('should not access via jsonp when experiment is open', function () {
                    var email = "etai@a.com";
                    var url = baseUrl + path.sendForgotPasswordMail;
                    options = _.merge(options, {
                        data: {
                            email: email,
                            collectionId: "",
                            metaSiteId: "",
                            returnUrl: url,
                            accept: 'json'
                        },
                        url: url
                    });
                    SiteMembersAPI.sendForgotPasswordMail(email, url, onSuccess, onError);
                    expect(utils.ajaxLibrary.get.calls.mostRecent().args[0]).toContain(options);
                    expect(utils.ajaxLibrary.get.calls.mostRecent().args[0]).not.toContain({accept: 'jsonp'});
                });
            });

            describe('reset password', function () {
                it('should not access via jsonp when experiment is open', function () {
                    var forgotPasswordData = {
                        newPassword: "4321",
                        forgotPasswordToken: "",
                        collectionId: "",
                        metaSiteId: "",
                        accept: 'json'
                    };
                    var url = baseUrl + path.resetMemberPassword;
                    options = _.merge(options, {data: forgotPasswordData, url: url});
                    SiteMembersAPI.resetMemberPassword(forgotPasswordData, onSuccess, onError);
                    expect(utils.ajaxLibrary.get.calls.mostRecent().args[0]).toContain(options);
                    expect(utils.ajaxLibrary.get.calls.mostRecent().args[0]).not.toContain({accept: 'jsonp'});
                });
            });
        });

        describe("Send Request General and SvSession / initiator", function () {
            describe("svSession and initiator", function () {
            });
        });
    });
});
