define(['animations/localTweenEngine/localTweenEngine'], function(tweenEngine) {
    'use strict';

    /** core.animations.tweenEngineGreenSock */
    var engine = tweenEngine.engine;
    /** core.animationsFactory */
    var factory = tweenEngine.factory;

    /**
     * Dimensions base animation object
     * @param {Array<HTMLElement>|HTMLElement} elements DOM elements
     * @param {Number} [duration=1.0]
     * @param {Number} [delay=0]
     * @param {Object} params
     * @param {Number|String} [params.from.width]
     * @param {Number|String} [params.to.width]
     * @returns {TweenMax}
     */
    function baseDimensions(elements, duration, delay, params) {
        params.duration = duration || 0;
        params.delay = delay || 0;

        return engine.tween(elements, params, ['width', 'height', 'top', 'left',
                                               'maxWidth', 'maxHeight', 'minWidth', 'minHeight',
                                               'bottom', 'right', 'margin', 'padding',
                                               'marginTop', 'marginBottom', 'marginLeft', 'marginRight',
                                               'paddingTop', 'paddingBottom', 'paddingRight', 'paddingLeft', 'zIndex']);
    }

    factory.registerAnimation('BaseDimensions', baseDimensions);
});