define(['lodash', 'animations/localTweenEngine/localTweenEngine'], function(_, tweenEngine) {
    'use strict';

    /** core.animations.tweenEngineGreenSock */
    var engine = tweenEngine.engine;
    /** core.animationsFactory */
    var factory = tweenEngine.factory;

    /**
     * Safari (All versions, even 8) has a bug with css 3d transforms -
     * it requires the animated element parent to have it's own rendering context or else the 3d animations
     * intersect with the background and with each other.
     *
     * With this hack we add a counter for the parent element of the animated elements that keeps track on
     * how many 3d animations happen right now inside this parent.
     * in viewer.css we have this code:
     *
     *   [data-z-counter]{z-index:0;}
     *   [data-z-counter="0"]{z-index:auto;}
     *
     * that adds z-index to the parent while 3d animations are running.
     * @param parents
     */
    function increment3dAnimationsCounter(parents) {
        _.forEach(parents, function(parent) {
            var zCounter = parent.getAttribute('data-z-counter');
            zCounter = (zCounter) ? Number(zCounter) : 0;
            parent.setAttribute('data-z-counter', zCounter + 1);
        });
    }

    /**
     * This is the second part of the Safari hack, this time we decrement the counter after the animation is complete.
     * @param sequence
     * @param parents
     */
    function decrement3dAnimationsCounter(parents, sequence) {
        sequence.add(engine.set(parents, {attr: {'data-z-counter': '-=1'}, immediateRender: false}));
    }

    /**
     * Rotate 3D animation object
     * @param {Array<HTMLElement>|HTMLElement} elements DOM elements
     * @param {Number} [duration=1.0]
     * @param {Number} [delay=0]
     * @param {Object} params
     * @param {Number} [params.perspective]
     * @param {Number} [params.from.rotationX] in Deg
     * @param {Number} [params.from.rotationY] in Deg
     * @param {Number} [params.from.rotationZ] in Deg
     * @param {Number} [params.to.rotationX] in Deg
     * @param {Number} [params.to.rotationY] in Deg
     * @param {Number} [params.to.rotationZ] in Deg
     * @param {boolean} [params.fallbackFor3D=false] Use 'scale' instead of 'rotate' to emulate 3d rotation on non supporting browsers. default is 'false'
     * @returns {TimelineMax}
     */
    function baseRotate3D(elements, duration, delay, params) {
        var allowedParams = ['rotationX', 'rotationY', 'rotationZ'];
        //TODO: We need to fix or css cleaning technique.
        //TODO: this setting is actually never read
        elements = (elements.length) ? elements : [elements];
        var parents = _.uniq(_.map(elements, 'parentNode'));

        params = _.cloneDeep(params || {});
        params.duration = duration || 0;
        params.delay = delay || 0;

        var perspective = params.perspective;

        delete params.perspective;
        delete params.fallbackFor3D;

        var sequence = factory.sequence();

        increment3dAnimationsCounter(parents);

        sequence
            .add(engine.set(elements, {transformPerspective: perspective}), 0)
            .add(engine.tween(elements, params, allowedParams));

        decrement3dAnimationsCounter(parents, sequence);

        return sequence.get();

    }

    factory.registerAnimation('BaseRotate3D', baseRotate3D);
});