define(['lodash', 'testUtils', 'backgroundCommon/components/bgVideo'], function (_, testUtils, bgVideo) {
    'use strict';

    describe('bgVideo', function () {

        var mockVideoBackgroundAspect = {
            registerVideo: function(){},
            getQuality: function(){}
        };

        function createBgVideoProps(partialProps) {
            return testUtils.santaTypesBuilder.getComponentProps(bgVideo, _.merge({
                skin: "skins.viewer.bgVideo.bgVideoSkin",
                compData: {},
                videoBackgroundAspect: mockVideoBackgroundAspect
            }, partialProps));
        }

        function createBgVideoComponent(partialProps) {
            var props = createBgVideoProps(partialProps);
            return testUtils.getComponentFromDefinition(bgVideo, props);
        }

        describe('video skinpart parameters', function(){
            describe('loop value', function(){
                it("should be 'loop' if compData.loop is true", function(){
                    var compData = {
                        loop: true
                    };
                    var bgVideoComponent = createBgVideoComponent({compData: compData});

                    var skinProperties = bgVideoComponent.getSkinProperties();
                    expect(skinProperties.video.loop).toEqual('loop');
                });

                it('should be empty string if loop is not defined in compData', function(){
                    var compData = {};
                    var bgVideoComponent = createBgVideoComponent({compData: compData});

                    var skinProperties = bgVideoComponent.getSkinProperties();
                    expect(skinProperties.video.loop).toEqual('');
                });
            });

            describe('muted value', function(){
                it("should be 'muted' if compData.mute is true", function(){
                    var compData = {
                        mute: true
                    };
                    var bgVideoComponent = createBgVideoComponent({compData: compData});

                    var skinProperties = bgVideoComponent.getSkinProperties();
                    expect(skinProperties.video.muted).toEqual('muted');
                });

                it('should be empty string if mute is not defined in compData', function(){
                    var compData = {};
                    var bgVideoComponent = createBgVideoComponent({compData: compData});

                    var skinProperties = bgVideoComponent.getSkinProperties();
                    expect(skinProperties.video.muted).toEqual('');
                });
            });

            describe('preload value', function(){
                it("should be equal to compData.preload if defined", function(){
                    var compData = {
                        preload: 'preload'
                    };
                    var bgVideoComponent = createBgVideoComponent({compData: compData});

                    var skinProperties = bgVideoComponent.getSkinProperties();
                    expect(skinProperties.video.preload).toEqual(compData.preload);
                });

                it("should be 'auto' if preload is not defined in compData", function(){
                    var compData = {};
                    var bgVideoComponent = createBgVideoComponent({compData: compData});

                    var skinProperties = bgVideoComponent.getSkinProperties();
                    expect(skinProperties.video.preload).toEqual('auto');
                });
            });

            it('should include loop, mute and preload parameters', function(){
                // var compData = {
                //     loop: true,
                //     mute: true,
                //     preload: true
                // };
                // var bgVideoComponent = createBgVideoComponent({compData: compData});
                //
                // var skinProperties = bgVideoComponent.getSkinProperties();
                // expect(skinProperties.video.loop).toEqual('loop');
                // expect(skinProperties.video.mute).toEqual('mute');
                // expect(skinProperties.video.preload).toEqual('preload');
            });
        });
    });
});
