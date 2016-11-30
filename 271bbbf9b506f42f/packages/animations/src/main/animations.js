define([
    'animations/localTweenEngine/localTweenEngine',
    'animations/animationClasses/animation/defaults/defaults',
    // Base animations
    'animations/animationClasses/base/sequence/baseSequence',
    'animations/animationClasses/base/baseNone',
    'animations/animationClasses/base/baseFade',
    'animations/animationClasses/base/basePosition',
    'animations/animationClasses/base/baseScale',
    'animations/animationClasses/base/baseSkew',
    'animations/animationClasses/base/baseRotate',
    'animations/animationClasses/base/baseRotate3D',
    'animations/animationClasses/base/baseClip',
    'animations/animationClasses/base/baseDimensions',
    'animations/animationClasses/base/baseScroll',
    'animations/animationClasses/base/baseAttribute',
    'animations/animationClasses/base/baseClear',
    // General Animations
    'animations/animationClasses/animation/fade',
    'animations/animationClasses/animation/position',
    'animations/animationClasses/animation/scale',
    'animations/animationClasses/animation/rotate',
    // In Animations
    'animations/animationClasses/animation/in/arcIn',
    'animations/animationClasses/animation/in/dropIn',
    'animations/animationClasses/animation/in/expandIn',
    'animations/animationClasses/animation/in/fadeIn',
    'animations/animationClasses/animation/in/flipIn',
    'animations/animationClasses/animation/in/floatIn',
    'animations/animationClasses/animation/in/flyIn',
    'animations/animationClasses/animation/in/foldIn',
    'animations/animationClasses/animation/in/reveal',
    'animations/animationClasses/animation/in/slideIn',
    'animations/animationClasses/animation/in/spinIn',
    'animations/animationClasses/animation/in/turnIn',
    'animations/animationClasses/animation/in/bounceIn',
    'animations/animationClasses/animation/in/glideIn',
    // Out Animations
    'animations/animationClasses/animation/out/arcOut',
    'animations/animationClasses/animation/out/popOut',
    'animations/animationClasses/animation/out/collapseOut',
    'animations/animationClasses/animation/out/fadeOut',
    'animations/animationClasses/animation/out/flipOut',
    'animations/animationClasses/animation/out/floatOut',
    'animations/animationClasses/animation/out/flyOut',
    'animations/animationClasses/animation/out/foldOut',
    'animations/animationClasses/animation/out/conceal',
    'animations/animationClasses/animation/out/slideOut',
    'animations/animationClasses/animation/out/spinOut',
    'animations/animationClasses/animation/out/turnOut',
    'animations/animationClasses/animation/out/bounceOut',
    'animations/animationClasses/animation/out/glideOut',
    // Mode Transition Animations
    'animations/animationClasses/animation/modes/ModesMotionNoScale',
    'animations/animationClasses/animation/modes/ModesMotionNoDimensions',
    'animations/animationClasses/animation/modes/ModesMotionScale',
    // Background Scroll Effects
    'animations/animationClasses/animation/backgroundScrollEffects/siteBackgroundParallax',
    'animations/animationClasses/animation/backgroundScrollEffects/backgroundReveal',
    'animations/animationClasses/animation/backgroundScrollEffects/backgroundParallax',
    'animations/animationClasses/animation/backgroundScrollEffects/backgroundZoom',
    'animations/animationClasses/animation/backgroundScrollEffects/backgroundFadeIn',
    'animations/animationClasses/animation/backgroundScrollEffects/backgroundBlurIn',
    // Transitions
    'animations/animationClasses/transition/noTransition',
    'animations/animationClasses/transition/crossFade',
    'animations/animationClasses/transition/outIn',
    'animations/animationClasses/transition/slideHorizontal',
    'animations/animationClasses/transition/slideVertical',
    'animations/animationClasses/transition/shrink'
], function(tweenEngine, animationDefaults) {
    'use strict';

    /** core.animations.tweenEngineGreenSock */
    var engine = tweenEngine.engine;
    /** core.animationsFactory */
    var factory = tweenEngine.factory;

    return {
        animate: factory.animate,
        transition: factory.transition,
        sequence: factory.sequence,
        getProperties: factory.getProperties,
        addTickerEvent: engine.addTickerEvent,
        removeTickerEvent: engine.removeTickerEvent,
        kill: engine.kill,
        delayedCall: engine.delayedCall,
        animateTimeScale: engine.animateTimeScale,
        viewerDefaults: animationDefaults
    };
});
