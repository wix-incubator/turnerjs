define(['lodash', 'utils'], function (_, utils) {
    'use strict';

    var balataConsts = utils.balataConsts;

    var behaviorsMap = {
        'FadeIn': {type: 'animation', defaults: {params: {}}},
        'FadeOut': {type: 'animation', defaults: {params: {}}},
        'Scale': {type: 'animation', defaults: {params: {scale: 1}}}
    };

    /**
     * Get reference to the balata related to this action
     * @param {SiteAPI} siteAPI
     * @param {string} pageId
     * @param {string} id
     * @returns {string}
     */
    function getBalataRef(siteAPI, pageId, id) {
        var compsInPage = siteAPI.getComponentsByPageId(pageId);
        var compsInMasterPage = siteAPI.getComponentsByPageId('masterPage');
        var comp = compsInPage[id] || compsInMasterPage[id];
        return comp.refs.balata;
    }

    /**
     * Get the behavior to be passed along to the next handler (e.g. animationBehaviorHandler)
     * @param {string} compId
     * @param {object} behaviorDef
     * @param {object} transformParams
     * @param {object} nextTransforms
     * @returns {{}}
     */
    function getParsedBehavior(compId, behaviorDef, transformParams, nextTransforms) {
        var newBehavior = {
            name: behaviorDef.name,
            type: behaviorDef.type,
            targetId: [[compId, utils.balataConsts.BALATA, behaviorDef.part]],
            params: _.clone(behaviorDef.params) || {}

        };
        // Assign transformations from data to behavior
        if (!_.isEmpty(transformParams)) {
            _.assign(newBehavior.params, transformParams, _.pick(nextTransforms, _.keys(transformParams)));
        }
        return newBehavior;
    }

    /**
     * Get the state to send back to balata
     * @param {object} previousDesignData
     * @param {array<object>} behaviorDefs
     * @returns {{}}
     */
    function getTransformState(previousDesignData, behaviorDefs) {
        var parts = _(behaviorDefs).map('part').uniq().value();

        var transformParamsByParts = _.transform(behaviorDefs, function (result, def) {
            var paramsFromMap = _.get(behaviorsMap, [def.name, 'defaults', 'params']);
            result[def.part] = _.assign({}, result[def.part], paramsFromMap);
        }, {});

        var transformState = _.transform(parts, function (result, part) {
            var previousPartTransforms = _.get(previousDesignData, ['background', balataConsts[part]]);
            result[part] = _.merge({}, transformParamsByParts[part], _.pick(previousPartTransforms, _.keys(transformParamsByParts[part])));
        }, {});

        return transformState;
    }

    /**
     * Clear previous animations
     * @param siteAPI
     * @param groupName
     * @param shouldSeek
     * @param seekValue
     */
    function clearPreviousAnimations(siteAPI, groupName) {
        var animAspect = siteAPI.getSiteAspect('animationsAspect');
        animAspect.stopAndClearAnimations(groupName);
    }

    /**
     * Call handlers for behaviors and return the transformed values for each balata part
     * @param {SiteAPI} siteAPI
     * @param {string} compId
     * @param {object} nextData
     * @param {object} collectedBehaviorsDefs
     * @returns {{}}
     */
    function executeBehaviors(siteAPI, compId, nextData, collectedBehaviorsDefs) {
        var behaviorsAspect = siteAPI.getSiteAspect('behaviorsAspect');
        _.forEach(collectedBehaviorsDefs, function (def) {
            var nextTransforms = _.get(nextData, ['background', balataConsts[def.part]], {});
            var paramsFromMap = _.get(behaviorsMap, [def.name, 'defaults', 'params']);

            // Send to behavior to new handler (by type)
            behaviorsAspect.handleBehavior(getParsedBehavior(compId, def, paramsFromMap, nextTransforms), {group: compId});
        });
    }

    /**
     * Collect behaviors from design data
     * @param {object} prevData
     * @param {object} nextData
     * @returns {array<object>}
     */
    function collectBehaviorsDefs(prevData, nextData) {
        var collected = [];
        // get all out behaviors
        _.forEach(_.filter(prevData.dataChangeBehaviors, {trigger: 'out'}), function (behavior) {
            collected.push(behavior);
        });
        // get only in behaviors that doesn't collide with outs
        _.forEach(_.filter(nextData.dataChangeBehaviors, {trigger: 'in'}), function (behavior) {
            if (!_.find(collected, _.pick(behavior, ['type', 'part', 'name']))) {
                collected.push(behavior);
            }
        });

        return collected;
    }

    /**
     * Call handlers for behaviors and set the state of calling balata with transformed values
     * @param {SiteAPI} siteAPI
     * @param {string} compId
     * @param {object} previousData
     * @param {object} nextData
     */
    function executeBehaviorsAndSetState(siteAPI, compId, previousData, nextData) {
        var pageId = siteAPI.getSiteData().getFocusedRootId();
        var balataRef = getBalataRef(siteAPI, pageId, compId);
        var previousDesignData = previousData || {};
        // Get behaviors definitions from data
        var collectedBehaviorsDefs = collectBehaviorsDefs(previousData, nextData);

        // TODO: we need to find a way to not 'know' what animations are here.
        clearPreviousAnimations(siteAPI, compId);
        // Execute behaviors handler for collected behaviors and return transformed values
        executeBehaviors(siteAPI, compId, nextData, collectedBehaviorsDefs);
        // Set state on balata with revised transform values
        balataRef.setState({
            transforms: getTransformState(previousDesignData, collectedBehaviorsDefs)
        });

    }

    /**
     * Handle design data behaviors
     * @param {SiteAPI} siteAPI
     * @param {string} compId
     * @param {object} previousData
     * @param {object} nextData
     */
    function handle(siteAPI, compId, previousData, nextData) {
        if (!(previousData.dataChangeBehaviors || nextData.dataChangeBehaviors)) {
            return;
        }
        executeBehaviorsAndSetState(siteAPI, compId, previousData, nextData);
    }

    return {
        handle: handle
    };
});
