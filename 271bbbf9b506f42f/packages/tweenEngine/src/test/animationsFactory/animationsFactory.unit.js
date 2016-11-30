/* global _ */
define(['tweenEngine/animationsFactory/animationsFactory', 'utils'],
    function (FactoryConstructor, utils) {
        'use strict';
        var animationsFactory = new FactoryConstructor();

        var animationName = 'testAnimation' + Date.now();
        var animationName2 = animationName + '1';
        var transitionName = 'testTransition' + Date.now();
        var transitionName2 = transitionName + '1';

        describe('animationsFactory', function () {
            describe('Registering an Animation', function () {

                it('should add an animation to the animationsDefs list', function() {
                    var animationsCount = _.size(animationsFactory.getAnimationsDefs());
                    var expectedAnimationsCount = animationsCount + 1;
                    var testAnimationFunc = function() { return true; };

                    // Adding Date.now() to the animation name to make it unique
                    animationsFactory.registerAnimation(animationName, testAnimationFunc);
                    var newAnimationsCount = _.size(animationsFactory.getAnimationsDefs());

                    expect(newAnimationsCount).toEqual(expectedAnimationsCount);
                });

                it('should override existing animation in animationsDefs list', function(){
                    var animationsCount = _.size(animationsFactory.getAnimationsDefs());
                    var testAnimationFunc = function() { return true; };

                    animationsFactory.registerAnimation(animationName, testAnimationFunc);

                    var newAnimationsCount = _.size(animationsFactory.getAnimationsDefs());

                    expect(newAnimationsCount).toEqual(animationsCount);

                    var updatedDefs = animationsFactory.getAnimationsDefs();
                    expect(updatedDefs[animationName]).toBe(testAnimationFunc);
                });

                it('should show a console error if a existing *Transition* has the name of a newly registered *Animation* - but still register it', function(){
                    var testAnimationFunc = function() { return true; };
                    var consoleError = spyOn(utils.log, 'error');

                    animationsFactory.registerTransition(animationName2, testAnimationFunc);
                    animationsFactory.registerAnimation(animationName2, testAnimationFunc);

                    expect(consoleError).toHaveBeenCalled();

                    var updatedDefs = animationsFactory.getAnimationsDefs();
                    expect(updatedDefs[animationName2]).toBe(testAnimationFunc);
                });
            });

            describe('Registering a Transition', function () {

                it('should add an transition to the transitionsDefs list', function() {
                    var transitionsCount = _.size(animationsFactory.getTransitionsDefs());
                    var expectedTransitionsCount = transitionsCount + 1;
                    var testTransitionsFunc = function() { return true; };

                    // Adding Date.now() to the transition name to make it unique
                    animationsFactory.registerTransition(transitionName, testTransitionsFunc);
                    var newTransitionsCount = _.size(animationsFactory.getTransitionsDefs());

                    expect(newTransitionsCount).toEqual(expectedTransitionsCount);

                });

                it('should override existing transition in transitionsDefs list', function(){
                    var transitionsCount = _.size(animationsFactory.getTransitionsDefs());
                    var testTransitionFunc = function() { return true; };

                    animationsFactory.registerTransition(transitionName, testTransitionFunc);

                    var newTransitionsCount = _.size(animationsFactory.getTransitionsDefs());

                    expect(newTransitionsCount).toEqual(transitionsCount);

                    var updatedDefs = animationsFactory.getTransitionsDefs();
                    expect(updatedDefs[transitionName]).toBe(testTransitionFunc);
                });

                it('should warn if a existing *Animation* has the name of a newly registered *Transition* - but still register it', function(){
                    var testTransitionFunc = function() { return true; };
                    var consoleError = spyOn(utils.log, 'error');

                    animationsFactory.registerAnimation(transitionName2, testTransitionFunc);
                    animationsFactory.registerTransition(transitionName2, testTransitionFunc);

                    var updatedDefs = animationsFactory.getTransitionsDefs();
                    expect(updatedDefs[transitionName2]).toBe(testTransitionFunc);

                    expect(consoleError).toHaveBeenCalled();
                });
            });

            describe('Executing an Animation', function () {
                it('should execute an animation from the animationsDefs list', function(){
                    var func = jasmine.createSpy('spy');
                    animationsFactory.registerAnimation(animationName, func);
                    animationsFactory.animate(animationName);
                    expect(func).toHaveBeenCalled();
                });

                it('should show a console error and return null if animation is not in animationsDefs', function(){
                    var consoleError = spyOn(utils.log, 'error');
                    var returnedValue = animationsFactory.animate('nonExistingAnimation');
                    expect(consoleError).toHaveBeenCalled();
                    expect(returnedValue).toBe(null);
                });
            });

            describe('Executing a Transition', function () {
                it('should execute an transition from the transitionsDefs list', function(){
                    var func = jasmine.createSpy('spy');

                    animationsFactory.registerTransition(transitionName, func);
                    animationsFactory.transition(transitionName);
                    expect(func).toHaveBeenCalled();
                });

                it('should show a console error and return null if transition is not in transitionsDefs', function(){
                    var consoleError = spyOn(utils.log, 'error');
                    var returnedValue = animationsFactory.transition('nonExistingTransition');
                    expect(consoleError).toHaveBeenCalled();
                    expect(returnedValue).toBe(null);
                });
            });
        });
    });