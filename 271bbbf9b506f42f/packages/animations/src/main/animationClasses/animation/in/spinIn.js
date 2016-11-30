define(['lodash', 'animations/localTweenEngine/localTweenEngine'], function(_, tweenEngine) {
    'use strict';

    /** core.animationsFactory */
    var factory = tweenEngine.factory;


    var paramsMap = {
        cw: {direction: '-1'},
        ccw: {direction: '1'}
    };

    /**
     * SpinIn animation object
     * @param {Array<HTMLElement>|HTMLElement} elements DOM element to animate
     * @param {Number} [duration]
     * @param {Number} [delay]
     * @param {Object} [params]
     * @param {String} [params.direction=cw] 'cw' for clock wise or 'ccw' for counter clock wise
     * @param {Number} [params.cycles=5]
     * @returns {TimelineMax}
     */
    function spinIn(elements, duration, delay, params) {
        var direction = (params.direction || 'cw');
        var cycles = params.cycles || 5;
        delete params.direction;
        delete params.cycles;

        var fromParams = _.clone(paramsMap[direction]);
        var transformRotate = ((fromParams.direction > 0) ? '+=' : '-=') + 360 * cycles;

        var sequence = factory.sequence(params);

        sequence.add([
            factory.animate('BaseFade', elements, duration, delay, {from: {opacity: 0}, to: {opacity: 1}, ease: 'Sine.easeIn'}),
            factory.animate('BaseScale', elements, duration, delay, {from: {scale: 0}, ease: 'Sine.easeOut'}),
            factory.animate('BaseRotate', elements, duration, delay, {from: {rotation: transformRotate}, ease: 'Sine.easeIn'})
        ]);

        return sequence.get();
    }

    spinIn.properties = {
        hideOnStart: true
    };

    factory.registerAnimation('SpinIn', spinIn);
});