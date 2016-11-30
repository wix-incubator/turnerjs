//wysiwyg.viewer.components.VKShareButton
define(['testUtils', 'components/components/youTubeSubscribeButton/youTubeSubscribeButton'], function (testUtils, youTubeBtn) {
    'use strict';
    describe('youTubeSubscribeButton tests', function () {


        function getComponent(props) {
            return testUtils.getComponentFromDefinition(youTubeBtn, props);
        }

        beforeEach(function () {
            var props = testUtils.mockFactory.mockProps();
            this.props = props.setCompProp({
                layout: "full",
                theme: "light"
            });
            props.setCompData({
                youtubeChannelId: "wix"
            });
            props.siteData.browser = {
                ie: false
            };
            props.siteData.santaBase = "mockSantaBase";
            props.setNodeStyle({
                height: 48,
                width: 200
            });
            props.structure.componentType = 'wysiwyg.common.components.youtubesubscribebutton.viewer.YouTubeSubscribeButton';
        });

        describe('youTubeSubscribeButton getInitial State', function () {
            it("intial State Defaults should be defined on Initial State - sizes smaller than defaults", function () {
                var youTubeSubscribeComp = getComponent(this.props);
                var initialStateObj = youTubeSubscribeComp.getInitialState();
                expect(initialStateObj.$layout).toEqual('full');
                expect(initialStateObj.$hoverMode).toEqual('nonHover');
                expect(initialStateObj.iframeWrapperSizes).toEqual({width: 212, height: 55});
            });


            it("intial State Defaults should be defined on Initial State - sizes larget from defaults", function () {
                var props = testUtils.mockFactory.mockProps();
                this.props = props.setCompProp({
                    layout: "default",
                    theme: "light"
                });
                props.siteData.browser = {
                    ie: false
                };
                props.setCompData({
                    youtubeChannelId: "wix"
                });
                props.setNodeStyle({
                    height: 500,
                    width: 500
                });
                props.structure.componentType = 'wysiwyg.common.components.youtubesubscribebutton.viewer.YouTubeSubscribeButton';

                var youTubeSubscribeComp = getComponent(this.props);
                var initialStateObj = youTubeSubscribeComp.getInitialState();
                expect(initialStateObj.$layout).toEqual('default');
                expect(initialStateObj.$hoverMode).toEqual('nonHover');
                expect(initialStateObj.iframeWrapperSizes).toEqual({width: 500, height: 500});
            });
        });

        describe('youTubeSubscribeButton getIFrameSrc', function () {
            it("should build iframe source based on the data and props params", function () {
                var youTubeSubscribeComp = getComponent(this.props);
                var url = youTubeSubscribeComp.getIFrameSrc();
                expect(url).toEqual("mockSantaBase/static/external/youtubeSubscribeButton.html?channel=wix&layout=full&theme=light");
            });
        });

        describe('youTubeSubscribeButton onMouseEnter', function () {
            it("should change the state and add the tooltip size", function () {
                var youTubeSubscribeComp = getComponent(this.props);
                youTubeSubscribeComp.onMouseEnter();
                var mouseHoverState = youTubeSubscribeComp.state;
                expect(mouseHoverState.$layout).toEqual('full');
                expect(mouseHoverState.$hoverMode).toEqual('hoverMode');
                expect(mouseHoverState.iframeWrapperSizes).toEqual({width: 362, height: 115});
            });
        });

        describe('youTubeSubscribeButton onMouseOut', function () {
            it("should change the state and return the iframe Wrapper size to its original sizes", function () {
                var youTubeSubscribeComp = getComponent(this.props);
                youTubeSubscribeComp.onMouseOut();
                var mouseOutState = youTubeSubscribeComp.state;
                expect(mouseOutState.$layout).toEqual('full');
                expect(mouseOutState.$hoverMode).toEqual('nonHover');
                expect(mouseOutState.iframeWrapperSizes).toEqual({width: 212, height: 55});
            });
        });

    });
});
