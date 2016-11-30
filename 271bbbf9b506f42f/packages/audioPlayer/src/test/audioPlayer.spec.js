// wysiwyg.viewer.components.AudioPlayer
define(['lodash', 'testUtils', 'audioPlayer'], function (_, /** testUtils */ testUtils, audioPlayer) {
    'use strict';

    describe('AudioPlayer tests', function () {

        function createAudioPlayerComp(props, node) {
            return testUtils.getComponentFromDefinition(audioPlayer, props, node);
        }

        function createAudioPlayerProps(partialProps, siteData) {

            return testUtils.santaTypesBuilder.getComponentProps(audioPlayer, _.merge({
                compData: {
                    autoPlay: false,
                    id: 'someId',
                    loop: false,
                    uri: 'someFakeMp3Uri'
                }
            }, partialProps), siteData);
        }

        it('Should render component and have correct state', function () {
            var initCompData = {
                volume: 90,
                autoPlay: true
            };

            var props = createAudioPlayerProps({
                compData: initCompData
            });
            var comp = createAudioPlayerComp(props);

            expect(comp.audioVolume).toEqual(initCompData.volume);
        });

        it('Should be called mixin ApdateAudioObj method on comp building', function() {
            var props = createAudioPlayerProps();
            var comp = createAudioPlayerComp(props);

            spyOn(comp, 'updateAudioObject');
            comp.getSkinProperties();

            expect(comp.updateAudioObject).toHaveBeenCalled();
        });

        describe('finishedPlayingAudio', function () {
            it('Should set state: $playerState to pausing - if loop is set to false', function () {

                var props = createAudioPlayerProps({
                    compData: {
                        loop: false
                    }
                });
                var comp = createAudioPlayerComp(props);

                spyOn(comp, 'initiatePause').and.callFake(function () {
                    comp.setState({$playerState: 'pausing'});
                });
                comp.finishedPlayingAudio();

                expect(comp.state.$playerState).toBe('pausing');
            });

            it('Should initiate play - if loop is set to true', function () {
                var props = createAudioPlayerProps({
                    compData: {
                        loop: true
                    }
                });
                var comp = createAudioPlayerComp(props);

                spyOn(comp, 'initiatePlay').and.callFake(function () {
                    return true;
                });
                comp.finishedPlayingAudio();

                expect(comp.initiatePlay).toHaveBeenCalled();
            });
        });
    });
});
