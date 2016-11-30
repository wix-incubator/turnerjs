define(['lodash'], function (_) {
    'use strict';

    var defaultParams = {
        position: 'absolute',
        isFullScreen: false,
        getHeight: function getCompHeight(measureMap, compHeight) {
            return compHeight;
        }
    };

    var fullScreenParams = {
        position: 'fixed',
        isFullScreen: true,
        getHeight: function getWindowOrCompHeight(measureMap, compHeight) {
            return Math.max(measureMap.height.screen, compHeight);
        }
    };

    var effectNameByBehaviors = {
        BackgroundParallax: ['BackgroundParallax'],
        BackgroundReveal: ['BackgroundReveal'],
        BackgroundParallaxZoom: ['BackgroundParallax', 'BackgroundZoom'],
        BackgroundFadeIn: ['BackgroundFadeIn'],
        BackgroundBlurIn: ['BackgroundBlurIn']
    };

    var paramsByEffectMap = {
        None: defaultParams,
        BackgroundFadeIn: defaultParams,
        BackgroundBlurIn: defaultParams,
        BackgroundReveal: fullScreenParams,
        BackgroundParallax: fullScreenParams,
        BackgroundParallaxZoom: fullScreenParams
    };

    /**
     *
     * @param effectName
     * @returns {*|string}
     */
    function getPositionByEffect(effectName, renderFixedPositionBackgrounds) {
        if (paramsByEffectMap[effectName] && renderFixedPositionBackgrounds !== false) {
            return paramsByEffectMap[effectName].position;
        }
        return paramsByEffectMap.None.position;
    }

    /**
     *
     * @param effectName
     * @returns {*|string}
     */
    function isFullScreenByEffect(effectName, renderFixedPositionBackgrounds) {
        if (paramsByEffectMap[effectName] && renderFixedPositionBackgrounds !== false) {
            return paramsByEffectMap[effectName].isFullScreen;
        }
        return paramsByEffectMap.None.isFullScreen;
    }

    /**
     *effectName
     * @param effectName
     * @param measureMap
     * @param compHeight
     * @returns {*}
     */
    function getHeightByEffect(effectName, measureMap, compHeight) {
        return (paramsByEffectMap[effectName] && paramsByEffectMap[effectName].getHeight(measureMap, compHeight)) ||
            paramsByEffectMap.None.getHeight(measureMap, compHeight);
    }

    /**
     * Get data
     * @param {object} compData
     * @returns {object}
     */
    function getBgData(compDesign, compData) {
        return _.get(compDesign, 'background', _.get(compData, 'background', {}));
    }


    /**
     * Get the current effect name of a component
     * @param {string|object|undefined} behaviors
     * @param {SiteData} siteData
     * @returns {string}
     */
    function getBgEffectName(behaviors, isDesktopDevice, isMobileView) {
        if (!isDesktopDevice || isMobileView) {
            return '';
        }

        behaviors = _.isString(behaviors) ? JSON.parse(behaviors) : (behaviors || []);
        var behaviorNames = _(behaviors).where({action: 'bgScrub'}).pluck('name').sortBy().value();
        return getEffectNameByBehaviors(behaviorNames);
    }

    /**
     * Return an effect name by list of behaviors
     * @param {array} behaviorNames
     */
    function getEffectNameByBehaviors(behaviorNames) {
        return _.findKey(effectNameByBehaviors, function (effectBehaviors) {
            return _.isEqual(_.sortBy(effectBehaviors), behaviorNames);
        });
    }

    /**
     * @typedef {object} ContainerBackgroundUtils
     * Common functions for balata and container background components and layouts.
     */
    return {
        getPositionByEffect: getPositionByEffect,
        getHeightByEffect: getHeightByEffect,
        isFullScreenByEffect: isFullScreenByEffect,
        getBgData: getBgData,
        getBgEffectName: getBgEffectName
    };

});
