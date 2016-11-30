// wysiwyg.common.components.singleaudioplayer.viewer.SingleAudioPlayer
define([
    'testUtils',
    'react',
    'lodash',
    'definition!components/components/singleAudioPlayer/singleAudioPlayer',
    'reactDOM'
], function(/** testUtils */ testUtils, React, _, singleAudioPlayerDef, ReactDOM) {
    'use strict';

    var mockCore, props, compDef;


    describe('SingleAudioPlayer tests', function () {

        beforeEach(function () {
            if (!mockCore) {
                mockCore = testUtils.mockFactory.getFakeCoreWithRealSkinBased();
                props = testUtils.mockFactory.mockProps()
                    .setCompData({
                        artist: 'The Atomic Fireballs',
                        track: 'Caviar & Chitlins',
                        uri: 'someFakeMp3Uri',
                        id: 'data'
                    })
                    .setCompProp({
                        autoplay: false,
                        loop: true,
                        volume: 50,
                        id: 'props'
                    })
                    .setSkin('wysiwyg.common.components.singleaudioplayer.viewer.skins.EPlayerFramedPlay');

                props.style = {
                    height: 75,
                    width: 280,
                    top: 471,
                    left: 1
                };
                props.structure.componentType = 'wysiwyg.common.components.singleaudioplayer.viewer.SingleAudioPlayer';

                compDef = singleAudioPlayerDef(mockCore, React, _, ReactDOM);
            }
        });

        it('Should render component', function () {
            var comp = testUtils.getComponentFromDefinition(compDef, props);

            expect(comp).toBeDefined();
        });

        describe('whilePlayingHandler', function () {
            it('Should set states: trackPositionLabel and progressPosition', function () {
                spyOn(mockCore.compMixins.audioMixin, 'getAudioDuration').and.returnValue(60000);
                var comp = testUtils.getComponentFromDefinition(compDef, props),
                    skinProperties;


                comp.whilePlayingHandler(60000);
                skinProperties = comp.getSkinProperties();

                expect(skinProperties.trackPosition.children).toBe('01:00');
                expect(skinProperties.slider.style.width).toBe('100%');
            });
        });

        describe('whileLoadingHandler', function () {
            it('Should set state: trackDuration', function () {
                var comp = testUtils.getComponentFromDefinition(compDef, props),
                    skinProperties;
                spyOn(mockCore.compMixins.audioMixin, 'getAudioDuration').and.returnValue(60000);

                comp.whileLoadingHandler(1000);
                skinProperties = comp.getSkinProperties();

                expect(skinProperties.trackDuration.children).not.toBe('01:00');
                expect(skinProperties.trackDuration.children).toBe('00:01');
                expect(comp.state.trackDuration).not.toBe('01:00');
                expect(comp.state.trackDuration).toBe('00:01');
            });
        });

        describe('finishedPlayingAudio', function () {
            it('Should set state: $playerState to repeat - if loop is set to false', function () {
                var comp = testUtils.getComponentFromDefinition(compDef, props);

                comp.props.compProp.loop = false;
                comp.finishedPlayingAudio();

                expect(comp.state.$playerState).toBe('repeat');
            });

            it('Should initiate play - if loop is set to true', function () {
                var comp = testUtils.getComponentFromDefinition(compDef, props);
                spyOn(comp, 'initiatePlay');

                comp.props.compProp.loop = true;
                comp.finishedPlayingAudio();

                expect(comp.initiatePlay).toHaveBeenCalled();
            });
        });

        describe('setNonPersistentVolume', function () {
            it('Should set state: volumeBars', function () {
                var comp = testUtils.getComponentFromDefinition(compDef, props),
                    mockEvent = {
                        currentTarget: ''
                    };
                spyOn(comp, 'setVolume');
                spyOn(comp, 'getTargetIndex').and.returnValue(4);

                comp.setNonPersistentVolume(mockEvent);

                expect(comp.state.volumeBars).toEqual(4);
                expect(comp.setVolume).toHaveBeenCalled();
            });
        });

        describe('callToggleMute', function () {
            it('Should set state: $isMuted to muted if original state is unmuted', function () {
                var comp = testUtils.getComponentFromDefinition(compDef, props),
                    button = ReactDOM.findDOMNode(comp.refs.volumeBtn);

                React.addons.TestUtils.Simulate.click(button);

                expect(comp.state.$isMuted).toBe('muted');
            });

            it('Should set state: $isMuted to unmuted - if original state is muted', function () {
                var comp = testUtils.getComponentFromDefinition(compDef, props),
                    button = ReactDOM.findDOMNode(comp.refs.volumeBtn);

                comp.setState({$isMuted: 'muted'});
                React.addons.TestUtils.Simulate.click(button);

                expect(comp.state.$isMuted).toBe('unmuted');
            });
        });

        describe('callSeek', function () {
            it('Should call seekAudio with a position to seek - in milliseconds', function () {
                var comp = testUtils.getComponentFromDefinition(compDef, props),
                    milliseconds,
                    mockEvent = {
                        nativeEvent: {
                            offsetX: 10
                        }
                    };
                spyOn(comp, 'getProgressBarWidth').and.callFake(function () {
                    return 10;
                });
                spyOn(comp, 'getAudioDuration').and.callFake(function () {
                    return 198874;
                });
                spyOn(comp, 'seekAudio');

                milliseconds = Math.ceil((mockEvent.nativeEvent.offsetX / comp.getProgressBarWidth()) * comp.getAudioDuration());
                comp.callSeek(mockEvent);

                expect(comp.seekAudio).toHaveBeenCalledWith(milliseconds);
            });
        });

        describe('stoppedMovingProgressbarHandle', function () {
            it('Should call seekAudio with a position to seek - in milliseconds', function () {
                var comp = testUtils.getComponentFromDefinition(compDef, props),
                    milliseconds,
                    mockEvent = {
                        nativeEvent: {
                            offsetX: 10
                        }
                    };
                spyOn(comp, 'getProgressBarWidth').and.callFake(function () {
                    return 10;
                });
                spyOn(comp, 'getAudioDuration').and.callFake(function () {
                    return 198874;
                });
                spyOn(comp, 'seekAudio');

                milliseconds = Math.ceil((mockEvent.nativeEvent.offsetX / comp.getProgressBarWidth()) * comp.getAudioDuration());

                comp.stoppedMovingProgressbarHandle(mockEvent);

                expect(comp.seekAudio).toHaveBeenCalledWith(milliseconds);
            });

            it('Should set states: trackPositionLabel and progressPosition with correct values', function () {
                var comp = testUtils.getComponentFromDefinition(compDef, props),
                    milliseconds,
                    millisLabel,
                    positionPrecantage,
                    mockEvent = {
                        nativeEvent: {
                            offsetX: 10
                        }
                    };
                spyOn(comp, 'getProgressBarWidth').and.callFake(function () {
                    return 10;
                });
                spyOn(comp, 'getAudioDuration').and.callFake(function () {
                    return 198874;
                });
                spyOn(comp, 'seekAudio');

                milliseconds = Math.ceil((mockEvent.nativeEvent.offsetX / comp.getProgressBarWidth()) * comp.getAudioDuration());
                millisLabel = '03:18';
                positionPrecantage = (milliseconds / comp.getAudioDuration()) * 100;

                comp.stoppedMovingProgressbarHandle(mockEvent);

                expect(comp.state.trackPositionLabel).toEqual(millisLabel);
                expect(comp.state.progressPosition).toEqual(positionPrecantage);
            });
        });

        // movingProgressbarHandle needs some bug fixing
        describe('movingProgressbarHandle', function () {
            it('Should call seekAudio with a position to seek in milliseconds', function () {
                var comp = testUtils.getComponentFromDefinition(compDef, props);
                var milliseconds;
                var mockEvent = {
                    nativeEvent: {
                        offsetX: 10
                    }
                };

                spyOn(comp, 'getProgressBarWidth').and.callFake(function () {
                    return 10;
                });

                spyOn(comp, 'getAudioDuration').and.callFake(function () {
                    return 198874;
                });

                spyOn(comp, 'seekAudio');

                milliseconds = Math.ceil((mockEvent.nativeEvent.offsetX / comp.getProgressBarWidth()) * comp.getAudioDuration());
                comp.callSeek(mockEvent);

                expect(comp.seekAudio).toHaveBeenCalledWith(milliseconds);
            });
        });

        xdescribe('Calculations', function () {
            xdescribe('calculateDisplayDuration', function () {
                it('Should convert milliseconds to a string in the format of mm:ss', function () {
                    var duration = [7285, 59219, 198874, 212845],
                        displayFormat = ['00:07', '00:59', '03:18', '03:32'],
                        actualFormat;

                    _.forEach(duration, function (val, index) {
                        actualFormat = this.calculateDisplayDuration(duration[index]);
                        expect(actualFormat).toEqual(displayFormat[index]);
                    }, this.comp);
                });
            });

            xdescribe('calculateSeekPosition', function () {
                it('Should convert pixels to milliseconds', function () {
                    spyOn(this.comp, 'getAudioDuration').and.callFake(function () {
                        return 198874;
                    });
                    var event = {pageX: 147},
                        position = this.comp.calculateSeekPosition(event, 46, 60, props.style.left, props.style.width);

                    expect(position).toEqual(114296);
                });
            });
        });
    });
});
