define(['lodash', 'testUtils', 'core/components/audioMixin'],
    function (_, testUtils, audioMixin) {
        'use strict';
        describe('audioMixin', function () {

            // THE IMPORTANT PART - INITIALIZING THE MIXIN AS IF IT WAS PART OF A COMPONENT.
            var mockComp = testUtils.mockFactory.getMockComponentDefenition();
            mockComp.mixins.push(audioMixin);

            function createAudiomixinComp(props, node) {
                return testUtils.getComponentFromDefinition(mockComp, props, node);
            }

            function createAudiomixinProps(partialProps, siteData) {

                return testUtils.santaTypesBuilder.getComponentProps(mockComp, _.merge({
                    isPlayingAllowed: true,
                    compData: {
                        autoPlay: false,
                        id: 'someId',
                        loop: false,
                        uri: 'http://www.wix.com/santa.mp3'
                    },
                    compProp: {
                        autoplay: true
                    }
                }, partialProps), siteData);
            }

            it("should update the Aspect's currently playing component.", function() {

                var props = createAudiomixinProps();
                var mixin = createAudiomixinComp(props);
                var audioAspect = mixin.props.audioAspect;

                spyOn(audioAspect, "loadSoundManagerAPI");
                spyOn(audioAspect, "updatePlayingComp");

                mixin.initiatePlay();

                expect(audioAspect.loadSoundManagerAPI).not.toHaveBeenCalled();
                expect(audioAspect.updatePlayingComp).toHaveBeenCalled();
            });

            describe('on audio file change', function () {
                it('should clear the audio object', function () {

                    var props = createAudiomixinProps();
                    var containerNode = window.document.createElement('div');
                    var mixin = createAudiomixinComp(props, containerNode);

                    var pauseSpy = jasmine.createSpy('pause');
                    mixin.audioObj = {
                        pause: pauseSpy
                    };

                    // var newProps = _.merge({}, props, {
                    //     compData: {
                    //         uri: 'someNewUri'
                    //     }
                    // });
                    // createAudiomixinComp(newProps, containerNode);

                    mixin.componentWillReceiveProps({
                        compData: {
                            uri: 'someNewUri'
                        },
                        useSantaTypes: true // IMPORTANT
                    });

                    expect(pauseSpy).toHaveBeenCalled();
                    expect(mixin.audioObj).toBeFalsy();
                });
            });

            xit('should autoplay in the viewer', function() {

                var props = createAudiomixinProps({
                    isPlayingAllowed: false
                });
                var containerNode = window.document.createElement('div');
                var mixin = createAudiomixinComp(props, containerNode);
                spyOn(mixin, 'initiatePlay');

                // change state
                var newProps = _.merge({}, props, {
                    isPlayingAllowed: true
                });
                createAudiomixinComp(newProps, containerNode);

                //mixin.componentDidUpdate();

                expect(mixin.initiatePlay).toHaveBeenCalled();
            });

            it('should not autoplay when switching to the editor', function() {
                var props = createAudiomixinProps({
                    isPlayingAllowed: false
                });
                var mixin = createAudiomixinComp(props);
                spyOn(mixin, 'initiatePlay');

                mixin.componentDidUpdate();

                expect(mixin.initiatePlay).not.toHaveBeenCalled();
            });
        });
});
