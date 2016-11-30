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
            spyOn(core.compMixins.animationsMixin, 'sequence').and.callFake(testUtils.mockSequence);

            props = testUtils.mockFactory.mockProps();
            _.assign(props, {
                skin: 'wysiwyg.viewer.skins.dialogs.siteMembersDialogs.requestPasswordResetDialogSkin',
                language: 'en',
                onSubmitCallback: jasmine.createSpy('onSubmitCallback'),
                onCloseDialogCallback: jasmine.createSpy('onCloseDialogCallback'),
                onSwitchDialogLinkClick: jasmine.createSpy('onSwitchDialogLinkClick')
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
                expect(skinProperties.submitButton.children).toEqual("GO");
                expect(skinProperties.cancel.children).toEqual("Cancel");
                expect(skinProperties.switchDialogLink.children).toEqual("Back to Login");
                expect(skinProperties.errMsg.children).toEqual("");
                expect(skinProperties.email.children.props.label).toEqual('Please enter your email address');
                expect(skinProperties.blockingLayer).toBeDefined();
                expect(skinProperties.xButton).toBeDefined();
            });
        });

        describe('GUI', function(){
            it('should activate onSwitchDialogLinkClick when the link is clicked', function(){
                var buttonNode = ReactDOM.findDOMNode(comp.refs.switchDialogLink);
                React.addons.TestUtils.Simulate.click(buttonNode);
                expect(comp.props.onSwitchDialogLinkClick).toHaveBeenCalled();
            });

            it('should activate onSubmitCallback when the button is clicked, and the input is valid', function(){
                comp.refs.emailInput.setState({value: 'a@a.com'});
                var buttonNode = ReactDOM.findDOMNode(comp.refs.submitButton);
                React.addons.TestUtils.Simulate.click(buttonNode);
                expect(comp.props.onSubmitCallback).toHaveBeenCalled();
            });

            it('should not activate onSubmitCallback when the button is clicked, but the input is invalid', function(){
                comp.refs.emailInput.setState({value: 'a@a'});
                var buttonNode = ReactDOM.findDOMNode(comp.refs.submitButton);
                React.addons.TestUtils.Simulate.click(buttonNode);
                expect(comp.props.onSubmitCallback).not.toHaveBeenCalled();
            });

            it('should activate onCloseDialogCallback when the cancel button is clicked', function(){
                var buttonNode = ReactDOM.findDOMNode(comp.refs.cancel);
                React.addons.TestUtils.Simulate.click(buttonNode);
                expect(comp.props.onCloseDialogCallback).toHaveBeenCalled();
            });

            it('should activate onCloseDialogCallback when the xButton is clicked', function(){
                var buttonNode = ReactDOM.findDOMNode(comp.refs.xButton);
                React.addons.TestUtils.Simulate.click(buttonNode);
                expect(comp.props.onCloseDialogCallback).toHaveBeenCalled();
            });

            it('should activate onCloseDialogCallback when the blockingLayer is clicked', function(){
                var buttonNode = ReactDOM.findDOMNode(comp.refs.blockingLayer);
                React.addons.TestUtils.Simulate.click(buttonNode);
                expect(comp.props.onCloseDialogCallback).toHaveBeenCalled();
            });

        });


    });
});
