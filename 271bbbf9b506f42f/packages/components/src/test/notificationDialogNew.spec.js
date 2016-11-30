define([
    'lodash',
    'core',
    'react',
    'testUtils',
    'components/components/dialogs/notificationDialog/notificationDialog',
    'reactDOM'
],
    function(_, core, React, testUtils, notificationDialog, ReactDOM) {
    'use strict';

    function createComponent(props) {
        return testUtils.getComponentFromDefinition(notificationDialog, props);
    }

    describe('notificationDialog component', function() {
        var props = {};
        var comp;
        beforeEach(function() {
            spyOn(core.compMixins.animationsMixin, 'sequence').and.callFake(testUtils.mockSequence);

            props = testUtils.mockFactory.mockPropsWithSiteDataAndFont();
            _.assign(props, {
                skin: 'wysiwyg.viewer.skins.dialogs.notificationDialogSkinNew',
                language: 'en',
                onCloseDialogCallback: jasmine.createSpy('onCloseDialogCallback'),
                title: 'TITLE',
                description: 'DESCRIPTION',
                buttonText: 'BUTTON_TEXT'
            });
            props.structure.componentType = 'wysiwyg.viewer.components.dialogs.NotificationDialog';

            comp = createComponent(props);
        });

        describe('getSkinProperties', function(){
            it('should return the correct skin properties', function(){
                var skinProperties = comp.getSkinProperties();

                expect(skinProperties.dialogTitle.children).toEqual("TITLE");
                expect(skinProperties.dialogDescription.children).toEqual("DESCRIPTION");
                expect(skinProperties.okButton.children).toEqual("BUTTON_TEXT");
                expect(skinProperties.blockingLayer).toBeDefined();
                expect(skinProperties.xButton).toBeDefined();
            });
        });

        describe('GUI', function(){
            it('should activate onCloseDialogCallback when the ok button is clicked', function(){
                var buttonNode = ReactDOM.findDOMNode(comp.refs.okButton);
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
