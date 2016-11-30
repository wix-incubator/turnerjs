define(['testUtils', 'utils'], function (/** testUtils */ testUtils, utils) {
    'use strict';

    xdescribe('AudioAspect tests', function () {

        var audioAspect;

        beforeEach(function () {
            var siteData = testUtils.mockFactory.mockSiteData();
            siteData.browser.safari = true;
            this.siteAPI = testUtils.mockFactory.mockSiteAPI(siteData);
            audioAspect = this.siteAPI.getSiteAspect('AudioAspect');

            this.comp = {
                props: {
                    id: '1234'
                }
            };
        });

        describe('SoundManager component test', function () {
            it('Should return true/false - if SoundManager is ready', function () {
                audioAspect.soundManagerReady = true;
                expect(audioAspect.isSoundManagerReady()).toBeTruthy();

                audioAspect.soundManagerReady = false;
                expect(audioAspect.isSoundManagerReady()).toBeFalsy();
            });

            describe('retry mechanism', function () {
                beforeEach(function () {
                    jasmine.clock().install();
                });

                afterEach(function () {
                    jasmine.clock().uninstall();
                });

                it("should retry to set up the SoundManager in case it fails.", function () {
                    // simulate soundManager to be not ready.
                    audioAspect.soundManagerReady = false;
                    var smOptions = null;
                    var numberOfCallsToSetup = 0;
                    audioAspect.soundManager = {
                        setup: function (options) {
                            smOptions = options;
                            numberOfCallsToSetup++;
                        }
                    };

                    // execution
                    audioAspect.loadSoundManagerAPI();
                    jasmine.clock().tick(3000);
                    var currentNumOfCalls = numberOfCallsToSetup;
                    smOptions.onready();
                    jasmine.clock().tick(1000);

                    // assertion
                    expect(audioAspect.isSoundManagerReady()).toBeTruthy();
                    expect(numberOfCallsToSetup).toBeGreaterThan(2);
                    expect(numberOfCallsToSetup).toBe(currentNumOfCalls);
                });

                it("should ensure that the retry mechanism stops after exceeding the limit in AudioAspect", function () {
                    // simulate soundManager to be not ready.
                    audioAspect.soundManagerReady = false;
                    var numberOfCallsToSetup = 0;
                    audioAspect.soundManager = {
                        setup: function () {
                            numberOfCallsToSetup++;
                        }
                    };

                    // execution
                    spyOn(utils.log, 'verbose');
                    audioAspect.loadSoundManagerAPI();

                    // assertion
                    jasmine.clock().tick(5000);
                    expect(audioAspect.isSoundManagerReady()).toBeFalsy();
                    expect(numberOfCallsToSetup).toBeGreaterThan(2);
                    var currentNumberOfCalls = numberOfCallsToSetup;

                    jasmine.clock().tick(15000);
                    expect(audioAspect.isSoundManagerReady()).toBeFalsy();
                    expect(numberOfCallsToSetup).toBeGreaterThan(currentNumberOfCalls);
                    currentNumberOfCalls = numberOfCallsToSetup;
                    expect(utils.log.verbose).not.toHaveBeenCalledWith('Failed to setup SoundManager.');

                    jasmine.clock().tick(20000);
                    expect(audioAspect.isSoundManagerReady()).toBeFalsy();
                    expect(numberOfCallsToSetup).toBe(currentNumberOfCalls);
                    expect(utils.log.verbose).toHaveBeenCalledWith('Failed to setup SoundManager.');
                });
            });

            it("Should force an HTML5 audio player in case the browser is Safari", function() {
                audioAspect.soundManagerReady = false;
                var smOptions = null;
                audioAspect.soundManager = {
                    setup: function(options){smOptions = options;}
                };

                // execution
                audioAspect.loadSoundManagerAPI();

                expect(smOptions.useHTML5Audio).toBe(true);
                expect(smOptions.preferFlash).toBe(false);
            });

            it("Should prefer using Flash over HTML5 audio player in case the browser is NOT Safari", function() {
                var siteData = testUtils.mockFactory.mockSiteData();
                siteData.browser.chrome = true;
                var siteAPI = testUtils.mockFactory.mockSiteAPI(siteData);
                var localAudioAspect = siteAPI.getSiteAspect('AudioAspect');

                localAudioAspect.soundManagerReady = false;
                var smOptions = null;
                localAudioAspect.soundManager = {
                    setup: function(options){smOptions = options;}
                };

                // execution
                localAudioAspect.loadSoundManagerAPI();

                expect(smOptions.useHTML5Audio).toBe(true);
            });

            it("Should NOT load the SoundManager unless trying to play", function(done) {
                expect(audioAspect.soundManager === null || audioAspect.soundManager === undefined).toBeTruthy();
                var mockConfig = {};

                audioAspect.createAudioObj(mockConfig);

                var finished = function() {
                    clearInterval(holder);
                    clearTimeout(timeoutPID);
                    expect(audioAspect.soundManager).toBeDefined();
                    done();
                };

                var timeoutPID = setTimeout(finished, 100);

                var holder = setInterval(function () {
                    if (audioAspect.soundManager) {
                        finished();
                    }
                }, 5);
            });
        });

        describe('isCompPlaying', function () {
            it('Should return true - if current audio is playing', function () {
                audioAspect.nowPlayingComp = '1234';

                expect(audioAspect.isCompPlaying(this.comp)).toBeTruthy();
            });

            it('Should return false - if current audio is not playing', function () {
                audioAspect.nowPlayingComp = '5678';

                expect(audioAspect.isCompPlaying(this.comp)).toBeFalsy();
            });
        });

        describe('updatePlayingComp', function () {
            it('Should set the id of the currently playing audio', function () {
                spyOn(audioAspect.siteAPI, 'forceUpdate').and.callFake(function () {
                    return;
                });

                audioAspect.updatePlayingComp(this.comp);

                expect(audioAspect.nowPlayingComp).toEqual(this.comp.props.id);
                expect(audioAspect.siteAPI.forceUpdate).toHaveBeenCalled();
            });
        });

        describe('updatePausingComp', function () {
            it('Should reset the id of the currently playing audio', function () {
                spyOn(audioAspect.siteAPI, 'forceUpdate');

                audioAspect.soundManagerReady = false;
                audioAspect.updatePausingComp(this.comp);
                expect(audioAspect.nowPlayingComp).toEqual('');
                expect(audioAspect.siteAPI.forceUpdate).not.toHaveBeenCalled();

                audioAspect.soundManagerReady = true;
                audioAspect.updatePausingComp(this.comp);
                expect(audioAspect.nowPlayingComp).toEqual('');
                expect(audioAspect.siteAPI.forceUpdate).toHaveBeenCalled();
            });
        });

        describe('createAudioObj', function () {

            beforeEach(function(done) {
                audioAspect.loadSoundManagerAPI();

                var intervalPID = setInterval(function() {
                    if (audioAspect.soundManager) {
                        clearTimeout(timeoutPID);
                        clearInterval(intervalPID);
                        done();
                    }
                }, 5);

                var timeoutPID = setTimeout(function() {
                    throw new Error('audioAspect.soundManager hasn\'t loaded');
                }, 1000);
            });

            it('Should load soundManager if not ready yet', function () {
                var config = {key: 'val'};
                audioAspect.soundManager.createSound = jasmine.createSpy('createSound');

                audioAspect.soundManagerReady = false;
                spyOn(audioAspect, 'loadSoundManagerAPI');

                var soundObj = audioAspect.createAudioObj(config);

                expect(audioAspect.loadSoundManagerAPI).toHaveBeenCalled();
                expect(audioAspect.soundManager.createSound).not.toHaveBeenCalled();
                expect(soundObj).toBeFalsy();
            });

            it('Should return soundmanager createSound method result if sound manager is ready', function () {
                var config = {key: 'val'};
                audioAspect.soundManager.createSound = function (cnfg) {
                    return cnfg.key + 'created';
                };

                audioAspect.soundManagerReady = true;
                spyOn(audioAspect, 'loadSoundManagerAPI');

                var soundObj = audioAspect.createAudioObj(config);

                expect(soundObj).toEqual(config.key + 'created');

            });

            it('should destroy existing sound with the same id', function () {
                spyOn(audioAspect.soundManager, 'getSoundById').and.returnValue(true);
                spyOn(audioAspect.soundManager, 'destroySound');

                var config = {
                    id: 'someId'
                };

                audioAspect.soundManagerReady = true;
                spyOn(audioAspect, 'loadSoundManagerAPI');

                audioAspect.createAudioObj(config);

                expect(audioAspect.soundManager.destroySound).toHaveBeenCalledWith('someId');
            });
        });
    });
});
