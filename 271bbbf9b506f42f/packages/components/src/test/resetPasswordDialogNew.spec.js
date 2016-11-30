define([
    'core',
    'react',
    'lodash',
    'testUtils',
    'components/components/dialogs/siteMemberDialogs/resetPasswordDialog/resetPasswordDialog',
    'reactDOM'
],
    function(core, React, _, testUtils, resetPasswordDialog, ReactDOM) {
    'use strict';

    function createComponent(props) {
        return testUtils.getComponentFromDefinition(resetPasswordDialog, props);
    }

    describe('resetPasswordDialog component', function() {
        var props = {};
        var comp;
        var submitButtonNode;
        beforeEach(function() {
            spyOn(core.compMixins.animationsMixin, 'sequence').and.callFake(testUtils.mockSequence);
            testUtils.experimentHelper.openExperiments('newLoginScreens');

            var siteData = testUtils.mockFactory.mockSiteData();
            spyOn(siteData, 'getFont').and.returnValue("normal normal normal 14px/1.4em Arial {color_15}");
            siteData.currentUrl.query.forgotPasswordToken = 'someToken';

            props = testUtils.mockFactory.mockProps(siteData);
            _.assign(props, {
                skin: 'wysiwyg.viewer.skins.dialogs.siteMembersDialogs.resetPasswordDialogSkinNew',
                language: 'en',
                onSubmitCallback: jasmine.createSpy('onSubmitCallback'),
                onCloseDialogCallback: jasmine.createSpy('onCloseDialogCallback'),
                structure: {componentType: 'wysiwyg.viewer.components.dialogs.siteMemberDialogs.RequestPasswordResetDialog'}
            });
            props.structure.componentType = 'wysiwyg.viewer.components.dialogs.siteMemberDialogs.ResetPasswordDialog';

            comp = createComponent(props);
            submitButtonNode = ReactDOM.findDOMNode(comp.refs.okButton);
        });

        describe('input validations', function(){

            describe('validation of passwordInput field', function(){
                it('should fail validation if password length is less than 4', function(){
                    comp.refs.passwordInput.setState({value: '123'});
                    React.addons.TestUtils.Simulate.click(submitButtonNode);
                    expect(comp.refs.passwordInput.isValid()).toBeFalsy();
                });

                it('should fail validation if password length is more than 15', function(){
                    comp.refs.passwordInput.setState({value: '1234567890123456'});
                    React.addons.TestUtils.Simulate.click(submitButtonNode);
                    expect(comp.refs.passwordInput.isValid()).toBeFalsy();
                });

                it('should pass validation if password length between 4 and 15 (length=15)', function(){
                    comp.refs.passwordInput.setState({value: '123456789012345'});
                    React.addons.TestUtils.Simulate.click(submitButtonNode);
                    expect(comp.refs.passwordInput.isValid()).toBeTruthy();
                });

                it('should pass validation if password length between 4 and 15 (length=4)', function(){
                    comp.refs.passwordInput.setState({value: '1234'});
                    React.addons.TestUtils.Simulate.click(submitButtonNode);
                    expect(comp.refs.passwordInput.isValid()).toBeTruthy();
                });

            });

            describe('validation of retypePasswordInput field', function(){
                it('should fail validation if password length is less than 4', function(){
                    comp.refs.retypePasswordInput.setState({value: '123'});
                    React.addons.TestUtils.Simulate.click(submitButtonNode);
                    expect(comp.refs.retypePasswordInput.isValid()).toBeFalsy();
                });

                it('should fail validation if password length is more than 15', function(){
                    comp.refs.retypePasswordInput.setState({value: '1234567890123456'});
                    React.addons.TestUtils.Simulate.click(submitButtonNode);
                    expect(comp.refs.retypePasswordInput.isValid()).toBeFalsy();
                });

                it('should pass validation if password length between 4 and 15 (length=15)', function(){
                    comp.refs.retypePasswordInput.setState({value: '123456789012345'});
                    React.addons.TestUtils.Simulate.click(submitButtonNode);
                    expect(comp.refs.retypePasswordInput.isValid()).toBeTruthy();
                });

                it('should pass validation if password length between 4 and 15 (length=4)', function(){
                    comp.refs.retypePasswordInput.setState({value: '1234'});
                    React.addons.TestUtils.Simulate.click(submitButtonNode);
                    expect(comp.refs.retypePasswordInput.isValid()).toBeTruthy();
                });

            });

            describe('validation that both input fields have the same value', function(){
                it('should fail validation if values not equal', function(){
                    comp.refs.passwordInput.setState({value: '1234'});
                    comp.refs.retypePasswordInput.setState({value: '12345'});
                    React.addons.TestUtils.Simulate.click(submitButtonNode);
                    expect(comp.state.errMsg).toBe('Passwords are not the same');
                });

                it('should pass validation if values equal', function(){
                    comp.refs.passwordInput.setState({value: '1234'});
                    comp.refs.retypePasswordInput.setState({value: '1234'});
                    React.addons.TestUtils.Simulate.click(submitButtonNode);
                    expect(comp.state.errMsg).toBe('');
                });

            });
        });

        describe('getDataToSubmit', function(){
            it('should return an object with a "password" property', function(){
                comp.refs.passwordInput.setState({value: '1234'});
                var data = comp.getDataToSubmit();
                expect(data).toEqual({'newPassword': '1234', forgotPasswordToken: 'someToken'});
            });
        });

        describe('getSkinProperties', function(){
            it('should return the correct skin properties', function(){
                var skinProperties = comp.getSkinProperties();
                expect(skinProperties.title.children).toEqual("Reset Password");
                expect(skinProperties.subtitle.children).toEqual("Enter your new password below");
                expect(skinProperties.okButton.children.props.structure.componentType).toEqual('wysiwyg.viewer.components.SiteButton');
                expect(skinProperties.errMsg.children).toEqual("");
                expect(skinProperties.xButton).not.toBeDefined();
            });
        });

        describe('GUI', function(){
            it('should activate onSubmitCallback when the button is clicked, and the input is valid', function(){
                comp.refs.passwordInput.setState({value: '1234'});
                comp.refs.retypePasswordInput.setState({value: '1234'});
                var buttonNode = ReactDOM.findDOMNode(comp.refs.okButton);
                React.addons.TestUtils.Simulate.click(buttonNode);
                expect(comp.props.onSubmitCallback).toHaveBeenCalled();
            });

            it('should not activate onSubmitCallback when the button is clicked, but the input is invalid', function(){
                comp.refs.passwordInput.setState({value: '1234'});
                comp.refs.retypePasswordInput.setState({value: '12345'});
                var buttonNode = ReactDOM.findDOMNode(comp.refs.okButton);
                React.addons.TestUtils.Simulate.click(buttonNode);
                expect(comp.props.onSubmitCallback).not.toHaveBeenCalled();
            });

        });


    });
});
