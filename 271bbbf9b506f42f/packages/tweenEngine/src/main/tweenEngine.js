define([
    'tweenEngine/animationsFactory/animationsFactory',
    'tweenEngine/tweenEngineGreenSock/tweenEngineGreenSock'
], function(/** core.animationsFactory */ FactoryConstructor,
            /** core.animations.tweenEngineGreenSock */ engine) {

    'use strict';


    /**
     * Constructor for a local tween engine.
     * @returns {{factory: {animate: (exports.animate|*), transition: (exports.transition|*), sequence: (exports.sequence|*), registerAnimation: *, registerTransition: *, getProperties: (exports.getProperties|*), getAnimationsDefs: *, getTransitionsDefs: *}, engine: {timeline: *, tween: (exports.tween|*), set: exports.set, kill: (exports.kill|*), addTickerEvent: (exports.addTickerEvent|*), removeTickerEvent: (exports.removeTickerEvent|*), isTweening: exports.isTweening, getBoundingRect: exports.getBoundingRect, getBoundingContentRect: *, delayedCall: (exports.delayedCall|*), animateTimeScale: (exports.animateTimeScale|*)}}}
     * @constructor
     * @class core.animations.tweenEngine
     */
    function TweenEngineConstructor() {
        var factory = new FactoryConstructor();
        return {
            factory: {
                animate: factory.animate,
                transition: factory.transition,
                sequence: factory.sequence,
                registerAnimation: factory.registerAnimation,
                registerTransition: factory.registerTransition,
                getProperties: factory.getProperties,
                getAnimationsDefs: factory.getAnimationsDefs,
                getTransitionsDefs: factory.getTransitionsDefs
            },
            engine: {
                timeline: engine.timeline,
                tween: engine.tween,
                set: engine.set,
                kill: engine.kill,
                addTickerEvent: engine.addTickerEvent,
                removeTickerEvent: engine.removeTickerEvent,
                isTweening: engine.isTweening,
                getElementRect: engine.getElementRect,
                getContentRect: engine.getContentRect,
                getBoundingRect: engine.getBoundingRect,
                getBoundingContentRect: engine.getBoundingContentRect,
                delayedCall: engine.delayedCall,
                animateTimeScale: engine.animateTimeScale,
                adjustLagSmoothing: engine.adjustLagSmoothing,
                useRAF: engine.useRAF
            }
        };
    }

    return TweenEngineConstructor;

});
