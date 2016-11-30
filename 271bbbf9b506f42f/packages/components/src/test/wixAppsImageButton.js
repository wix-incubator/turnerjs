define([
    'lodash',
    'testUtils',
    'react',
    'components/components/wixAppsImageButton/wixAppsImageButton',
    'reactDOM'
],
    function(_, /** testUtils */testUtils, React, wixAppsImageButton, ReactDOM) {
    'use strict';
    describe('ImageButton component', function () {
        beforeEach(function(){
            this.props = testUtils.mockFactory.mockProps().setCompData({
                url: "image123", width: 20, height: 30, title: 'title123'
            }).setCompProp({});
            this.props.structure.componentType = 'wysiwyg.common.components.imagebutton.viewer.ImageButton';
        });
        it('Create a non sprite button', function () {
            var imageButtonComp = testUtils.getComponentFromDefinition(wixAppsImageButton, this.props);

            var skinProperties = imageButtonComp.getSkinProperties();

            expect(skinProperties[""].style).toEqual({
                "width": 20,
                "height": 30
            });
            expect(skinProperties[""].children.type).toEqual('img');
            expect(skinProperties[""].children.props).toEqual({
                src: "image123",
                title: 'title123',
                "width": 20,
                "height": 30
            });
        });

        it('Create a sprite button', function () {
            this.props.setCompProp({isSprite: "true", startPositionX: "-120", startPositionY: "-50"});

            var imageButtonComp = testUtils.getComponentFromDefinition(wixAppsImageButton, this.props);

            var skinProperties = imageButtonComp.getSkinProperties();

            expect(skinProperties[""].style).toEqual({
                "width": 20,
                "height": 30
            });
            expect(skinProperties[""].children.type).toEqual('span');
            expect(skinProperties[""].children.props.style).toEqual({
                "backgroundImage": "url(image123)",
                "backgroundRepeat": "no-repeat",
                "backgroundPosition": "-120px -50px",
                "width": 20,
                "height": 30,
                "display": "inline-block"
            });
        });

        describe('Create a horizontal sprite button, and how mouse events change the image', function () {
            beforeEach(function(){
                this.props.setCompProp({isSprite: "true", spriteDirection: "horizontal", startPositionX: "-120", startPositionY: "-50"});
            });

            it('mouseOver', function () {
                var imageButtonComp = testUtils.getComponentFromDefinition(wixAppsImageButton, this.props);

                var domNode = ReactDOM.findDOMNode(imageButtonComp);

                React.addons.TestUtils.Simulate.mouseOver(domNode);

                var skinProperties = imageButtonComp.getSkinProperties();

                expect(skinProperties[""].children.props.style.backgroundPosition).toEqual("-140px -50px");

            });

            it('mouseDown', function () {
                var imageButtonComp = testUtils.getComponentFromDefinition(wixAppsImageButton, this.props);

                var domNode = ReactDOM.findDOMNode(imageButtonComp);

                React.addons.TestUtils.Simulate.mouseDown(domNode);

                var skinProperties = imageButtonComp.getSkinProperties();

                expect(skinProperties[""].children.props.style.backgroundPosition).toEqual("-160px -50px");
            });

            it('mouseUp', function () {
                var imageButtonComp = testUtils.getComponentFromDefinition(wixAppsImageButton, this.props);

                var domNode = ReactDOM.findDOMNode(imageButtonComp);

                React.addons.TestUtils.Simulate.mouseUp(domNode);

                var skinProperties = imageButtonComp.getSkinProperties();

                expect(skinProperties[""].children.props.style.backgroundPosition).toEqual("-140px -50px");
            });

            it('mouseOut', function () {
                var imageButtonComp = testUtils.getComponentFromDefinition(wixAppsImageButton, this.props);

                var domNode = ReactDOM.findDOMNode(imageButtonComp);

                React.addons.TestUtils.Simulate.mouseOut(domNode);

                var skinProperties = imageButtonComp.getSkinProperties();

                expect(skinProperties[""].children.props.style.backgroundPosition).toEqual("-120px -50px");
            });
        });

        describe('Create a sprite button with "none" direction, and how mouse events dont change the image', function () {
            beforeEach(function(){
                this.props.setCompProp({isSprite: "true", spriteDirection: "none", startPositionX: "-120", startPositionY: "-50"});
            });

            it('mouseOver', function () {
                var imageButtonComp = testUtils.getComponentFromDefinition(wixAppsImageButton, this.props);

                var domNode = ReactDOM.findDOMNode(imageButtonComp);

                React.addons.TestUtils.Simulate.mouseOver(domNode);

                var skinProperties = imageButtonComp.getSkinProperties();

                expect(skinProperties[""].children.props.style.backgroundPosition).toEqual("-120px -50px");

            });

            it('mouseDown', function () {
                var imageButtonComp = testUtils.getComponentFromDefinition(wixAppsImageButton, this.props);

                var domNode = ReactDOM.findDOMNode(imageButtonComp);

                React.addons.TestUtils.Simulate.mouseDown(domNode);

                var skinProperties = imageButtonComp.getSkinProperties();

                expect(skinProperties[""].children.props.style.backgroundPosition).toEqual("-120px -50px");
            });

            it('mouseUp', function () {
                var imageButtonComp = testUtils.getComponentFromDefinition(wixAppsImageButton, this.props);

                var domNode = ReactDOM.findDOMNode(imageButtonComp);

                React.addons.TestUtils.Simulate.mouseUp(domNode);

                var skinProperties = imageButtonComp.getSkinProperties();

                expect(skinProperties[""].children.props.style.backgroundPosition).toEqual("-120px -50px");
            });

            it('mouseOut', function () {
                var imageButtonComp = testUtils.getComponentFromDefinition(wixAppsImageButton, this.props);

                var domNode = ReactDOM.findDOMNode(imageButtonComp);

                React.addons.TestUtils.Simulate.mouseOut(domNode);

                var skinProperties = imageButtonComp.getSkinProperties();

                expect(skinProperties[""].children.props.style.backgroundPosition).toEqual("-120px -50px");
            });
        });

        describe('Create a non-horizontal sprite button, and how mouse events change the image', function () {
            beforeEach(function(){
                this.props.setCompProp({isSprite: "true", startPositionX: "-120", startPositionY: "-50"});
            });

            it('mouseOver', function () {
                var imageButtonComp = testUtils.getComponentFromDefinition(wixAppsImageButton, this.props);

                var domNode = ReactDOM.findDOMNode(imageButtonComp);

                React.addons.TestUtils.Simulate.mouseOver(domNode);

                var skinProperties = imageButtonComp.getSkinProperties();

                expect(skinProperties[""].children.props.style.backgroundPosition).toEqual("-120px -80px");

            });

            it('mouseDown', function () {
                var imageButtonComp = testUtils.getComponentFromDefinition(wixAppsImageButton, this.props);

                var domNode = ReactDOM.findDOMNode(imageButtonComp);

                React.addons.TestUtils.Simulate.mouseDown(domNode);

                var skinProperties = imageButtonComp.getSkinProperties();

                expect(skinProperties[""].children.props.style.backgroundPosition).toEqual("-120px -110px");
            });

            it('mouseUp', function () {
                var imageButtonComp = testUtils.getComponentFromDefinition(wixAppsImageButton, this.props);

                var domNode = ReactDOM.findDOMNode(imageButtonComp);

                React.addons.TestUtils.Simulate.mouseUp(domNode);

                var skinProperties = imageButtonComp.getSkinProperties();

                expect(skinProperties[""].children.props.style.backgroundPosition).toEqual("-120px -80px");
            });

            it('mouseOut', function () {
                var imageButtonComp = testUtils.getComponentFromDefinition(wixAppsImageButton, this.props);

                var domNode = ReactDOM.findDOMNode(imageButtonComp);

                React.addons.TestUtils.Simulate.mouseOut(domNode);

                var skinProperties = imageButtonComp.getSkinProperties();

                expect(skinProperties[""].children.props.style.backgroundPosition).toEqual("-120px -50px");
            });
        });
    });
});
