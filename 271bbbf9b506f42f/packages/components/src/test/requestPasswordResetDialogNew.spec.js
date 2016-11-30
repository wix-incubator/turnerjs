define([
    'lodash',
    'react',
    'testUtils',
    'core',
    'components/components/dialogs/siteMemberDialogs/requestPasswordResetDialog/requestPasswordResetDialog',
    'reactDOM'
],
    function(_, React, testUtils, core, requestPasswordResetDialog, ReactDOM) {
    'use strict';

    function createComponent(props) {
        return testUtils.getComponentFromDefinition(requestPasswordResetDialog, props);
    }

    describe('requestPasswordResetDialog component', function() {
        var props = {};
        var comp;
        beforeEach(function() {
            testUtils.experimentHelper.openExperiments('newLoginScreens');
            spyOn(core.compMixins.animationsMixin, 'sequence').and.callFake(testUtils.mockSequence);

            props = testUtils.mockFactory.mockPropsWithSiteDataAndFont();
            _.assign(props, {
                skin: 'wysiwyg.viewer.skins.dialogs.siteMembersDialogs.requestPasswordResetDialogSkinNew',
                language: 'en',
                onSubmitCallback: jasmine.createSpy('onSubmitCallback'),
                onCloseDialogCallback: jasmine.createSpy('onCloseDialogCallback'),
                onSwitchDialogLinkClick: jasmine.createSpy('onSwitchDialogLinkClick'),
                structure: {componentType: 'wysiwyg.viewer.components.dialogs.siteMemberDialogs.RequestPasswordResetDialog'}
            });
            props.structure.componentType = 'wysiwyg.viewer.components.dialogs.siteMemberDialogs.RequestPasswordResetDialog';

            comp = createComponent(props);
        });

        describe('validateBeforeSubmit', function(){

            it('should fail when email is not well formatted', function(){
                comp.refs.emailInput.setState({value: 'a@'});
                expect(comp.validateBeforeSubmit()).toBeFalsy();
            });

            it('should pass when email is well formatted', function(){
                comp.refs.emailInput.setState({value: 'a@a.com'});
                expect(comp.validateBeforeSubmit()).toBeTruthy();
            });

        });

        describe('getDataToSubmit', function(){
            it('should return an object with a "email" property', function(){
                comp.refs.emailInput.setState({value: 'a@a.com'});
                var data = comp.getDataToSubmit();
                expect(data).toEqual({'email': 'a@a.com'});
            });
        });

        describe('getSkinProperties', function(){
            it('should return the correct skin properties', function(){
                var skinProperties = comp.getSkinProperties();
                expect(skinProperties.title.children).toEqual("Reset Password");
                expect(skinProperties.okButton.children.props.structure.componentType).toEqual('wysiwyg.viewer.components.SiteButton');
                expect(skinProperties.cancel.children).toEqual("Cancel");
                expect(skinProperties.switchDialogLink.children).toEqual("Back to Login");
                expect(skinProperties.errMsg.children).toEqual("");
                expect(skinProperties.email.children.props.label).toEqual('Please enter your email address');
                expect(skinProperties.blockingLayer).toBeDefined();
                expect(skinProperties.xButton).toBeDefined();
            });
        });

        describe('GUI', function(){
            it('should activate onSubmitCallback when the button is clicked, and the input is valid', function(){
                comp.refs.emailInput.setState({value: 'a@a.com'});
                var buttonNode = ReactDOM.findDOMNode(comp.refs.okButton);
                React.addons.TestUtils.Simulate.click(buttonNode);
                expect(comp.props.onSubmitCallback).toHaveBeenCalled();
            });

            it('should not activate onSubmitCallback when the button is clicked, but the input is invalid', function(){
                comp.refs.emailInput.setState({value: 'a@a'});
                var buttonNode = ReactDOM.findDOMNode(comp.refs.okButton);
                React.addons.TestUtils.Simulate.click(buttonNode);
                expect(comp.props.onSubmitCallback).not.toHaveBeenCalled();
            });

            it('should activate onCloseDialogCallback when the xButton is clicked', function(){
                var buttonNode = ReactDOM.findDOMNode(comp.refs.xButton);
                React.addons.TestUtils.Simulate.click(buttonNode);
                expect(comp.props.onCloseDialogCallback).toHaveBeenCalled();
            });

            it('should not activate onCloseDialogCallback when the blockingLayer is clicked', function(){
                var buttonNode = ReactDOM.findDOMNode(comp.refs.blockingLayer);
                React.addons.TestUtils.Simulate.click(buttonNode);
                expect(comp.props.onCloseDialogCallback).not.toHaveBeenCalled();
            });

        });


    });
});
