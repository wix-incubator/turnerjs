define(['lodash', 'definition!tweenEngine/tweenEngineGreenSock/tweenEngineGreenSock', 'utils', 'testUtils'],
    function(_, engineDefinition, utils, testUtils) {
        'use strict';

        describe('tweenEngineGreenSock', function() {
            describe('Tween', function() {
                var engine = engineDefinition(_, utils, testUtils.mockTweenMax, testUtils.mockTimelineMax);

                it('should convert elements param to an array', function() {
                    var tween = engine.tween({}, null, {});
                    expect(_.isArray(tween.args[0])).toBeTruthy();
                });

                it('should accept _allowedTweenMaxParamsList params', function() {
                    var tween = engine.tween({}, {perspective: "testValue"}, {});
                    expect(tween.args[2].perspective).toBeTruthy();
                });

                it('should reject un-allowed params', function() {
                    var tween = engine.tween({}, {testParam: "testValue"}, {});
                    expect(tween.args[2].testParam).toBeFalsy();

                });
                it('should accept a custom declared attribute as allowed params', function() {
                    var tween = engine.tween({}, {testParam: "testValue"}, ["testParam"]);
                    expect(tween.args[2].testParam).toBeTruthy();
                });
                it('should accept a custom declared attribute as allowed params which are nested in to/from params', function() {
                    var tween = engine.tween({}, {to: {testParam: "testValue"}}, ["testParam"]);
                    expect(tween.args[2].testParam).toBeTruthy();
                    tween = engine.tween({}, {from: {testParam: "testValue"}}, ["testParam"]);
                    expect(tween.args[2].testParam).toBeTruthy();
                });
                it('should call `to` animation type', function() {
                    var spiedTo = spyOn(testUtils.mockTweenMax, 'to').and.callThrough();
                    engine.tween({}, {}, null);
                    expect(spiedTo).toHaveBeenCalled();
                });

                it('should call `from` animation type', function() {
                    var spiedFrom = spyOn(testUtils.mockTweenMax, 'from').and.callThrough();
                    engine.tween({}, {from: {}}, null);
                    expect(spiedFrom).toHaveBeenCalled();
                });

                it('should call `fromTo` animation type', function() {
                    var spiedFromTo = spyOn(testUtils.mockTweenMax, 'fromTo').and.callThrough();
                    engine.tween({}, {to: {}, from: {}}, null);
                    expect(spiedFromTo).toHaveBeenCalled();
                });

                it('should handle different types of params in `to` animation type', function() {
                    var spiedTo = spyOn(testUtils.mockTweenMax, 'to').and.callThrough();

                    var toParams = {
                        delay: 500,
                        duration: 500
                    };

                    var toStaggerParams = {
                        stagger: 1,
                        delay: 500,
                        duration: 500
                    };

                    engine.tween({}, toParams, null);

                    var toExpectedParams = {delay: 500, data: {}};
                    expect(spiedTo).toHaveBeenCalledWith([
                        {}
                    ], 500, toExpectedParams);

                    var staggerTween = engine.tween({}, toStaggerParams, null);
                    expect(staggerTween.args).toEqual({delay: 500, data: {}});

                    var expectedStaggerParams = [
                        [{}],
                        500,
                        {data: {}},
                        1
                    ];
                    expect(_.toArray(staggerTween.tweens[0].args)).toEqual(expectedStaggerParams);
                });

                it('should handle different types of params in `from` animation type', function() {
                    var spiedFrom = spyOn(testUtils.mockTweenMax, 'from').and.callThrough();

                    var fromParams = {
                        from: {},
                        delay: 500,
                        duration: 500
                    };

                    var fromStaggerParams = {
                        stagger: 1,
                        delay: 500,
                        duration: 500
                    };

                    engine.tween({}, fromParams, null);

                    var fromExpectedParams = {
                        delay: 500,
                        data: {}
                    };
                    expect(spiedFrom).toHaveBeenCalledWith([
                        {}
                    ], 500, fromExpectedParams);

                    var staggerTween = engine.tween({}, fromStaggerParams, null);
                    expect(staggerTween.args).toEqual({delay: 500, data: {}});

                    var expectedStaggerParams = [
                        [{}],
                        500,
                        {data: {}},
                        1
                    ];
                    expect(_.toArray(staggerTween.tweens[0].args)).toEqual(expectedStaggerParams);
                });

                it('should handle different types of params in `fromTo` animation type', function() {
                    var spiedFromTo = spyOn(testUtils.mockTweenMax, 'fromTo').and.callThrough();

                    var fromToParams = {
                        from: {},
                        to: {},
                        delay: 500,
                        duration: 500
                    };

                    engine.tween({}, fromToParams, null);
                    expect(spiedFromTo).toHaveBeenCalledWith([{}], 500, {}, {delay: 500, data: {}});
                });

                it('should call tween with 0 duration and delay', function() {
                    var spiedTo = spyOn(testUtils.mockTweenMax, 'to').and.callThrough();
                    engine.set({}, {key: "value"});
                    expect(spiedTo).toHaveBeenCalledWith([{}], 0, {data: {}, key: "value", delay: 0});
                });
            });

            describe('Ticker Event', function() {
                var engine = engineDefinition(_, utils, testUtils.mockTweenMax, testUtils.mockTimelineMax);

                it('should add a ticker event', function() {
                    var callback = function() {
                    };
                    var spiedAddEventListener = spyOn(testUtils.mockTweenMax.ticker, 'addEventListener');
                    engine.addTickerEvent(callback);
                    expect(spiedAddEventListener).toHaveBeenCalledWith('tick', callback);
                });

                it('should remove a ticker event', function() {
                    var callback = function() {
                    };
                    var spiedRemoveEventListener = spyOn(testUtils.mockTweenMax.ticker, 'removeEventListener');
                    engine.removeTickerEvent(callback);
                    expect(spiedRemoveEventListener).toHaveBeenCalledWith('tick', callback);
                });
            });

            describe('Kill', function() {
                var engine = engineDefinition(_, utils, testUtils.mockTweenMax, testUtils.mockTimelineMax);

                it('should pause an animation', function() {
                    var sequence = engine.timeline({data: {}, delay: 0});
                    var spiedPause = spyOn(sequence, 'pause');
                    engine.kill(sequence);
                    expect(spiedPause).toHaveBeenCalled();
                });

                it('should skip to end of animation', function() {
                    var sequence = engine.timeline({data: {}, delay: 0});
                    var spiedProgress = spyOn(sequence, 'progress');
                    engine.kill(sequence, 1);
                    expect(spiedProgress).toHaveBeenCalled();
                });

                it('should not skip to end of animation if not forced with seekToEnd param', function() {
                    var sequence = engine.timeline({data: {}, delay: 0});
                    var spiedProgress = spyOn(sequence, 'progress');
                    engine.kill(sequence);
                    expect(spiedProgress).not.toHaveBeenCalledWith(1, true);
                });

                it('should clear animation instance', function() {
                    var sequence = engine.timeline({data: {}, delay: 0});
                    var spiedClear = spyOn(sequence, 'clear');
                    engine.kill(sequence);
                    expect(spiedClear).toHaveBeenCalled();
                });

                it('should kill an animation instance', function() {
                    var sequence = engine.timeline({data: {}, delay: 0});
                    var spiedKill = spyOn(sequence, 'kill');
                    engine.kill(sequence);
                    expect(spiedKill).toHaveBeenCalled();
                });

                it('should execute sequence callback onInterruptHandler', function() {
                    this.mockOnInterrupt = function() {
                        this.args = _.toArray(arguments);
                        return this;
                    };
                    var spiedOnInterrupt = spyOn(this, 'mockOnInterrupt');
                    var data = {
                        callbacks: {
                            onInterrupt: spiedOnInterrupt
                        }
                    };
                    var sequence = engine.timeline({data: data, delay: 0});

                    engine.kill(sequence);
                    expect(spiedOnInterrupt).toHaveBeenCalledWith(sequence);
                });
            });
        });
    });