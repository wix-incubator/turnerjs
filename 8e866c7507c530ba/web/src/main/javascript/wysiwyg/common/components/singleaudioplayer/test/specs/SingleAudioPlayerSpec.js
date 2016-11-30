describe('SingleAudioPlayer', function () {

    it('Spec should run', function () {
        expect(1).toBe(1);
    });

//    var sapId = 'test';

//    testRequire()
//        .classes('core.managers.components.ComponentBuilder')
//        .components('wysiwyg.common.components.singleaudioplayer.viewer.SingleAudioPlayer')
//        .resources('scriptLoader', 'W.Config', 'W.Utils', 'W.Data', 'W.ComponentLifecycle');
//
//    var componentLogic,
//        data,
//        view,
//        createComponentSpies = function () {
//            // spyOn(this.SingleAudioPlayer.prototype, '_onSMApiLoaded');
//            // spyOn(this.SingleAudioPlayer.prototype, '_soundManagerReady').andCallThrough();
//        },
//        createComponent = function () {
//            data = this.W.Data.createDataItem({type: 'SingleAudioPlayer'});
//            componentLogic = null;
//
//            var viewNode = document.createElement('div');
//            this.builder = new this.ComponentBuilder(viewNode);
//
//            this.builder
//                .withType('wysiwyg.common.components.singleaudioplayer.viewer.SingleAudioPlayer')
//                .withSkin('wysiwyg.common.components.singleaudioplayer.viewer.skins.EPlayerRoundPlay')
//                .withData(data)
//                .onCreated(function (component, node) {
//                    componentLogic = component;
//                    componentLogic.getViewNode().setProperty('id', sapId);
//                    spyOn(componentLogic._soundUtils, 'loadApi').andCallThrough();
//                })
//                .create();
//
//            waitsFor(function () {
//                return componentLogic !== null;
//            }, 'SingleAudioPlayer component to be ready', 1000);
//
//            runs(function () {
//                this.expect(componentLogic).not.toBeNull();
//                view = componentLogic.getViewNode();
//                this.expect(view).not.toBeNull();
//            });
//        };
//
//    beforeEach(function () {
//        createComponentSpies.call(this);
//        createComponent.call(this);
//    });

    xdescribe('Interactive viewer behaviors', function () {

        describe('Media controls', function () {
            it('Clicking on play button should start/resume playing audio', function () {
                expect(1).toEqual(2);
            });
            it('Clicking on repeat button should start playing audio', function () {
                expect(1).toEqual(2);
            });
            it('Clicking pause button should pause audio (and keep the position)', function () {
                expect(1).toEqual(2);
            });
            it('Clicking on progressbar should seek to a certain point of the audio', function () {
                expect(1).toEqual(2);
            });
            it('Clicking on mute/unmute button should mute/unmute respectively', function () {
                expect(1).toEqual(2);
            });
            it('Clicking on volume scale should control the volume', function () {
                expect(1).toEqual(2);
            });
        });

        it('If loop is true: should repeat the audio after finishing a play cycle', function () {
            expect(1).toEqual(2);
        });
        it('If autoplay is true: should play audio on page load automatically', function () {
            expect(1).toEqual(2);
        });

        describe('Component in device context', function () {
            describe('Desktop', function () {
                it('If autoplay is true: should play audio on page load', function () {
                    expect(1).toEqual(2);
                });
            });
            describe('Mobile', function () {
                it('If autoplay is true: should NOT play on page load', function () {
                    expect(1).toEqual(2);
                });
                it('Skin hides the volume controls', function () {
                    expect(1).toEqual(2);
                });
            });
        });
    });

    xdescribe('Component features in editor mode', function () {
        it('Should be able to add an audio file', function () {
            // _createAudioObject
            expect(1).toEqual(2);
        });
        it('Should be able to change audio file', function () {
            // destroySound and then _createAudioObject
            expect(1).toEqual(2);
        });
        it('Should be able set duration when audio was loaded', function () {
            // soundManager onload
            expect(1).toEqual(2);
        });
        it('Should be able set artist/track', function () {
            // soundManager whileloading/onid3/onload
            expect(1).toEqual(2);
        });
    });


    xdescribe('Audio operations Functionality', function () {
        it('Should create sound', function () {
            componentLogic._changeAudio();
            spyOn(componentLogic, '_createAudioObject').andCallThrough();
            spyOn(componentLogic._soundUtils, 'getAudioFullUrl');

            expect(componentLogic._soundUtils.getAudioFullUrl).toHaveBeenCalled();
        });

        it('Should Change Audio', function () {
            spyOn(componentLogic, '_changeAudio').andCallFake(function () {
                return soundManager.createSound({
                    url: '//static.wixstatic.com/media/d6e20a_c64738b0dc4efe6b969ed640e6885738.mp3',
                    autoPlay: false,
                    stream: true,
                    autoLoad: true,
                    usePolicyFile: false,
                    whileloading: function () {
                        spyOn(componentLogic._soundUtils, 'hasAudio').andReturn(true);
                        setTimeout(componentLogic._soundUtils.hasAudio, 15);
                    },
                    onload: function () {
                    },
                    onid3: function () {
                    },
                    onplay: function () {
                    },
                    onresume: function () {
                    },
                    whileplaying: function () {
                    },
                    onfailure: function () {
                    },
                    onfinish: function () {
                    }
                });
            });

        });
    });
});