define([
    'lodash',
    'documentServices/actionsAndBehaviors/allowedGroupsByCompType',
    'documentServices/actionsAndBehaviors/actionsEditorSchema',
    'documentServices/actionsAndBehaviors/behaviorsEditorSchema',
    'documentServices/actionsAndBehaviors/pageTransitionsEditorSchema',
    'documentServices/component/componentStructureInfo',
    'documentServices/constants/constants',
    'documentServices/dataModel/dataModel'
], function(_,
            allowedGroups,
            actionsEditorSchema,
            behaviorsEditorSchema,
            pageTransitionsEditorSchema,
            componentStructureInfo,
            constants,
            dataModel
) {
    'use strict';

    var ACTION_PROPS_TO_COMPARE = ['sourceId', 'type', 'name'];
    var BEHAVIOR_PROPS_TO_COMPARE = ['targetId', 'type', 'name', 'part'];

    /**
     * Structure of behaviors object that can be saved to a component:
     * @example
     * [
     *      {
     *          "action":"screenIn"
     *          "targetId":"Clprt0-wl2"
     *          "name":"SpinIn",
     *          "duration":"2.45",
     *          "delay":"1.60",
     *          "params":{"cycles":5,"direction":"cw"},
     *          "playOnce":true
     *      }
     * ]
     *
     * @typedef {Array<SavedBehavior>} SavedBehaviorsList
     * @property {String} actionName
     * @property {String} targetId
     */

    var allowedBehaviorKeys = ['action', 'targetId', 'name', 'duration', 'delay', 'params', 'playOnce', 'type'];

    // Static getters

    /**
     * Names of available actions, sorted a-z
     * @returns {Array}
     */
    function getActionNames() {
        return _.sortBy(_.keys(actionsEditorSchema.getSchema()));
    }

    /**
     * Return the definition containing settings and parameters of an action
     * @param {PrivateDocumentServices} privateServices
     * @param {String} actionName
     * @returns {Object|undefined}
     */
    function getActionDefinition(privateServices, actionName) {
        if (_.has(actionsEditorSchema.getSchema(), actionName)) {
            // TODO: obviosuly that type is not always 'comp', needs to be finished

            return {
                type: 'comp',
                name: actionName
            };
        }
    }

    /**
     * Return the definition containing settings and parameters of a behavior
     * @param {PrivateDocumentServices} privateServices
     * @param {String} behaviorName
     * @returns {Object|undefined}
     */
    function getBehaviorDefinition(privateServices, behaviorName) {
        return _.cloneDeep(_.find(behaviorsEditorSchema, {name: behaviorName}));
    }

    /**
     * Get names of behaviors.
     * Filter by optional compType and/or actionName
     * @param {PrivateDocumentServices} privateServices
     * @param {String} [compType]
     * @param {String} [actionName]
     * @returns {Array}
     */
    function getBehaviorNames(privateServices, compType, actionName) {
        var behaviors = behaviorsEditorSchema;

        if (compType) {
            var shortCompType = _.last(compType.split('.'));
            var compTypeGroups = allowedGroups.getSchema()[shortCompType] || allowedGroups.getSchema().AllComponents;

            if (_.isEmpty(compTypeGroups)) {
                behaviors = [];
            } else {
                behaviors = _.filter(behaviors, function(behavior) {
                    return _(compTypeGroups)
                        .union(behavior.groups)
                        .xor(compTypeGroups)
                        .isEmpty();
                });
            }
        }

        if (actionName) {
            behaviors = _.filter(behaviors, function(behavior) {
                return _(actionsEditorSchema.getSchema()[actionName].groups)
                    .union(behavior.groups)
                    .xor(behavior.groups)
                    .isEmpty();
            });
        }

        return _(behaviors).map('name').sortBy().value();
    }

    /**
     * A wrapper for getBehaviorNames that returns false if the list of behaviors returns empty, and true otherwise
     * @param {PrivateDocumentServices} privateServices
     * @param {AbstractComponent} componentPointer
     * @param {String} [actionName]
     * @returns {Boolean}
     */
    function isBehaviorable(privateServices, compRef, actionName){
        var compType = componentStructureInfo.getType(privateServices, compRef);
        var hasBehaviors = !_.isEmpty(getBehaviorNames(privateServices, compType, actionName));
        return hasBehaviors;
    }

    // Component Getters

    /**
     * Returns the behaviors saved on a component structure
     * @param {PrivateDocumentServices} privateServices
     * @param {AbstractComponent} componentPointer
     * @returns {Array<SavedBehavior>|null}
     */
    function getComponentBehaviors(privateServices, componentPointer) {
        var compBehaviors = getBehaviors(privateServices, componentPointer);
        return _.isEmpty(compBehaviors) ? null : compBehaviors;
    }

    // Component Setters

    /**
     * Set a behavior to a component structure,
     * will override any previous behavior with same name and action (one type of behavior per one type of action)
     * @param {PrivateDocumentServices} privateServices
     * @param {AbstractComponent} componentPointer
     * @param {SavedBehavior} behavior
     * @param {String} [actionName]
     */
    function setComponentBehavior(privateServices, componentPointer, behavior, actionName) {
        if (actionName) {
            behavior.action = actionName;
        }
        var compType = componentStructureInfo.getType(privateServices, componentPointer);
        var validationMessage = validateBehavior(privateServices, behavior, compType);
        if (validationMessage.type === 'error') {
            throw new Error(validationMessage.message);
        }

        var behaviors = getComponentBehaviors(privateServices, componentPointer);
        behaviors = (behaviors) ? _.reject(behaviors, {action: behavior.action, name: behavior.name}) : [];

        updateBehaviorsInDAL(privateServices, componentPointer, behaviors.concat(behavior));
    }

    function updateBehavior(privateServices, actionSourceRef, action, behaviorTargetRef, behavior) {
        var existingBehaviors = getBehaviors(privateServices, actionSourceRef);
        var updatedBehaviorObject = {
            action: _.defaults({sourceId: actionSourceRef.id}, action),
            behavior: _.defaults({targetId: behaviorTargetRef.id}, behavior)
        };

        var isEqualToUpdatedBehaviorObject = _.partial(areBehaviorObjectsEqual, updatedBehaviorObject);
        var updatedBehaviors = _.reject(existingBehaviors, isEqualToUpdatedBehaviorObject).concat(updatedBehaviorObject);

        updateBehaviorsInDAL(privateServices, actionSourceRef, updatedBehaviors);
    }

    function areActionsEqual(action1, action2) {
        return _.isEqual(
            _.pick(action1, ACTION_PROPS_TO_COMPARE),
            _.pick(action2, ACTION_PROPS_TO_COMPARE)
        );
    }

    function areBehaviorsEqual(behavior1, behavior2) {
        return _.isEqual(
            _.pick(behavior1, BEHAVIOR_PROPS_TO_COMPARE),
            _.pick(behavior2, BEHAVIOR_PROPS_TO_COMPARE)
        );
    }

    function areBehaviorObjectsEqual(behaviorObj1, behaviorObj2) {
        return areActionsEqual(behaviorObj1.action, behaviorObj2.action) &&
               areBehaviorsEqual(behaviorObj1.behavior, behaviorObj2.behavior);
    }

    function removeBehavior(privateServices, actionSourceRef, action, behaviorTargetRef, behavior) {
        var existingBehaviors = getBehaviors(privateServices, actionSourceRef);
        var behaviorObjectToRemove = {
            action: _.defaults({sourceId: actionSourceRef.id}, action),
            behavior: _.defaults({targetId: behaviorTargetRef.id}, behavior)
        };

        var shouldRemoveBehavior = _.partial(areBehaviorObjectsEqual, behaviorObjectToRemove);
        var updatedBehaviors = _.reject(existingBehaviors, shouldRemoveBehavior);

        if (updatedBehaviors.length !== existingBehaviors.length) {
            updateBehaviorsInDAL(privateServices, actionSourceRef, updatedBehaviors);
        }
    }

    function hasBehavior(privateServices, actionSourceRef, action, behaviorTargetRef, behavior) {
        var existingBehaviors = getBehaviors(privateServices, actionSourceRef);
        var behaviorObjectToSeek = {
            action: _(actionSourceRef && {sourceId: actionSourceRef.id}).defaults(action).pick(ACTION_PROPS_TO_COMPARE).value(),
            behavior: _(behaviorTargetRef && {targetId: behaviorTargetRef.id}).defaults(behavior).pick(BEHAVIOR_PROPS_TO_COMPARE).value()
        };

        return _.some(existingBehaviors, behaviorObjectToSeek);
    }

    function getBehaviors(privateServices, actionSourceRef) {
        var behaviors = dataModel.getBehaviorsItem(privateServices, actionSourceRef);
        return behaviors ? JSON.parse(behaviors) : [];
    }

    function updateBehaviorsInDAL(privateServices, componentPointer, behaviors) {
        var behaviorsToSet = JSON.stringify(behaviors);
        if (_.isEmpty(behaviors)) {
            dataModel.removeBehaviorsItem(privateServices, componentPointer);
        } else {
            dataModel.updateBehaviorsItem(privateServices, componentPointer, behaviorsToSet);
        }
    }

    /**
     * Remove a single behavior from a component structure
     * @param {PrivateDocumentServices} privateServices
     * @param {AbstractComponent} componentPointer
     * @param {SavedBehavior|String} [behavior]
     * @param {String} actionName
     * @deprecated
     */
    function removeComponentSingleBehavior(privateServices, componentPointer, behavior, actionName) {
        var behaviors = getComponentBehaviors(privateServices, componentPointer);
        var toRemove = {
            action: actionName
        };

        if (_.isString(behavior)) {
            toRemove.name = behavior;
        } else if (_.isObject(behavior)) {
            toRemove = _.assign(toRemove, behavior);
        }

        behaviors = (behaviors) ? _.reject(behaviors, toRemove) : [];
        updateBehaviorsInDAL(privateServices, componentPointer, behaviors);
    }

    /**
     * Remove behaviors from a component structure
     * @param {PrivateDocumentServices} privateServices
     * @param {AbstractComponent} componentPointer
     */
    function removeComponentBehaviors(privateServices, componentPointer) {
        updateBehaviorsInDAL(privateServices, componentPointer, []);
    }

    /**
     *
     * @param {PrivateDocumentServices} privateServices
     * @param {AbstractComponent} componentPointer
     * @param {{action: {}|undefined, behavior: {}|undefined}} filterObject this will be used to filter  behaviors to remove
     */
    function removeComponentsBehaviorsWithFilter(privateServices, componentPointer, filterObject){
        var behaviors = getComponentBehaviors(privateServices, componentPointer);

        behaviors = (behaviors) ? _.reject(behaviors, filterObject) : [];
        updateBehaviorsInDAL(privateServices, componentPointer, behaviors);
    }

    // Page

    function getPageGroupTransitionsPointer(privateServices, viewMode) {
        var page = privateServices.pointers.components.getMasterPage(viewMode);
        var pageGroupPointer = privateServices.pointers.components.getComponent(constants.COMP_IDS.PAGE_GROUP, page);
        var propertiesPointer = dataModel.getPropertyItemPointer(privateServices, pageGroupPointer);
        return privateServices.pointers.getInnerPointer(propertiesPointer, 'transition');
    }

    /**
     * Set the pages transition
     * @param {PrivateDocumentServices} privateServices
     * @param {String} transitionName
     */
    function setPagesTransition(privateServices, transitionName) {
        if (!_.includes(getPageTransitionsNames(), transitionName)) {
            throw new Error('No such transition ' + transitionName);
        }
        var transitionPointer = getPageGroupTransitionsPointer(privateServices, constants.VIEW_MODES.DESKTOP);

        privateServices.dal.set(transitionPointer, transitionName);

    }

    /**
     * Get the current pages transition
     * @param {PrivateDocumentServices} privateServices
     * @returns {String}
     */
    function getPagesTransition(privateServices){
        var transitionPointer = getPageGroupTransitionsPointer(privateServices, constants.VIEW_MODES.DESKTOP);
        return privateServices.dal.get(transitionPointer);
    }

    /**
     * Returns the names of *legacy* transitions sorted a-z
     * @todo: this will change when we will have transition per page
     * @returns {Array}
     */
    function getPageTransitionsNames() {
        return _.sortBy(_.pluck(pageTransitionsEditorSchema, 'legacyName'));
    }

    // Preview

    /**
     * Trigger an action
     * @param {PrivateDocumentServices} privateServices
     * @param {String} actionName
     */
    function executeAction(privateServices, actionName) {
        var actionsAspect = privateServices.siteAPI.getSiteAspect('actionsAspect');
        actionsAspect.executeAction(actionName);
    }

    /**
     * @deprecated
     */
    function deprecatedPreviewAnimation(privateServices, componentReference, animationDef, transformationsToRestore, onComplete){
        return previewAnimation(privateServices, componentReference, animationDef, onComplete);
    }

    /**
     * Preview an animation on a component
     * @param {PrivateDocumentServices} privateServices
     * @param {AbstractComponent} componentReference
     * @param {{name:string, duration:number, delay:number, params:object}} animationDef
     * @param {function} onComplete a callback to run at the end of the preview animation
     * @returns {string} sequence id (to be used with stopPreview)
     */
    function previewAnimation(privateServices, componentReference, animationDef, onComplete) {
        var actionsAspect = privateServices.siteAPI.getSiteAspect('actionsAspect');
        var componentPointers = privateServices.pointers.components;
        return actionsAspect.previewAnimation(componentReference.id, componentPointers.getPageOfComponent(componentReference).id, animationDef, onComplete);
    }

    /**
     * Preview a transition on 2 or more components
     * @param {PrivateDocumentServices} privateServices
     * @param {AbstractComponent|Array<AbstractComponent>} srcCompReference (or an array)
     * @param {AbstractComponent|Array<AbstractComponent>} targetCompReference (or an array)
     * @param {{name:string, duration:number, delay:number, params:object}} transitionDef
     * @param {function} onComplete a callback to run at the end of the preview animation
     * @returns {string} sequence id (to be used with stopPreview)
     */
    function previewTransition(privateServices, srcCompReference, targetCompReference, transitionDef, onComplete) {
        var actionsAspect = privateServices.siteAPI.getSiteAspect('actionsAspect');
        var componentPointers = privateServices.pointers.components;
        var srcRefs = _.isArray(srcCompReference) ? srcCompReference : [srcCompReference];
        var targetRefs = _.isArray(targetCompReference) ? targetCompReference : [targetCompReference];
        var firstCompRef = srcRefs.length > 0 ? srcRefs[0] : targetRefs[0];
        return actionsAspect.previewTransition(_.map(srcRefs, 'id'), _.map(targetRefs, 'id'),
            componentPointers.getPageOfComponent(firstCompRef).id, transitionDef, onComplete);
    }

    /**
     * @deprecated
     */
    function deprecatedStopPreviewAnimation(privateServices, componentReference, sequenceId){
        stopPreviewAnimation(privateServices, sequenceId);
    }

    /**
     * Stop animation preview by sequence id returned by previewAnimation
     * @param {PrivateDocumentServices} privateServices
     * @param {string} sequenceId
     */
    function stopPreviewAnimation(privateServices, sequenceId) {
        var actionsAspect = privateServices.siteAPI.getSiteAspect('actionsAspect');
        actionsAspect.stopPreviewAnimation(sequenceId);
    }

    // Privates

    /**
     * Validate a behavior structure.
     * @example
     *
     *      {
     *          "action":"screenIn"
     *          "targetId":"Clprt0-wl2"
     *          "name":"SpinIn",
     *          "duration":"2.45",
     *          "delay":"1.60",
     *          "params":{"cycles":5,"direction":"cw"},
     *          "playOnce":true
     *      }
     *
     *
     * @param {PrivateDocumentServices} privateServices
     * @param {SavedBehavior} behavior
     * @param {String} compType
     */
    function validateBehavior(privateServices, behavior, compType) {

        var message = {
            type: 'ok',
            message: ''
        };

        var compTypeBehaviors = getBehaviorNames(privateServices, compType);

        if (!_.includes(compTypeBehaviors, behavior.name)) {
            message.type = 'error';
            message.message += 'Behavior of type ' + behavior.name + ' is not allowed on component of type ' + compType;
        } else if (!_.isPlainObject(behavior)) {
            // Check if action is an object
            message.type = 'error';
            message.message += 'Each behavior should be an object\n';
        } else if (_.isEmpty(behavior)) {
            message.type = 'error';
            message.message += 'Behavior can not be empty\n';
        } else {

            var actionNames = getActionNames();
            if (!_.includes(actionNames, behavior.action)) {
                message.type = 'error';
                message.message += 'Action of type ' + behavior.action + ' does not exist\n';
            }

            var actionBehaviors = getBehaviorNames(privateServices, null, behavior.action);
            if (!_.includes(actionBehaviors, behavior.name)){
                message.type = 'error';
                message.message += 'Behavior of type ' + behavior.name + ' is not allowed on action ' + behavior.action;
            }

            //if (!behavior.targetId) {
            //    message.type = 'error';
            //    message.message += 'Target Id has to be specified, even if the source component is the target\n';
            //}

            if (_.isNaN(Number(behavior.duration))) {
                message.type = 'error';
                message.message += 'Animation duration must be a number\n';
            }

            if (_.isNaN(Number(behavior.delay))) {
                message.type = 'error';
                message.message += 'Animation delay must be a number\n';
            }

            if (behavior.params && !_.isPlainObject(behavior.params)) {
                message.type = 'error';
                message.message += 'Animation params property are optional, but if they exist params must be an object\n';
            }

            if (behavior.playOnce && !_.isBoolean(behavior.playOnce)) {
                message.type = 'error';
                message.message += 'Animation playOnce property is optional, but if is exists playOnce must be a boolean\n';
            }

            var redundantKeys = _.difference(_.uniq(_.keys(behavior).concat(allowedBehaviorKeys)), allowedBehaviorKeys);
            if (!_.isEmpty(redundantKeys)) {
                message.type = 'error';
                message.message += 'The keys [' + redundantKeys + '] are not allowed values of a Behavior';
            }
        }

        return message;
    }

    function executeAnimationsInPage(ps){
        var actionsAspect = ps.siteAPI.getSiteAspect('actionsAspect');
        actionsAspect.reloadPageAnimations();
    }

    return {
        // Static lists
        getActionNames: getActionNames,
        getActionDefinition: getActionDefinition,
        getBehaviorDefinition: getBehaviorDefinition,
        getBehaviorNames: getBehaviorNames,
        isBehaviorable: isBehaviorable,

        // Component getters
        getComponentBehaviors: getComponentBehaviors,

        // component setters
        setComponentBehavior: setComponentBehavior,
        /** @deprecated */
        removeComponentSingleBehavior: removeComponentSingleBehavior,
        removeComponentBehaviors: removeComponentBehaviors,
        removeComponentsBehaviorsWithFilter: removeComponentsBehaviorsWithFilter,

        updateBehavior: updateBehavior,
        removeBehavior: removeBehavior,
        getBehaviors: getBehaviors,
        hasBehavior: hasBehavior,

        // Page transitions
        getPageTransitionsNames: getPageTransitionsNames,
        getPagesTransition: getPagesTransition,
        setPagesTransition: setPagesTransition,

        // Preview
        executeAction: executeAction,
        deprecatedPreviewAnimation: deprecatedPreviewAnimation,
        deprecatedStopPreviewAnimation: deprecatedStopPreviewAnimation,
        previewAnimation: previewAnimation,
        previewTransition: previewTransition,
        stopPreviewAnimation: stopPreviewAnimation,

        executeAnimationsInPage: executeAnimationsInPage
    };

});
