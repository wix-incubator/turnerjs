describe('AudioPlayer', function () {
    var player,
        soundUtils;

    testRequire()
        .resources('scriptLoader')
        .classes('wysiwyg.viewer.components.classes.SoundUtils')
        .components('wysiwyg.viewer.components.AudioPlayer');

    beforeEach(function () {
        soundUtils = new this.SoundUtils();
        player = new this.AudioPlayer('testId', new Element('div'));
    });

    it('Spec should run', function () {
        expect(1).toBe(1);
    });

    describe('_createAudioPlayer', function () {
        it('Should attach events and commands', function () {
            spyOn(player, '_attachButtonEvents');
            spyOn(player, '_registerButtonCommands');

            player._createAudioPlayer();

            var flag = true;
            setTimeout(function () {
                flag = false;
            }.bind(this), 500);
            waitsFor(function () {
                return !flag;
            }, 'AudioPlayer', 1000);

            runs(function () {
                expect(player._attachButtonEvents).toHaveBeenCalled();
                expect(player._registerButtonCommands).toHaveBeenCalled();
            });
        });
    });

    xdescribe('_play', function () {
        it('Should set state to playing', function () {
            spyOn(player, '_fileWasSet').andCallFake(function () {
                return true;
            });

            player._play();

            expect(player.getState() === 'playing').toBeTruthy();

        });
    });

    xdescribe('_createAudio', function () {
        it('Should create audio object', function () {
            spyOn(soundUtils, 'waitForApiReady').andCallFake(function () {
                return true;
            });
            spyOn(player, '_createAudioObject');

            player._createAudio();

            var flag = true;
            setTimeout(function () {
                flag = false;
            }.bind(this), 500);
            waitsFor(function () {
                return !flag;
            }, 'AudioPlayer', 1000);

            runs(function () {
                expect(player._createAudioObject).toHaveBeenCalled();
            });
        });
    });

});
