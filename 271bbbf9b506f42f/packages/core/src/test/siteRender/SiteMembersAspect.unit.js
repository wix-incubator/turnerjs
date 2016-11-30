define(['lodash', 'fake!santaProps', 'utils', 'definition!core/siteRender/SiteMembersAspect', 'fake!core/core/siteAspectsRegistry', 'fake!core/core/SiteMembersAPI', 'core/bi/events', 'fake!core/siteRender/SiteAspectsSiteAPI', 'experiment', 'testUtils', 'color'
], function (_, fakeSantaProps, utils, siteMembersAspectDef, fakeSiteAspectsRegistry, fakeSiteMembersAPI, events, FakeSiteAspectsSiteAPI, experiment, testUtils, Color) {
    'use strict';

    var fakeComponentPropsBuilder = fakeSantaProps.componentPropsBuilder;

    describe('SiteMembersAspect', function() {

        var SiteMemberCtor, siteAPI, siteData, siteMembersAspect, siteMemberLangs;

        function mockColorPalette(overrideColors) {
            var colors = new Array(36).join('#GGGGG,').split(',').slice(0, 35);
            overrideColors.forEach(function (clr) {
                colors[clr.id] = clr.value;
            });
            spyOn(siteData, 'getColorsMap').and.returnValue(colors);
        }

        function mockSiteData() {
            siteData = {
                getSMToken: function() { },
                getDataByQuery: function() {},
                getCurrentUrlPageId: function () {},
                getMainPageId: function () {},
                currentUrl: {
                    hostname: 'hostname',
                    path: '/path',
                    query: {}
                },
                getLanguageCode: function () {
                    return "en";
                },
                renderFlags: {
                    isPageProtectionEnabled: true
                },
                getMetaSiteId: jasmine.createSpy(),
                siteId: 'siteId',
                publicModel: {
                    pageList: {
                        pages: {

                        }
                    }
                },
                rendererModel: {
                    passwordProtectedPages: ['protectedOnServer']
                },
                serviceTopology: {
                    protectedPageResolverUrl: 'protectedPageResolverUrl'
                },
                getMainPagePath: function(){
                    return siteData.currentUrl.path;
                },
                isMobileView: function () {},
                getColorsMap: function () {}
            };
        }

        function mockSiteAspectAPI() {
            siteAPI = new FakeSiteAspectsSiteAPI();
            spyOn(siteAPI, 'getSiteAspect').and.returnValue({
                reloadClientSpecMap: jasmine.createSpy('reloadClientSpecMap')
            });
            spyOn(siteAPI, 'getSiteData').and.returnValue(siteData);
            spyOn(siteAPI, 'forceUpdate');
            spyOn(siteAPI, 'getSiteAPI').and.returnValue({});
            spyOn(siteAPI, 'navigateToPage');
            spyOn(siteAPI, 'reportBI');
        }

        function mockUtils() {
            spyOn(utils.cookieUtils, 'deleteCookie');
        }

        function mockSiteAspectRegistry() {
            spyOn(fakeSiteAspectsRegistry, 'registerSiteAspect').and.callFake(function(name, aspectCtor) {
                SiteMemberCtor = aspectCtor;
            });
        }

        function mockComponentPropsBuilder() {
            spyOn(fakeComponentPropsBuilder, 'getCompProps').and.returnValue({});
        }

        function mockCompFactory() {
            spyOn(utils.compFactory, 'getCompClass').and.callFake(function (componentType) {
                if (componentType) {
                    return function (props) { return props; };
                }
                throw new Error('component type was falsy');
            });
        }

        function mockMemberDetails(details){
            spyOn(fakeSiteMembersAPI, 'getMemberDetails').and.callFake(function(token, callback){
                callback({payload: details});
            });
            siteMembersAspectDef(_, fakeSantaProps, utils, fakeSiteAspectsRegistry, fakeSiteMembersAPI, events, null, experiment, Color);
            siteMembersAspect = new SiteMemberCtor(siteAPI);
            spyOn(siteData, 'getSMToken').and.returnValue('SOME-TOKEN');
            siteMembersAspect.getMemberDetails();
        }

        function mockNewSiteMembersAspect(experimentKey) {
            testUtils.experimentHelper.openExperiments(experimentKey || 'newLoginScreens');
            siteMembersAspectDef(_, fakeSantaProps, utils, fakeSiteAspectsRegistry, fakeSiteMembersAPI, events, null, experiment, Color);
            siteMembersAspect = new SiteMemberCtor(siteAPI);
        }

        function mockSiteMemberLangs() {
            siteMemberLangs = {en : {}};
        }

        function showAuthDialog(isFirstDialogLogin, options) {
            var language = _.isUndefined(options.lang) ? 'en' : options.lang;
            spyOn(siteData, 'getDataByQuery').and.returnValue({
                smSettings: _.assign({
                    smFirstDialogLogin: !!isFirstDialogLogin
                }, options.smSettings)
            });
            siteMembersAspect.showAuthenticationDialog(_.noop, language, options.showLoginDialog);
        }

        function getDialog() {
            return {
                structure: siteMembersAspect.getComponentStructures()[0],
                component: siteMembersAspect.getReactComponents()
            };
        }

        var GIVEN_DIALOG = {
            login: function (options) {
                showAuthDialog(true, options || {});
                return getDialog();
            },
            signup: function (options) {
                showAuthDialog(false, options || {});
                return getDialog();
            },
            resetPassword: function () {
                siteData.currentUrl.query.forgotPasswordToken = '737373';
                spyOn(siteData, 'getSMToken').and.returnValue(false);
                spyOn(siteData, 'getDataByQuery').and.returnValue({pageSecurity: {requireLogin: true}});
                spyOn(fakeSiteMembersAPI, 'resetMemberPassword').and.callFake(function (newPassword, onSuccess) {
                    onSuccess();
                });
                siteMembersAspect.showDialogOnNextRender({});
                return getDialog();
            }
        };

        beforeEach(function() {
            mockSiteAspectRegistry();
            mockUtils();
            mockSiteData();
            mockSiteAspectAPI();
            mockComponentPropsBuilder();
            mockCompFactory();
            mockSiteMemberLangs();

            siteMembersAspectDef(_, fakeSantaProps, utils, fakeSiteAspectsRegistry, fakeSiteMembersAPI, events, siteMemberLangs, experiment, Color);
            siteMembersAspect = new SiteMemberCtor(siteAPI);
        });

        it('Instance should be defined', function() {
            expect(siteMembersAspect).toBeDefined();
        });

        describe('Is Logged In?', function() {

            it('Should be true if SM token exists', function() {
                spyOn(siteData, 'getSMToken').and.returnValue('SOME-TOKEN');

                expect(siteMembersAspect.isLoggedIn()).toBe(true);
            });

            it('Should be false if no SM token exists', function() {
                spyOn(siteData, 'getSMToken').and.returnValue(null);

                expect(siteMembersAspect.isLoggedIn()).toBe(false);
            });
        });

        describe('logout function', function() {

            it('Should NOT be able to log out if the user is the site owner', function () {
                spyOn(utils.cookieUtils, 'getCookie').and.returnValue({value: 'wixClient'});
                mockMemberDetails({owner: true});

                siteMembersAspect.logout();

                expect(utils.cookieUtils.deleteCookie).not.toHaveBeenCalled();
                expect(siteAPI.getSiteAspect().reloadClientSpecMap).not.toHaveBeenCalled();
            });

            it('Should be able to log out if the user is not the site owner', function() {
                spyOn(siteData, 'getSMToken').and.returnValue('SOME-TOKEN');
                siteMembersAspect.memberDetails = {owner: false};

                siteMembersAspect.logout();

                var deleteCookieCalls = utils.cookieUtils.deleteCookie.calls;
                var deletedCookies = _.map(deleteCookieCalls.allArgs(), _.first);
                expect(_.xor(deletedCookies, ['svSession', 'smSession'])).toEqual([]);

                expect(siteAPI.getSiteAspect().reloadClientSpecMap).toHaveBeenCalled();
            });

        });

        describe('getMemberDetails function', function() {

            it('Should return the member details it user is logged in and member details exists', function() {
                mockMemberDetails({email: 'user@wix.com'});
                expect(siteMembersAspect.getMemberDetails()).toEqual({email: 'user@wix.com'});
            });

            it('Should request for member details and force update if user is logged in and member details does not exists', function() {
                spyOn(siteData, 'getSMToken').and.returnValue('SOME-TOKEN');

                spyOn(fakeSiteMembersAPI, 'getMemberDetails').and.callFake(function(smToken, callback) {
                    callback({payload: {email: 'user@wix.com'}});
                });

                siteMembersAspect.getMemberDetails();

                expect(siteAPI.forceUpdate).toHaveBeenCalled();
            });

            it('Should return null if user is logged out', function() {
                spyOn(siteData, 'getSMToken').and.returnValue(null);

                expect(siteMembersAspect.getMemberDetails()).toBe(null);
            });
        });

        describe('isPageAllowed function', function() {

            describe('Page is allowed', function() {

                it('Should be allowed when there is no page security', function() {
                    spyOn(siteData, 'getDataByQuery').and.returnValue({});

                    var isPageAllowed = siteMembersAspect.isPageAllowed({pageId: 'somePageId'});

                    expect(isPageAllowed).toBe(true);
                });

                it('Should be allowed when page security does not require login', function() {
                    spyOn(siteData, 'getDataByQuery').and.returnValue({pageSecurity: {requireLogin: false}});

                    var isPageAllowed = siteMembersAspect.isPageAllowed({pageId: 'somePageId'});

                    expect(isPageAllowed).toBe(true);
                });

                it('Should be allowed when page security does require login and user is logged in', function() {
                    spyOn(siteData, 'getSMToken').and.returnValue('SOME-TOKEN');
                    spyOn(siteData, 'getDataByQuery').and.returnValue({pageSecurity: {requireLogin: true}});

                    var isPageAllowed = siteMembersAspect.isPageAllowed({pageId: 'somePageId'});

                    expect(isPageAllowed).toBe(true);
                });


            });
            describe('Page is NOT allowed', function() {

                describe('reset forgotten password', function(){
                    it('Should allow if page is not protected and "forgotPasswordToken" is in query param', function() {
                        siteData.currentUrl.query.forgotPasswordToken = '1234';

                        var isPageAllowed = siteMembersAspect.isPageAllowed({pageId: 'somePageId'});

                        expect(isPageAllowed).toBe(true);
                    });

                    it('should NOT be allowed when page security is not present but has forgotPasswordToken in the URL', function() {
                        siteData.currentUrl.query.forgotPasswordToken = '1234';
                        spyOn(siteData, 'getDataByQuery').and.returnValue({pageSecurity: {requireLogin: true}});

                        var isPageAllowed = siteMembersAspect.isPageAllowed({pageId: 'somePageId'});

                        expect(isPageAllowed).toBe(false);
                    });
                });

                it('Should require passwordDigest', function() {
                    spyOn(siteData, 'getDataByQuery').and.returnValue({pageSecurity: {passwordDigest: true}});

                    var isPageAllowed = siteMembersAspect.isPageAllowed({pageId: 'somePageId'});

                    expect(isPageAllowed).toBe(false);
                });

                it('Should ask for password if page protected by password on the server', function () {
                    spyOn(siteData, 'getDataByQuery').and.returnValue({pageSecurity: {}});
                    var isPageAllowed = siteMembersAspect.isPageAllowed({pageId: 'protectedOnServer'});
                    expect(isPageAllowed).toBe(false);
                });

                it('Should require login and user is not logged in', function() {
                    spyOn(siteData, 'getSMToken').and.returnValue(null);
                    spyOn(siteData, 'getDataByQuery').and.returnValue({pageSecurity: {requireLogin: true}});

                    var isPageAllowed = siteMembersAspect.isPageAllowed({pageId: 'somePageId'});

                    expect(isPageAllowed).toBe(false);
                });
            });
        });

        describe('Components Structure', function() {

            it('Should be SignUp structure', function() {
                var compStructure = GIVEN_DIALOG.signup().structure;
                expect(compStructure).toEqual({
                    componentType: 'wysiwyg.viewer.components.dialogs.siteMemberDialogs.SignUpDialog',
                    type: 'Component',
                    id: 'signUpDialog',
                    key: 'signUpDialog',
                    skin: 'wysiwyg.viewer.skins.dialogs.siteMembersDialogs.signUpDialogSkin'
                });
            });

            it('Should be Login structure', function() {
                var compStructure = GIVEN_DIALOG.login().structure;
                expect(compStructure).toEqual({
                    componentType: 'wysiwyg.viewer.components.dialogs.siteMemberDialogs.MemberLoginDialog',
                    type: 'Component',
                    id: 'memberLoginDialog',
                    key: 'memberLoginDialog',
                    skin: 'wysiwyg.viewer.skins.dialogs.siteMembersDialogs.memberLoginDialogSkin'
                });
            });

            it('Should be notification structure', function() {
                spyOn(utils.cookieUtils, 'getCookie').and.returnValue({value: 'wixClient'});
                mockMemberDetails({owner: true});
                siteMembersAspect.logout();

                var compStructure = siteMembersAspect.getComponentStructures();

                var expectedStructure = {
                    componentType: 'wysiwyg.viewer.components.dialogs.NotificationDialog',
                    type: 'Component',
                    id: 'notificationDialog',
                    key: 'notificationDialog',
                    skin: 'wysiwyg.viewer.skins.dialogs.notificationDialogSkin'
                };
                expect(compStructure[0]).toEqual(expectedStructure);
            });

            it('Should be new notification structure', function() {
                mockNewSiteMembersAspect();
                spyOn(utils.cookieUtils, 'getCookie').and.returnValue({value: 'wixClient'});
                mockMemberDetails({owner: true});
                siteMembersAspect.logout();

                var compStructure = siteMembersAspect.getComponentStructures();

                expect(compStructure[0]).toEqual({
                    componentType: 'wysiwyg.viewer.components.dialogs.NotificationDialog',
                    type: 'Component',
                    id: 'notificationDialog',
                    key: 'notificationDialog',
                    skin: 'wysiwyg.viewer.skins.dialogs.notificationDialogSkinNew'
                });
            });

            it('Should be forgot password structure', function () {
                var dialog = GIVEN_DIALOG.login().component;
                dialog.onForgetYourPasswordClick();
                var compStructure = siteMembersAspect.getComponentStructures()[0];
                expect(compStructure).toEqual({
                    componentType: 'wysiwyg.viewer.components.dialogs.siteMemberDialogs.RequestPasswordResetDialog',
                    type: 'Component',
                    id: 'requestResetPasswordDialog',
                    key: 'requestResetPasswordDialog',
                    skin: 'wysiwyg.viewer.skins.dialogs.siteMembersDialogs.requestPasswordResetDialogSkin'
                });
            });

            it('Should be reset password structure', function () {
                var dialog = GIVEN_DIALOG.resetPassword().structure;
                expect(dialog).toEqual({
                    componentType: 'wysiwyg.viewer.components.dialogs.siteMemberDialogs.ResetPasswordDialog',
                    type: 'Component',
                    id: 'resetPasswordDialog',
                    key: 'resetPasswordDialog',
                    skin: 'wysiwyg.viewer.skins.dialogs.siteMembersDialogs.resetPasswordDialogSkin'
                });
            });

            describe('when showLoginDialog is passed', function () {

                it('should show Login dialog when showLoginDialog=true', function () {
                    var compStructure = GIVEN_DIALOG.signup({showLoginDialog : true}).structure;
                    expect(compStructure.id).toEqual('memberLoginDialog');
                });

                it('Should show SignUp dialog when showLoginDialog=false', function () {
                    var compStructure = GIVEN_DIALOG.login({showLoginDialog : false}).structure;
                    expect(compStructure.id).toEqual('signUpDialog');
                });

                it('should show Login dialog when showLoginDialog is not boolean', function () {
                    var compStructure = GIVEN_DIALOG.login({showLoginDialog : undefined}).structure;
                    expect(compStructure.id).toEqual('memberLoginDialog');
                });
            });

                describe('when onCancel callback is passed', function(){
                    it('should call cancel callback when closing the dialog if there wasn\'t a successful login', function(){
                        var cancelCallback = jasmine.createSpy();
                        siteMembersAspect.showAuthenticationDialog(jasmine.createSpy(), undefined, true, cancelCallback);
                        var componentProps = siteMembersAspect.getReactComponents();
                        componentProps.onCloseDialogCallback({performCloseDialog: _.noop});

                        expect(cancelCallback).toHaveBeenCalled();
                        expect(siteMembersAspect.onCancelCallback).toBeNull();
                    });

                    it('should not call cancel callback when closing the dialog if there was a successful login', function(){
                        mockMemberDetails({email: 'user@wix.com'});

                        var cancelCallback = jasmine.createSpy();
                        siteMembersAspect.showAuthenticationDialog(jasmine.createSpy(), undefined, true, cancelCallback);
                        var componentProps = siteMembersAspect.getReactComponents();
                        componentProps.onCloseDialogCallback({performCloseDialog: _.noop});

                        expect(cancelCallback).not.toHaveBeenCalled();
                        expect(siteMembersAspect.onCancelCallback).toBeNull();
                    });
                });

                describe('when language is passed', function(){
                    it('should show the right dialog when with the requested language', function(){
                        siteMembersAspect.showAuthenticationDialog(jasmine.createSpy(), 'es', true);
                        var compStructure = siteMembersAspect.getComponentStructures();
                        var componentProps = siteMembersAspect.getReactComponents();

                        expect(compStructure[0].id).toEqual('memberLoginDialog');
                        expect(componentProps.language).toEqual('es');
                    });
                });
            });

        describe('Social Login Mobile View', function () {

            beforeEach(function () {
                mockNewSiteMembersAspect('newLoginScreens');
                spyOn(utils.cookieUtils, 'getCookie').and.returnValue({value: 'wixClient'});
                spyOn(siteData, 'isMobileView').and.returnValue(function () { return true; });
                mockMemberDetails({owner: true});
            });

            it('Should be mobile-social-login structure', function () {
                var compStructure = GIVEN_DIALOG.login({
                    smSettings: {
                        socialLoginGoogleEnabled: true,
                        socialLoginFacebookEnabled: false
                    }
                }).structure;
                expect(compStructure).toEqual({
                    componentType: 'wysiwyg.viewer.components.dialogs.siteMemberDialogs.MemberLoginDialog',
                    type: 'Component',
                    id: 'memberLoginDialog',
                    key: 'memberLoginDialog',
                    skin: 'wysiwyg.viewer.skins.dialogs.siteMembersDialogs.memberLoginDialogSkinSocialMobile'
                });
            });

            it('Should be new mobile-social-signup structure', function () {
                var compStructure = GIVEN_DIALOG.signup({
                    smSettings: {
                        socialLoginGoogleEnabled: true,
                        socialLoginFacebookEnabled: false
                    }
                }).structure;
                expect(compStructure).toEqual({
                    componentType: 'wysiwyg.viewer.components.dialogs.siteMemberDialogs.SignUpDialog',
                    type: 'Component',
                    id: 'signUpDialog',
                    key: 'signUpDialog',
                    skin: 'wysiwyg.viewer.skins.dialogs.siteMembersDialogs.signUpDialogSkinSocialMobile'
                });
            });

        });

        describe('Themed dialogs', function () {

            function setup() {
                mockNewSiteMembersAspect();
                spyOn(utils.cookieUtils, 'getCookie').and.returnValue({value: 'wixClient'});
                spyOn(siteData, 'isMobileView').and.returnValue(function () { return true; });
                mockMemberDetails({owner: true});
            }

            describe('when experiment is disabled', function () {

                beforeEach(function () {
                    setup();
                });

                it('should have themed dialog style when fixed-color experiment is disabled', function () {
                    var loginDialogStructure = GIVEN_DIALOG.login().structure;
                    expect(loginDialogStructure.skin).toEqual('wysiwyg.viewer.skins.dialogs.siteMembersDialogs.memberLoginDialogSkinNew');
                });

            });

            describe('when experiment is enabled', function () {

                beforeEach(function () {
                    testUtils.experimentHelper.openExperiments('fallbackStyleDialogs');
                    setup();
                });

                it('should have themed dialog style if color palette is readable', function () {
                    mockColorPalette([{id: 11, value: '#AEFF00'}, {id: 15, value: '#000D80'}]);
                    var loginDialogStructure = GIVEN_DIALOG.login().structure;
                    expect(loginDialogStructure.skin).toEqual('wysiwyg.viewer.skins.dialogs.siteMembersDialogs.memberLoginDialogSkinNew');
                });

                it('should have fixed dialog style if color palette is not readable', function () {
                    mockColorPalette([{id: 11, value: '#FF0000'}, {id: 15, value: '#008000'}]);
                    var loginDialogStructure = GIVEN_DIALOG.login().structure;
                    expect(loginDialogStructure.skin).toEqual('wysiwyg.viewer.skins.dialogs.siteMembersDialogs.memberLoginDialogSkinFixed');
                });

                it('should have fixed dialog style if color palette is not valid', function () {
                    mockColorPalette([{id: 11, value: null}, {id: 15, value: '#GGGGG'}]);
                    var loginDialogStructure = GIVEN_DIALOG.login().structure;
                    expect(loginDialogStructure.skin).toEqual('wysiwyg.viewer.skins.dialogs.siteMembersDialogs.memberLoginDialogSkinFixed');
                });

            });

        });

        describe('Dialog Language', function(){
            it("should open dialog with proper site language", function(){
                var componentProps = GIVEN_DIALOG.signup({lang: 'es'}).component;
                expect(componentProps.language).toEqual("es");
            });

            it("should open dialog with default site language", function(){
                var componentProps = GIVEN_DIALOG.signup().component;
                expect(componentProps.language).toEqual("en");
            });

            it("should switch dialogs and keep same language", function(){
                spyOn(siteData, 'getDataByQuery').and.returnValue({
                    smSettings : {
                        smFirstDialogLogin: true
                    },
                    pageSecurity: {
                        requireLogin : true,
                        dialogLanguage : 'ru'
                    }
                });
                siteMembersAspect.showDialogOnNextRender({});
                var componentProps = siteMembersAspect.getReactComponents();
                expect(componentProps.language).toEqual("ru");
                componentProps.onSwitchDialogLinkClick();
                componentProps = siteMembersAspect.getReactComponents();
                expect(componentProps.language).toEqual("ru");
            });

        });

        describe('Disabling Page Protection From Editor', function(){
            it('Page navigation should always be allowed in the editor', function() {
                siteData.renderFlags = {
                    isPageProtectionEnabled: false
                };
                spyOn(siteData, 'getDataByQuery').and.returnValue({pageSecurity: {passwordDigest: true}});

                var isPageAllowed = siteMembersAspect.isPageAllowed({pageId: 'somePageId'});

                expect(isPageAllowed).toBe(true);
            });
        });

        describe('enterPasswordHandler for enterPasswordDialog', function () {
            var data, mockDialog, ajaxSpy, nextPageInfo;

            beforeEach(function () {
                ajaxSpy = spyOn(utils.ajaxLibrary, 'ajax');
                data = {
                    password: 'myhxs0rPassword'
                };
                nextPageInfo = {
                    pageId: 'passwordDigestOnJson'
                };

                mockDialog = {
                    setErrorMessage: jasmine.createSpy('setErrorMessage'),
                    performCloseDialog: jasmine.createSpy('performCloseDialog')
                };
            });

            it('should call to password resolver endpoint if page id listed in passwordProtectedPages', function () {
                nextPageInfo.pageId = 'protectedOnServer';
                siteMembersAspect.handlePasswordEntered(nextPageInfo, data, mockDialog);
                expect(ajaxSpy.calls.count()).toBe(1);
            });

            it('should use client side validation when page id not listed in passwordProtectedPages', function () {
                var siteDataWithPageJsonUrls = _.cloneDeep(siteData);
                siteDataWithPageJsonUrls.publicModel.pageList.pages = [{
                    pageId: nextPageInfo.pageId,
                    urls:  ['http://www.foo.bar']
                }];
                siteAPI.getSiteData.and.returnValue(siteDataWithPageJsonUrls);
                siteMembersAspect = new SiteMemberCtor(siteAPI);

                siteMembersAspect.handlePasswordEntered(nextPageInfo, data, mockDialog);
                expect(ajaxSpy.calls.count()).toBe(0);
            });

            it('should do an ajax call when password was GIVEN_DIALOG and page id listed in passwordProtectedPages', function() {
                nextPageInfo.pageId = 'protectedOnServer';
                siteMembersAspect.handlePasswordEntered(nextPageInfo, data, mockDialog);
                expect(ajaxSpy.calls.count()).toBe(1);
            });

            it('should not do an ajax call when password was not GIVEN_DIALOG and call the GIVEN_DIALOG dialog setErrorMessage', function() {
                var unValidData = _.clone(data);
                delete unValidData.password;
                siteMembersAspect.handlePasswordEntered(nextPageInfo, unValidData, mockDialog);
                expect(ajaxSpy.calls.count()).toBe(0);
                expect(mockDialog.setErrorMessage).toHaveBeenCalledWith('PasswordLogin_Wrong_Password');
            });

            it('should send to the server the GIVEN_DIALOG password, metaSiteId, siteId and pageId', function () {
                nextPageInfo.pageId = 'protectedOnServer';
                var metaSiteId = 'metaSiteId';
                siteData.getMetaSiteId.and.returnValue(metaSiteId);
                var mockData = {
                    type: 'POST',
                    url: siteData.serviceTopology.protectedPageResolverUrl,
                    data: {
                        password: data.password,
                        metaSiteId: metaSiteId,
                        siteId: siteData.siteId,
                        pageId: nextPageInfo.pageId
                    },
                    dataType: 'json',
                    contentType: 'application/json',
                    success: jasmine.any('Function'),
                    error: jasmine.any('Function')
                };

                ajaxSpy.and.callFake(function (ajaxArgs) {
                    expect(ajaxArgs.url).toBe(mockData.url);
                    expect(ajaxArgs.data).toEqual(mockData.data);
                });

                siteMembersAspect.handlePasswordEntered(nextPageInfo, data, mockDialog);
            });

            it('should provide onSuccess and onError functions', function() {
                ajaxSpy.and.callFake(function (opts) {
                    expect(opts.success).toBeDefined();
                    expect(opts.error).toBeDefined();
                });
                siteMembersAspect.handlePasswordEntered(nextPageInfo, data, mockDialog);
            });

            it('should call dialog setErrorMessage when server returns error', function() {
                nextPageInfo.pageId = 'protectedOnServer';
                ajaxSpy.and.callFake(function (opts) {
                    opts.error();
                    expect(mockDialog.setErrorMessage).toHaveBeenCalledWith('PasswordLogin_Wrong_Password');

                });
                siteMembersAspect.handlePasswordEntered(nextPageInfo, data, mockDialog);
                expect(ajaxSpy.calls.count()).toBe(1);
            });


            it('should close the dialog when a success callback happened', function () {
                nextPageInfo.pageId = 'protectedOnServer';
                var passwordResolverResponse = {
                    payload: {
                        urls: [
                            'http://haxs0r.com',
                            'http://foo.bar'
                        ]
                    }
                };
                ajaxSpy.and.callFake(function (opts) {
                    opts.success(passwordResolverResponse);
                    expect(mockDialog.performCloseDialog).toHaveBeenCalled();
                });
                siteMembersAspect.handlePasswordEntered(nextPageInfo, data, mockDialog);
                expect(ajaxSpy.calls.count()).toBe(1);
            });

            it('should navigate to the nextPageInfo pageId and pass along the server GIVEN_DIALOG urls', function () {
                nextPageInfo.pageId = 'protectedOnServer';
                var passwordResolverResponse = {
                    payload: {
                        urls: [
                            'http://haxs0r.com',
                            'http://foo.bar'
                        ]
                    }
                };
                ajaxSpy.and.callFake(function (opts) {
                    opts.success(passwordResolverResponse);
                    expect(siteAPI.navigateToPage).toHaveBeenCalledWith({
                        pageId: nextPageInfo.pageId,
                        jsonUrls: passwordResolverResponse.payload.urls
                    });

                });
                siteMembersAspect.handlePasswordEntered(nextPageInfo, data, mockDialog);
                expect(ajaxSpy.calls.count()).toBe(1);
            });

            it('should validate GIVEN_DIALOG password against JSON for old protected pages', function () {
                siteMembersAspect.handlePasswordEntered(nextPageInfo, data, mockDialog);

            });
        });

        describe('BI', function () {

            beforeEach(function () {
                siteAPI.reportBI.calls.reset();
            });

            it('should send event 601 - user clicked on signup dialog', function () {
                GIVEN_DIALOG.login();
                expect(siteAPI.reportBI).toHaveBeenCalledWith({
                    "eventId": 601,
                    "adapter": "site-members",
                    "src": 5,
                    "packageName": "core"
                });
            });

            it('should send event 601 - user clicked on login dialog', function () {
                GIVEN_DIALOG.login();
                expect(siteAPI.reportBI).toHaveBeenCalledWith({
                    "eventId": 601,
                    "adapter": "site-members",
                    "src": 5,
                    "packageName": "core"
                });
            });

            it('should send event 602 - user-closed-dialog', function () {
                var dialog = GIVEN_DIALOG.login().component;

                dialog.onCloseDialogCallback({
                    performCloseDialog : _.noop,
                    props : {id: 'dummyDialog'}
                }, false, true);

                expect(siteAPI.reportBI).toHaveBeenCalledWith({
                    "eventId": 602,
                    "adapter": "site-members",
                    "params": {
                        "context": "context"
                    },
                    "src": 5,
                    "packageName": "core"
                }, {context: 'dummyDialog'});
            });

            it('should send event 603 - user clicked go/submit in login dialog', function () {
                var dialog = GIVEN_DIALOG.login().component;

                dialog.onSubmitCallback({}, {
                    setErrorMessageByCode : _.noop,
                    props : {id: 'loginDialog'}
                });

                expect(siteAPI.reportBI).toHaveBeenCalledWith({
                    "eventId": 603,
                    "adapter": "site-members",
                    "params": {
                        "context": "context"
                    },
                    "src": 5,
                    "packageName": "core"
                }, {context: 'loginDialog'});
            });

            it('should send event 603 - user clicked go/submit in signup dialog', function () {
                var dialog = GIVEN_DIALOG.signup().component;
                siteData.rendererModel = {
                    passwordProtectedPages: ['protectedOnServer'],
                    clientSpecMap : [{
                        type : 'sitemembers',
                        collectionType : null // ApplyForMembership
                    }]
                };

                dialog.onSubmitCallback({}, {
                    setErrorMessageByCode : _.noop,
                    props : {id: 'signupDialog'}
                });

                expect(siteAPI.reportBI).toHaveBeenCalledWith({
                    "eventId": 603,
                    "adapter": "site-members",
                    "params": {
                        "context": "context"
                    },
                    "src": 5,
                    "packageName": "core"
                }, {context: 'signupDialog'});
            });

            it('should send events [601, 603, 604] - user clicked go/submit in forget password dialog', function () {
                var dialog = GIVEN_DIALOG.login().component;
                dialog.onForgetYourPasswordClick();
                dialog = siteMembersAspect.getReactComponents();

                dialog.onSubmitCallback({}, {
                    setErrorMessageByCode : _.noop,
                    props : {id: 'forgetPasswordDialog'}
                });

                expect(siteAPI.reportBI).toHaveBeenCalledWith({
                    "eventId": 601,
                    "adapter": "site-members",
                    "src": 5,
                    "packageName": "core"
                });
                expect(siteAPI.reportBI).toHaveBeenCalledWith({
                    "eventId": 604,
                    "adapter": "site-members",
                    "src": 5,
                    "packageName": "core"
                });
                expect(siteAPI.reportBI).toHaveBeenCalledWith({
                    "eventId": 603,
                    "adapter": "site-members",
                    "params": {
                        "context": "context"
                    },
                    "src": 5,
                    "packageName": "core"
                }, {context: 'forgetPasswordDialog'});
            });

            it('should send event 603 - user clicked go/submit in reset new password dialog, and confirmed success message', function () {
                var dialog = GIVEN_DIALOG.resetPassword().component;

                dialog.onSubmitCallback({}, {
                    setErrorMessageByCode : _.noop,
                    props : {id: 'resetPasswordDialog'}
                });

                var successNotification = siteMembersAspect.getReactComponents();
                successNotification.onButtonClick();

                expect(siteAPI.reportBI).toHaveBeenCalledWith({
                    "eventId": 603,
                    "adapter": "site-members",
                    "params": {
                        "context": "context"
                    },
                    "src": 5,
                    "packageName": "core"
                }, {context: 'resetPasswordDialog'});
                expect(siteAPI.reportBI).toHaveBeenCalledWith({
                    "eventId": 603,
                    "adapter": "site-members",
                    "params": {
                        "context": "context"
                    },
                    "src": 5,
                    "packageName": "core"
                }, {context: 'resetPasswordSuccessNotification'});
            });

        });

    });

 });
