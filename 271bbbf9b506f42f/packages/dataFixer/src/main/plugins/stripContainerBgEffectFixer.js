define(['lodash', 'dataFixer/helpers/behaviorsMigrationHelper'], function(_, behaviorsMigrationHelper) {
    'use strict';

    var compTypes = [
        'wysiwyg.viewer.components.StripContainer',
        'wysiwyg.viewer.components.StripContainerSlideShowSlide'
    ];

    var effectsMap = {
        'fixed': {action: 'bgScrub', name: 'BackgroundReveal', duration: 1, delay: 0},
        'parallax': {action: 'bgScrub', name: 'BackgroundParallax', duration: 1, delay: 0}
    };

    function getCompBehaviors(comp, behaviorsData) {
        var behaviorsStr = _.get(behaviorsData, [comp.behaviorQuery, 'items'], '[]');
        return JSON.parse(behaviorsStr);
    }

    function getContainerBgData (comp, data) {
        var bgRef;
        var dataRef;

        // Get Data Item
        dataRef = comp.designQuery.replace('#', '');
        bgRef = data[dataRef].background.replace('#', '');
        return data[bgRef];
    }

    function changeScrollTypeToBehavior(comp, data, behaviorsData){
        var behaviors;
        var scrollType;

        if (!_.includes(compTypes, comp.componentType)){
            return;
        }

        var containerBgData = getContainerBgData(comp, data);
        scrollType = containerBgData.scrollType;
        containerBgData.scrollType = 'none';

        // If scrollType === scroll just set to 'none' else add/or remove ContainerFixedBg behavior
        if (scrollType !== 'scroll' && scrollType !== 'none'){
            behaviors = getCompBehaviors(comp, behaviorsData);
            behaviors = _.reject(behaviors, {name: 'ContainerFixedBg', action: 'bgScrub'});
            behaviors.push(effectsMap[scrollType]);
            var behaviorsToSet = JSON.stringify(behaviors);

            if (comp.behaviorQuery) {
                _.set(behaviorsData, [comp.behaviorQuery, 'items'], behaviorsToSet);
            } else {
                var behaviorsDataItem = behaviorsMigrationHelper.createBehaviorsDataItem(behaviorsToSet);
                _.set(behaviorsData, behaviorsDataItem.id, behaviorsDataItem);
                comp.behaviorQuery = behaviorsDataItem.id;
            }
        }
    }

    function removeScrollTypeOldBehavior(comp, data, behaviorsData){
        var behaviors;

        if (!_.includes(compTypes, comp.componentType)){
            return;
        }

        var containerBgData = getContainerBgData(comp, data);
        containerBgData.scrollType = 'none';

        behaviors = getCompBehaviors(comp, behaviorsData);
        behaviors = _.reject(behaviors, {name: 'ContainerFixedBg', action: 'bgScrub'});
        if (_.isEmpty(behaviors)){
            delete comp.behaviors;
            delete comp.behaviorQuery;
        } else {
            _.set(behaviorsData, [comp.behaviorQuery, 'items'], JSON.stringify(behaviors));
        }
    }

    function fixBackgroundEffect(comps, data, behaviorsData) {
        _.forEach(comps, function (comp) {
            changeScrollTypeToBehavior(comp, data, behaviorsData);
            if (comp.components) {
                fixBackgroundEffect(comp.components, data, behaviorsData);
            }
        });
    }

    function removeOldBackgroundEffect(comps, data, behaviorsData){
     _.forEach(comps, function (comp) {
            removeScrollTypeOldBehavior(comp, data, behaviorsData);
            if (comp.components) {
                removeOldBackgroundEffect(comp.components, data, behaviorsData);
            }
        });
    }

    /**
     * @exports utils/dataFixer/plugins/behaviorsFixer
     * @type {{exec: exec}}
     */
    var exports = {
        exec: function(pageJson) {
            var structureData = pageJson.structure;
            var data;
            if (!structureData) {
                return;
            }

            data = pageJson.data.design_data;
            var behaviorsData = pageJson.data.behaviors_data;

            //Page
            if (structureData.components) {
                fixBackgroundEffect(structureData.components, data, behaviorsData);
            }
            //MasterPage
            if (structureData.children) {
                fixBackgroundEffect(structureData.children, data, behaviorsData);
            }
            // Mobile - Remove!
            if (structureData.mobileComponents) {
                removeOldBackgroundEffect(structureData.mobileComponents, data, behaviorsData);
            }
        }
    };

    return exports;
});
