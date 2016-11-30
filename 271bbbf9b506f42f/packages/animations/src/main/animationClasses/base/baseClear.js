define(['lodash', 'animations/localTweenEngine/localTweenEngine'], function (_, tweenEngine) {
    'use strict';

    /** core.animations.tweenEngineGreenSock */
    var engine = tweenEngine.engine;
    /** core.animationsFactory */
    var factory = tweenEngine.factory;

    var cssToRestore = [
        {
            domAttr: 'data-angle',
            gsapAttr: 'rotation'
        },
        {
            domAttr: 'data-scale',
            gsapAttr: 'scale'
        }
    ];

    /**
     * Clearing animation object
     * @param {Array<HTMLElement>|HTMLElement} elements DOM elements
     * @param {Number} [duration=0] Duration has no meaning here, remains for API compliance
     * @param {Number} [delay=0]
     * @param {Object} params
     * @param {String} params.props coma separated props to clear on elements
     * @param {String} [params.parentProps] coma separated props to clear on elements parents
     * @returns {TimelineMax}
     */
    function baseClear(elements, duration, delay, params) {
        var elementParams, parentParams;

        duration = 0;
        elements = elements.length ? elements : [elements];
        var parents = _.uniq(_.map(elements, 'parentNode'));

        elementParams = _.defaults({
            duration: duration,
            delay: delay || 0,
            to: {},
            clearProps: params.props
        }, params);

        delete elementParams.props;
        delete elementParams.parentProps;

        if (params.parentProps) {
            parentParams = _.cloneDeep(elementParams);
            parentParams.delay = 0;
            parentParams.clearProps = params.parentProps;
        }

        var sequence = factory.sequence({
            callbacks: {
                onComplete: clearGsTranforms.bind(this, elements)
            }
        });

        sequence.add(engine.tween(elements, elementParams, []));
        if (parentParams) {
            sequence.add(engine.tween(parents, parentParams, []));
        }

        restoreCss(elements, sequence);

        return sequence.get();
    }

    function restoreCss(elements, sequence) {
        _.forEach(elements, function (element) {
            var restoreParams = {};
            var defaultParams = {
                duration: 0,
                delay: 0,
                immediateRender: false
            };
            _.forEach(cssToRestore, function (item) {
                var value = element.getAttribute(item.domAttr);
                if (value) {
                    restoreParams[item.gsapAttr] = value;
                }
            });
            if (!_.isEmpty(restoreParams)){
                sequence.add(engine.tween(element, _.assign(restoreParams, defaultParams), _.keys(restoreParams)));
            }
        });
    }

    function clearGsTranforms(elements){
        _.forEach(elements, function(element){
            delete element._gsTransform;
        });
    }

    factory.registerAnimation('BaseClear', baseClear);
});
