describe('SoundUtils', function () {
    it('Spec should run', function () {
        expect(1).toBe(1);
    });

    xdescribe('wysiwyg.viewer.components.classes.SoundUtils', function () {
        var soundUtils;

        testRequire()
            .resources('W.Config')
            .classes('wysiwyg.viewer.components.classes.SoundUtils');

        beforeEach(function () {
            soundUtils = new this.SoundUtils();
        });

        it('SoundUtils should be defined', function () {
            expect(soundUtils).toBeDefined();
        });

        it('Relevant statics should be defined', function () {
            expect(soundUtils.SOUND_API_RESOURCE_NAME).toBeDefined();
            expect(soundUtils.SOUND_MANAGER_OBJ).toBeDefined();
        });

        describe('API Loading tests', function () {
            it('isSoundApiDefined should be true if it is defined', function () {
                var actualResult,
                    expectedParam = 'resource.' + soundUtils.SOUND_API_RESOURCE_NAME,
                    actualParam;
                spyOn(define, 'getDefinition').andCallFake(function (param) {
                    actualParam = param;
                    return {};
                });

                actualResult = soundUtils.isSoundApiDefined();

                expect(actualResult).toBe(true);
                expect(actualParam).toBe(expectedParam);
            });

            it('isSoundApiDefined should be false if it is not defined', function () {
                var actualResult;
                spyOn(define, 'getDefinition').andCallFake(function () {
                    return undefined;
                });

                actualResult = soundUtils.isSoundApiDefined();

                expect(actualResult).toBe(false);
            });

            it('API should be loaded only once', function () {
                var callCount = 0;
                spyOn(soundUtils, 'isSoundApiDefined').andCallFake(function () {
                    return true;
                });
                spyOn(resource, 'getResourceValue').andCallFake(function () {
                });
                spyOn(define, 'resource').andCallFake(function () {
                    callCount++;
                });

                soundUtils.loadApi();

                expect(callCount).toBe(0);
            });

            it('define.resource should be called to define sound api resource', function () {
                spyOn(soundUtils, 'isSoundApiDefined').andCallFake(function () {
                    return false;
                });
                spyOn(define, 'resource').andReturn({
                    withUrls: function () {
                    }
                });
                spyOn(resource, 'getResourceValue');

                soundUtils.loadApi();

                expect(define.resource).toHaveBeenCalled();
            });

            it('API should be define with the correct url', function () {
                var fakeUrl = 'http://example.com/some-fake-filename.js',
                    actualUrl;
                spyOn(soundUtils, 'isSoundApiDefined').andCallFake(function () {
                    return false;
                });
                spyOn(soundUtils, '_getSoundApiFileName').andCallFake(function () {
                    return fakeUrl;
                });
                spyOn(define, 'resource').andReturn({
                    withUrls: function (url) {
                        actualUrl = url;
                    }
                });

                soundUtils.loadApi();

                expect(actualUrl).toBe(fakeUrl);
            });

            it('loadApi should call getResourceValue with callbacks', function () {
                var actualSuccessCallback,
                    actualFailureCallback,
                    actualResourceName;
                spyOn(soundUtils, 'isSoundApiDefined').andCallFake(function () {
                    return false;
                });
                spyOn(resource, 'getResourceValue').andCallFake(function (p1, p2, p3) {
                    actualResourceName = p1;
                    actualSuccessCallback = p2;
                    actualFailureCallback = p3;
                });

                soundUtils.loadApi();

                expect(actualResourceName).toBeOfType('string');
                expect(actualSuccessCallback).toBeOfType('function');
                expect(actualFailureCallback).toBeOfType('function');
            });

        });

        describe('getAudioFullUrl test', function () {
            it('getAudioFullUrl should return the given url if it starts with http://', function () {
                var fakeUrl = 'http://example.com/some-fake-filename.js',
                    actualUrl;
                spyOn(soundUtils, 'getAudioFullUrl').andCallThrough();

                actualUrl = soundUtils.getAudioFullUrl(fakeUrl);

                expect(actualUrl).toBe(fakeUrl);
            });

            it('getAudioFullUrl should return valid url with the given file ', function () {
                var fakeUrl = 'some-fake-filename.mp3',
                    actualUrl;
                spyOn(soundUtils.resources.W.Config, 'getServiceTopologyProperty').andCallFake(function () {
                    return 'http://media.wix.com/mp3';
                });
                spyOn(soundUtils, 'getAudioFullUrl').andCallThrough();

                actualUrl = soundUtils.getAudioFullUrl(fakeUrl);

                expect(actualUrl).toBe('http://media.wix.com/mp3/some-fake-filename.mp3');
            });

        });

        it('setupSoundManager should setup soundManager', function () {
            spyOn(soundUtils, 'isSoundApiDefined').andReturn(false);

            soundUtils.loadApi();

            var flag = true;
            setTimeout(function () {
                flag = false;
            }.bind(this), 500);
            waitsFor(function () {
                return !flag;
            }, 'SingleAudioPlayer', 1000);

            runs(function () {
                expect(soundManager).toBeDefined();
            });
        });

        it('_getSoundApiFileName should return the full path to SoundManager2 API', function () {
            var actualPath;
            spyOn(soundUtils, '_getSoundApiFolder').andCallFake(function () {
                return 'http://resources.topology.wysiwyg/resources/wysiwyg/media/soundmanager2new/';
            });

            actualPath = soundUtils._getSoundApiFileName();

//            expect(actualPath).toEndWith('soundmanager2-nodebug-jsmin.js');
            expect(actualPath).toEndWith('soundmanager2.js');
        });

        it('_getSoundApiFolder should return the full path to SoundManager2 API folder', function () {
            var actualPath;
            spyOn(soundUtils, '_getSoundApiFolder').andCallThrough();

            actualPath = soundUtils._getSoundApiFolder();

            expect(actualPath).toContainString('web');
            expect(actualPath).toContainString('soundmanager2new');
        });
    });
});