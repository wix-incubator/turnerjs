define(['lodash', 'dataFixer/plugins/behaviorsDataFixer'], function(_, behaviorsDataFixer) {
    'use strict';

    function getBehaviorsItemPath(comp) {
        return ['behaviors_data', comp.behaviorQuery, 'items'];
    }

    function wereBehaviorsMigrated(pageData) {
        return _.has(pageData, 'behaviors_data');
    }

    function setFixedBehaviors(behaviorArr, comp, pageData) {
         var behaviorsToSet = JSON.stringify(behaviorArr);
        if (wereBehaviorsMigrated(pageData)) {
            _.set(pageData, getBehaviorsItemPath(comp), behaviorsToSet);
        } else {
            comp.behaviors = behaviorsToSet;
        }
    }

    function getCompBehaviors(comp, pageData) {
        if (wereBehaviorsMigrated(pageData)) {
            return _.get(pageData, getBehaviorsItemPath(comp), '[]');
        }
        return comp.behaviors || '[]';
    }

    /**
     * Convert old behaviors structure to new behaviors structure
     * @param comp
     */
    function flattenBehaviors(comp, pageData) {
        var behaviorsList = [];
        var behaviorsString = getCompBehaviors(comp, pageData);
        var behaviorsObj = JSON.parse(behaviorsString);

        if (_.isEmpty(behaviorsObj)) {
            if (wereBehaviorsMigrated(pageData)) {
                delete comp.behaviorQuery;
            } else {
                delete comp.behaviors;
            }
            return;
        }

        if (_.isArray(behaviorsObj)) {
            return;
        }

        _.forEach(behaviorsObj, function (targets, actionName) {
            _.forEach(targets, function (behaviors, targetId) {
                _.forEach(behaviors, function (behavior) {
                    var extendedBehavior = _.assign({targetId: targetId, action: actionName}, behavior);
                    if (actionName === 'screenIn' || actionName === 'pageIn'){
                        extendedBehavior.targetId = '';
                    }
                    behaviorsList.push(extendedBehavior);
                });
            });
        });

        setFixedBehaviors(behaviorsList, comp, pageData);
    }

    function fixComponentBehaviors(comps, pageData) {
        _.forEach(comps, function (comp) {
            flattenBehaviors(comp, pageData);
            if (comp.components) {
                fixComponentBehaviors(comp.components, pageData);
            }
        });
    }

    /**
     * @exports utils/dataFixer/plugins/behaviorsFixer
     * @type {{exec: exec}}
     */
    var exports = {
        exec: function(pageJson) {
            behaviorsDataFixer.exec(pageJson);
            var structureData = pageJson.structure;
            if (!structureData) {
                return;
            }
            if (structureData.components) {
                fixComponentBehaviors(structureData.components, pageJson.data);
            }
            if (structureData.mobileComponents) {
                fixComponentBehaviors(structureData.mobileComponents, pageJson.data);
            }
            if (structureData.children) {
                fixComponentBehaviors(structureData.children, pageJson.data);
            }
        }
    };

    return exports;
});
