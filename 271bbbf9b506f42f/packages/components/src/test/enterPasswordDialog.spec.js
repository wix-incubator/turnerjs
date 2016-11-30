define([
    'react',
    'testUtils',
    'lodash',
    'utils',
    'definition!components/components/dialogs/enterPasswordDialog/enterPasswordDialog',
    'definition!components/components/dialogs/dialogMixin',
    'components/components/inputWithValidation/inputWithValidation',
    'siteUtils',
    'components/components/dialogs/translations/dialogMixinTranslations',
    'reactDOM',
    'experiment'
],
    function(
        React,
        /** testUtils */ testUtils,
        _,
        utils,
        enterPasswordDialogDef,
        dialogMixinDef,
        inputWithValidation,
        siteUtils,
        langKeys,
        ReactDOM,
        experiment ) {
        'use strict';

        describe("EnterPasswordDialog tests", function(){

            var siteData, dialogMixin, compDef;
            var correctPassword = "12345";
            var wrongPassword = "wrong password";
            var props = {};
            function createComponent(properties) {
              return testUtils.getComponentFromDefinition(compDef, properties);
            }

            beforeEach(function() {
                siteData = testUtils.mockFactory.mockSiteData();
                _.assign(siteData, {
                    getStaticMediaUrl: function() {return 'mockUrl';},
                    getMediaFullStaticUrl: function(image) {return 'mockUrl/' + image;},
                    getStaticThemeUrlWeb: function() {return 'mockUrl';},
                    isPremiumUser: function() {return true;}
                });
                siteData.publicModel.favicon = 'faviconMockUrl';
                dialogMixin = dialogMixinDef(_, utils, testUtils.mockFactory.getFakeCoreWithRealSkinBased(), langKeys, null, experiment);
                compDef = enterPasswordDialogDef(testUtils.mockFactory.getFakeCoreWithRealSkinBased(), dialogMixin, _, experiment);
                siteUtils.compFactory.register('wysiwyg.components.viewer.inputs.InputWithValidation', inputWithValidation);

                props = testUtils.mockFactory.mockProps(siteData)
                    .setSkin('wysiwyg.viewer.skins.dialogs.enterPasswordDialogSkin');

                _.assign(props, {
                    digestedPassword: utils.hashUtils.SHA256.b64_sha256(correctPassword),
                    language: 'en',
                    onSubmitCallback: jasmine.createSpy('onSubmitCallback'),
                    onCloseDialogCallback: jasmine.createSpy('onCloseDialogCallback'),
                    structure: {
                        componentType: 'wysiwyg.viewer.components.dialogs.EnterPasswordDialog'
                    }
                });
            });

            describe('enterPasswordDialog component', function() {

                describe("initial state", function(){
                    it("should have canBeClosed state set", function(){
                        var comp = createComponent(props);
                        var initialState = comp.getInitialState();
                        expect(initialState.$canBeClosed).toBe('canBeClosed');
                    });
                    it("should not have cancel and xButton skin properties if props.notClosable is set", function () {
                        props.notClosable = true;
                        var comp = createComponent(props);
                        var skinPropertiesKeys = _.keys(comp.getSkinProperties());
                        expect(skinPropertiesKeys).not.toContainAny(['cancel', 'xButton']);
                    });
                    it("blocking layer should not have an onClick if props.notClosable is set", function(){
                        props.notClosable = true;
                        var comp = createComponent(props);
                        var skinProperties = comp.getSkinProperties();
                        expect(skinProperties.blockingLayer.onClick).not.toBeDefined();
                    });
                });

                describe('Authorization', function() {
                    xit('enter keypress submits', function(done) {
                        var comp = createComponent(props);
                        var passwordInputComp = comp.refs[comp.passwordInputRef];
                        var inputComp = ReactDOM.findDOMNode(
                            React.addons.TestUtils.findRenderedDOMComponentWithTag(passwordInputComp, 'input')
                        );

                        passwordInputComp.setState({value: correctPassword}, function () {
                            React.addons.TestUtils.Simulate.keyPress(inputComp, {key: 'Enter'});
                            expect(comp.props.onSubmitCallback).toHaveBeenCalledWith(jasmine.any(Object), comp);
                            done();
                        });
                    });

                    it("should accept any password except a blank one", function() {
                        var comp = createComponent(props);

                        var blankPassword = "";
                        var errorMessage = comp._validatePassword(blankPassword);
                        expect(errorMessage).not.toBe(false);

                        var notBlankPassword = "123";
                        errorMessage = comp._validatePassword(notBlankPassword);
                        expect(errorMessage).toBe(false);
                    });
                });

                xdescribe('Cancel Dialog', function() {
                    xit('press cancel button', function() {
                        var comp = createComponent(props);
                        var cancelButtonNode = ReactDOM.findDOMNode(comp.refs.cancel);

                        React.addons.TestUtils.Simulate.click(cancelButtonNode);
                        expect(comp.props.onCloseDialogCallback).toHaveBeenCalledWith(comp);
                    });

                    xit('press xButton', function() {
                        var comp = createComponent(props);
                        var xButtonNode = ReactDOM.findDOMNode(comp.refs.xButton);

                        React.addons.TestUtils.Simulate.click(xButtonNode);

                        expect(comp.props.onCloseDialogCallback).toHaveBeenCalledWith(comp);
                    });

                    xit('click on blocking layer closes dialog', function() {
                        var comp = createComponent(props);
                        var blockingLayerNode = ReactDOM.findDOMNode(comp.refs.blockingLayer);

                        React.addons.TestUtils.Simulate.click(blockingLayerNode);

                        expect(comp.props.onCloseDialogCallback).toHaveBeenCalledWith(comp);
                    });
                });

                describe('favicon', function() {
                    it('user is premuim', function() {
                        var comp = createComponent(props);

                        expect(ReactDOM.findDOMNode(comp.refs.favIconImg).src.indexOf('mockUrl/faviconMockUrl')).not.toEqual(-1);
                        expect(ReactDOM.findDOMNode(comp.refs.favIconLink).href).toEqual('');
                    });

                    it('user is premuim but no favicon url provided', function() {
                        props.siteData.publicModel.favicon = null;
                        var comp = createComponent(props);

                        expect(ReactDOM.findDOMNode(comp.refs.favIconImg).src.indexOf('mockUrl/viewer/blank-favicon.png')).not.toEqual(-1);
                        expect(ReactDOM.findDOMNode(comp.refs.favIconLink).href).toEqual('');
                    });

                    it('user not premium', function() {
                        props.siteData.isPremiumUser = function() {return false;};
                        var comp = createComponent(props);

                        expect(ReactDOM.findDOMNode(comp.refs.favIconImg).src).toEqual('http://www.wix.com/favicon.ico');
                        expect(ReactDOM.findDOMNode(comp.refs.favIconImg).alt).toEqual('Administrator Login');
                        expect(ReactDOM.findDOMNode(comp.refs.favIconLink).href).toEqual('http://www.wix.com/');
                    });
                });

                xdescribe('no expected password provided', function() {
                    beforeEach(function() {
                        delete props.digestedPassword;
                    });

                    it('external validation (user API) succeeds', function() {
                        var comp = createComponent(props);
                        var submitButtonNode = ReactDOM.findDOMNode(comp.refs.submitButton);

                        comp.refs[comp.passwordInputRef].setState({value: correctPassword});
                        React.addons.TestUtils.Simulate.click(submitButtonNode);

                        expect(comp.props.onSubmitCallback).toHaveBeenCalledWith({password: correctPassword}, comp);
                    });

                    it('external validation (user API) fails', function() {
                        var comp = createComponent(props);
                        var submitButtonNode = ReactDOM.findDOMNode(comp.refs.submitButton);

                        comp.refs[comp.passwordInputRef].setState({value: wrongPassword});
                        React.addons.TestUtils.Simulate.click(submitButtonNode);

                        expect(comp.props.onSubmitCallback).toHaveBeenCalledWith({password: wrongPassword}, comp);

                        comp.setErrorMessage('PasswordLogin_Wrong_Password');

                        expect(ReactDOM.findDOMNode(comp.refs.errMsg).textContent).toEqual(comp.getText(comp.props.language, 'PasswordLogin_Wrong_Password'));
                    });
                });

                describe('skin properties translations', function () {

                    it('should use proper translation keys for new skin', function () {
                        testUtils.experimentHelper.openExperiments('newLoginScreens');
                        var mockProps = testUtils.mockFactory.mockPropsWithSiteDataAndFont();
                        var language = 'ru';
                        _.assign(mockProps, {
                            skin: 'wysiwyg.viewer.skins.dialogs.enterPasswordDialogSkinNew',
                            language: language,
                            structure: {
                                componentType: 'wysiwyg.viewer.components.dialogs.EnterPasswordDialog'
                            }
                        });
                        var translations = langKeys[language];
                        var skinProps = createComponent(mockProps).getSkinProperties();
                        /* eslint-disable dot-notation */
                        expect(skinProps.title.children).toBe(translations['dialogMixinTranslations_GUEST_LOGIN_TITLE']);
                        expect(skinProps.subtitle.children).toBe(translations['dialogMixinTranslations_GUEST_LOGIN_SUBTITLE']);
                        expect(skinProps.okButton.children.props.compData.label).toBe(translations['SMRegister_GO']);
                        expect(skinProps.password.children.props.placeholder).toBe(translations['PasswordLogin_Password']);
                        /* eslint-enabled dot-notation */
                    });

                });
            });
        });
    });
