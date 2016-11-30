define([
    'react',
    'reactDOM',
    'lodash',
    'core',
    'testUtils',
    'backgroundCommon/mixins/bgVideoMixin'
    ],
    function (React, reactDOM, _, core, testUtils, bgVideoMixin) {
    'use strict';

    describe("bgVideoMixin", function () {

        var compWithMixinDef = {
            displayName: 'compWithMixin',
            mixins: [core.compMixins.skinBasedComp, bgVideoMixin],
            getSkinProperties: function () { //eslint-disable-line react/display-name
                return {
                    '': {}
                };
            }
        };

        var compWidthMixinClass = React.createClass(compWithMixinDef);

        var mockVideoBackgroundAspect = {
            registerVideo: function(){},
            unregisterVideo: function(){},
            getQuality: function(){}
        };

        function createComponentsProps(partialProps) {
            return testUtils.santaTypesBuilder.getComponentProps(compWithMixinDef, _.merge({
                skin: "wysiwyg.viewer.skins.videoBackgroundSkin",
                key: "compWithMixin",
                compData: {},
                structureComponentId: 'siteBackground',
                refInParent: 'currentVideo',
                videoBackgroundAspect: mockVideoBackgroundAspect
            }, partialProps));
        }

        function createCompWithMixin(partialProps, container) {
            var props = createComponentsProps(partialProps);
            return testUtils.getComponentFromReactClass(compWidthMixinClass, props, container);
        }

        it('should set videoBackgroundAspect into this.videoBackgroundAspect', function(){
            var compWithMixin = createCompWithMixin({videoBackgroundAspect: mockVideoBackgroundAspect});

            expect(compWithMixin.videoBackgroundAspect).toEqual(mockVideoBackgroundAspect);
        });

        it('should set playbackRate on video instance based on compData.playbackSpeed', function(){
            var compData = {
                playbackSpeed: 10
            };

            var comp = createCompWithMixin({compData: compData});

            var videoNode = React.addons.TestUtils.findRenderedDOMComponentWithTag(comp, 'video');
            expect(videoNode.playbackRate).toEqual(compData.playbackSpeed);
        });

        it('should set default playbackRate on video instance if playbackSpeed is not defined in compData', function(){
            var compData = {};

            var comp = createCompWithMixin({compData: compData});

            var videoNode = React.addons.TestUtils.findRenderedDOMComponentWithTag(comp, 'video');
            var defaultPlaybackRate = 1;
            expect(videoNode.playbackRate).toEqual(defaultPlaybackRate);
        });

        describe('getVideoData', function(){
            it('should return compData', function(){
                var compData = {someData: 'someData'};
                var compWithMixin = createCompWithMixin({compData: compData});

                expect(compWithMixin.getVideoData()).toEqual(compData);
            });
        });

        it('should call VideoBackgroundAspect.registerVideo with the required data', function(){
            var refInParent = 'refInParent';
            var structureComponentId = 'structureComponentId';
            var compData = {someData: 'someData', autoplay: false};
            spyOn(mockVideoBackgroundAspect, 'registerVideo');

            var compWithMixin = createCompWithMixin({refInParent: refInParent, structureComponentId: structureComponentId, compData: compData});

            expect(mockVideoBackgroundAspect.registerVideo).toHaveBeenCalledWith(
                refInParent,
                structureComponentId,
                compData,
                compWithMixin.qualityReady,
                compWithMixin,
                compData.autoplay);
        });

        describe('componentWillUnmount', function(){
            it('should call VideoBackgroundAspect.unregisterVideo', function(){
                var refInParent = 'refInParent';
                spyOn(mockVideoBackgroundAspect, 'unregisterVideo');

                var container = window.document.createElement('div');
                createCompWithMixin({refInParent: refInParent}, container);

                reactDOM.render(React.createElement('div'), container);

                expect(mockVideoBackgroundAspect.unregisterVideo).toHaveBeenCalledWith(refInParent);
            });
        });

        describe('componentWillReceiveProps', function(){

            describe('on compData.playbackSpeed changed', function(){
                it('should set video playbackSpeed', function(){
                    var compData = {
                        playbackSpeed: 10
                    };
                    var newCompData = {
                        playbackSpeed: 20
                    };

                    var container = window.document.createElement('div');
                    var comp = createCompWithMixin({compData: compData}, container);
                    createCompWithMixin({compData: newCompData}, container);

                    var videoNode = React.addons.TestUtils.findRenderedDOMComponentWithTag(comp, 'video');
                    expect(videoNode.playbackRate).toEqual(newCompData.playbackSpeed);
                });
            });

            describe('on video source changed', function(){
                it('should register the new video', function(){
                    var compData = {
                        videoId: 'video-1'
                    };
                    var newCompData = {
                        videoId: 'video-2'
                    };
                    spyOn(mockVideoBackgroundAspect, 'registerVideo');
                    var container = window.document.createElement('div');

                    createCompWithMixin({compData: compData}, container);
                    var callsCountBeforeUpdate = mockVideoBackgroundAspect.registerVideo.calls.count();
                    createCompWithMixin({compData: newCompData}, container);
                    var callCountAfterUpdate = mockVideoBackgroundAspect.registerVideo.calls.count();

                    expect(callCountAfterUpdate).toBe(callsCountBeforeUpdate + 1);
                    var lastCallIndex = callCountAfterUpdate - 1;
                    expect(mockVideoBackgroundAspect.registerVideo.calls.argsFor(lastCallIndex)[2]).toEqual(newCompData);
                });
            });

            describe('when video source did not changed', function(){
                it('should not call registerVideo', function(){
                    var compData = {
                        videoId: 'video-1'
                    };
                    spyOn(mockVideoBackgroundAspect, 'registerVideo');
                    var container = window.document.createElement('div');

                    createCompWithMixin({compData: compData}, container);
                    var callsCountBeforeUpdate = mockVideoBackgroundAspect.registerVideo.calls.count();
                    createCompWithMixin({compData: compData}, container);
                    var callCountAfterUpdate = mockVideoBackgroundAspect.registerVideo.calls.count();

                    expect(callCountAfterUpdate).toEqual(callsCountBeforeUpdate);
                });
            });
        });
    });
});
