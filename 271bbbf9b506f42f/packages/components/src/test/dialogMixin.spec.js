define(['react', 'testUtils', 'definition!components/components/dialogs/dialogMixin', 'fake!core', 'utils', 'lodash', 'components/components/dialogs/translations/dialogMixinTranslations', 'experiment'], function (React, /** testUtils */ testUtils, dialogMixinDef, fakeCore, utils, _, langKeys, experiment) {
    'use strict';

    var dialogMixin = dialogMixinDef(_, utils, fakeCore, langKeys, null, experiment);

    var testBasicDialog = {
        mixins: [dialogMixin],
        render: function() {
            return React.DOM.div();
        }
    };

    function createComponent(props) {
        return testUtils.getComponentFromDefinition(testBasicDialog, props);
    }

    describe('dialogMixin spec', function(){

        var props;

        beforeEach(function() {
            props = testUtils.mockFactory.mockProps();
        });

        it('verify initial state', function() {
            var comp = createComponent(props);

            expect(comp.state.showComponent).toBeTruthy();
            expect(comp.state.errMsg).toEqual('');
            expect(comp.state.$view).toEqual('desktop');
        });

        it('should set error message in state', function () {
            var comp = createComponent(props);

            comp.setErrorMessageByCode();
            expect(comp.state.errMsg).toBe('');

            langKeys.en.SMForm_Error_dummyError1 = 'dummy1';
            comp.setErrorMessageByCode('dummyError1');
            expect(comp.state.errMsg).toBe('dummy1');

            langKeys.en.SMForm_Error_dummyError2 = 'dummy2';
            comp.setErrorMessageByCode('SMForm_Error_dummyError2');
            expect(comp.state.errMsg).toBe('dummy2');
        });

        describe('submit', function() {
            var comp;

            beforeEach(function() {
                props.onSubmitCallback = jasmine.createSpy();

                comp = createComponent(props);
                comp.getDataToSubmit = function() {return {};};
            });

            it('no validateBeforeSubmit', function() {
                comp.submit();

                expect(comp.props.onSubmitCallback).toHaveBeenCalledWith(jasmine.any(Object), comp);
            });

            it('validateBeforeSubmit returns true', function() {
                comp.validateBeforeSubmit = jasmine.createSpy().and.returnValue(true);

                comp.submit();

                expect(comp.validateBeforeSubmit).toHaveBeenCalled();
                expect(comp.props.onSubmitCallback).toHaveBeenCalledWith(jasmine.any(Object), comp);
            });

            it('validateBeforeSubmit returns false', function() {
                comp.validateBeforeSubmit = jasmine.createSpy().and.returnValue(false);

                comp.submit();

                expect(comp.validateBeforeSubmit).toHaveBeenCalled();
                expect(comp.props.onSubmitCallback).not.toHaveBeenCalled();
            });
        });

        describe('_getEmailValidator', function(){
            it('validator should return false (valid) on a valid mail', function() {
                var emailValidator = dialogMixin._getEmailValidator('en');
                expect(emailValidator('a@a.com')).toBe(false);
            });
            it('validator should return error on a blank email', function() {
                var emailValidator = dialogMixin._getEmailValidator('en');
                expect(emailValidator('')).toBe(dialogMixin.getText('en', "SMForm_Error_Email_Blank"));
            });
            it('validator should return error on an invalid email', function() {
                var emailValidator = dialogMixin._getEmailValidator('en');
                expect(emailValidator('a@a')).toBe(dialogMixin.getText('en', "SMForm_Error_Email_Invalid"));
            });
        });

        xdescribe("getText", function(){
            it("should return general error message if errorCode is not available", function(){
                var errorCode = "SMError-1";
                var errorText = dialogMixin.getText("en", errorCode);
                expect(errorText).toBe("Server error. try again later.");
            });

            it("should return correct error message based upon the error code", function(){
                var errorCode = "SMForm_Error_19999";
                var errorText = dialogMixin.getText("en", errorCode);
                expect(errorText).toBe("Unknown user");
            });
        });

        describe('createContent', function () {

            var comp;

            beforeEach(function () {
                comp = createComponent(props);
            });

            it('should create content element without class (default behavior)', function () {
                expect(comp.createContent().className).toBeEmptyString();
                expect(comp.createContent().onKeyPress).toBe(comp.submitOnEnterKeyPress);
            });

            it('should create content element with validation error class ', function () {
                comp.setErrorMessage('blah');
                expect(comp.createContent(true).className).toEndWithString('_validationError');
            });

            it('should create content element without validation error class ', function () {
                expect(comp.createContent(true).className).toBeEmptyString();
            });
        });

        describe('Social Login', function () {

            var comp, styleId = 's73';

            beforeEach(function() {
                props = testUtils.mockFactory.mockProps();
                props.siteData.serviceTopology.siteMembersUrl = 'https://test-localhost';
                props.styleId = styleId;
                comp = createComponent(props);
            });

            it('should set initial state', function () {
                var initialState = comp.getInitialState();
                expect(initialState.socialLoginEnabled).toBe(false);
                expect(initialState.socialLoginIframeReady).toBe(false);
                expect(initialState.oAuthErrMsg).toBe('');
            });

            it('should toggle display inner state and get social login mode class', function () {
                var socialLoginSkinParts = comp.getSocialLoginSkinParts('signup', 'en', {
                    google : 'dialogMixinTranslations_login_google',
                    facebook : 'dialogMixinTranslations_login_facebook',
                    switchEmail : 'dialogMixinTranslations_login_switch_email'
                });
                expect(comp.getMobileSocialLoginClass()).toBe('emailLoginMode');
                socialLoginSkinParts.switchToSocialLink.onClick();
                expect(comp.getMobileSocialLoginClass()).toBe('socialLoginMode');
                socialLoginSkinParts.switchToEmailLink.onClick();
                expect(comp.getMobileSocialLoginClass()).toBe('emailLoginMode');
            });

            it('should hide social login errors when no error in state', function () {
                var socialLoginSkinParts = comp.getSocialLoginSkinParts('signup', 'en', {
                    google : '',
                    facebook : '',
                    switchEmail : ''
                });
                expect(socialLoginSkinParts.socialLoginErrorMsg.className).toBe(styleId);
                expect(socialLoginSkinParts.socialLoginErrorMsg.children).toBe('');
            });

            it('should show social login errors when there is an error in state', function () {
                var expectedErrorMessage = 'social signup error!';
                langKeys.en.SMForm_Error_dummyError = expectedErrorMessage;

                comp.setOuathErrorMessageByCode('dummyError');
                var socialLoginSkinParts = comp.getSocialLoginSkinParts('signup', 'en', {
                    google : '',
                    facebook : '',
                    switchEmail : ''
                });
                expect(socialLoginSkinParts.socialLoginErrorMsg.className).toBe(styleId + '_enabled');
                expect(socialLoginSkinParts.socialLoginErrorMsg.children).toBe(expectedErrorMessage);
            });

            describe('social buttons (dummy and iframe)', function () {

                function mockSmSettings(data) {
                    spyOn(props.siteData, 'getDataByQuery').and.returnValue({
                        smSettings: data
                    });
                }

                beforeEach(function () {
                    props.siteData.serviceTopology.siteMembersUrl = 'https://test-localhost';
                    comp = createComponent(props);
                });

                it('should be hidden based on state.socialLoginIframeReady', function () {
                    expect(comp.getSocialLoginSkinParts(null, null, {}).dummySocialButtons.className).toBe('');
                    comp.onSocialLoginIframeMessage({type: 'page-ready'});
                    expect(comp.getSocialLoginSkinParts(null, null, {}).dummySocialButtons.className).toBe(styleId + '_hide');
                });

                it('should have only google login button when enabled', function () {
                    mockSmSettings({
                        socialLoginGoogleEnabled: true
                    });
                    var dummySocialButtons = comp.getSocialLoginSkinParts(null, null, {}).dummySocialButtons;
                    expect(dummySocialButtons.className).toContain(styleId + '_google');
                    expect(dummySocialButtons.className).not.toContain(styleId + '_facebook');
                    var socialLogin = comp.getSocialLoginSkinParts('mock_mode', 'do', {});
                    expect(socialLogin.socialHolder.src).toBe('//test-localhost/view/social/frame/8bf9f82c-51ba-4ede-a31c-d84ec021d869?mode=mock_mode&lang=do&vendors=google');
                });

                it('should have only facebook login button when enabled', function () {
                    mockSmSettings({
                        socialLoginFacebookEnabled: true
                    });
                    var dummySocialButtons = comp.getSocialLoginSkinParts(null, null, {}).dummySocialButtons;
                    expect(dummySocialButtons.className).toContain(styleId + '_facebook');
                    expect(dummySocialButtons.className).not.toContain(styleId + '_google');
                    var socialLogin = comp.getSocialLoginSkinParts('mock_mode', 'do', {});
                    expect(socialLogin.socialHolder.src).toBe('//test-localhost/view/social/frame/8bf9f82c-51ba-4ede-a31c-d84ec021d869?mode=mock_mode&lang=do&vendors=facebook');
                });

                it('should have only google login button when enabled', function () {
                    mockSmSettings({
                        socialLoginGoogleEnabled: true,
                        socialLoginFacebookEnabled: true
                    });
                    var dummySocialButtons = comp.getSocialLoginSkinParts(null, null, {}).dummySocialButtons;
                    expect(dummySocialButtons.className).toContain(styleId + '_facebook');
                    expect(dummySocialButtons.className).toContain(styleId + '_google');
                    var socialLogin = comp.getSocialLoginSkinParts('mock_mode', 'do', {});
                    expect(socialLogin.socialHolder.src).toBe('//test-localhost/view/social/frame/8bf9f82c-51ba-4ede-a31c-d84ec021d869?mode=mock_mode&lang=do&vendors=google,facebook');
                });

                it('should return true for isSocialLogin if both google and facebook enabled', function () {
                    mockSmSettings({
                        socialLoginGoogleEnabled: true,
                        socialLoginFacebookEnabled: true
                    });
                    expect(comp.isSocialLogin()).toBe(true);
                });

                it('should return true for isSocialLogin if only facebook enabled', function () {
                    mockSmSettings({
                        socialLoginGoogleEnabled: false,
                        socialLoginFacebookEnabled: true
                    });
                    expect(comp.isSocialLogin()).toBe(true);
                });

                it('should return true for isSocialLogin if only google enabled', function () {
                    mockSmSettings({
                        socialLoginGoogleEnabled: true,
                        socialLoginFacebookEnabled: false
                    });
                    expect(comp.isSocialLogin()).toBe(true);
                });

                it('should return false for isSocialLogin if google and facebook disabled', function () {
                    mockSmSettings({
                        socialLoginGoogleEnabled: false,
                        socialLoginFacebookEnabled: false
                    });
                    expect(comp.isSocialLogin()).toBe(false);
                });

                it('should return false for isSocialLogin if google and facebook not defined', function () {
                    mockSmSettings({});
                    expect(comp.isSocialLogin()).toBe(false);
                });
            });

        });
    });
});
