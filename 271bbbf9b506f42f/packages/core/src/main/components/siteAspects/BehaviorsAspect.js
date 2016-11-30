define([
    'lodash',
    'core/components/behaviorHandlers/behaviorHandlersFactory',
    'core/components/siteAspects/behaviorsService'
], function (_, behaviorHandlersFactory, behaviorsService) {
    "use strict";

    /**
     *
     * @typedef {object} Action
     * @property {string} type
     * @property {string} name
     * @property {string} [sourceId]
     */

    /**
     *
     * @typedef {object} Behavior
     * @property {string} type
     * @property {string} name
     * @property {string} [targetId]
     * @property {object} [params]
     */

    // Identifier fields should be in sync with documentServices actionsAndBehaviors.js ACTION/BEHAVIORS_PROPS_TO_COMPARE
    var actionIdentifierFields = ['sourceId', 'type', 'name'];
    var behaviorIdentifierFields = ['targetId', 'type', 'name', 'part'];

    function uniqueBehaviorIdentifier(behavior) {
        var handler = behaviorHandlersFactory.getHandler(behavior.type);
        if (handler.getUniqueIdentifier) {
            return handler.getUniqueIdentifier(behavior);
        }
        return _(behavior)
                .at(behaviorIdentifierFields)
                .map(function(field){
                    return _.isPlainObject(field) ? _.values(field) : field;
                })
                .join();
        //return _.at(behavior, behaviorIdentifierFields).join(',');
    }

    function uniqueActionIdentifier(action) {
        return _.at(action, actionIdentifierFields).join(',');
    }

    function typeAndSourceIdentifier(action) {
        return action.type + ':' + action.sourceId;
    }

    function classifyAddedRemoved(newList, prevMap, keyInNewList, identifierFunction) {
        var newMap = _(newList)
            .map(keyInNewList)
            .indexBy(identifierFunction)
            .value();
        var newKeys = _.keys(newMap);
        var oldKeys = _.keys(prevMap);
        var stayed = _.intersection(newKeys, oldKeys);
        var added = _.difference(newKeys, stayed);
        var removed = _.difference(oldKeys, stayed);
        return {map: newMap, added: added, removed: removed};
    }

    function updateActionsAndBehaviorsMaps(actionsAndBehaviors, pageId) {
        var behaviorsData = classifyAddedRemoved(actionsAndBehaviors, this._registeredBehaviors[pageId] || {}, 'behavior', uniqueBehaviorIdentifier);
        this._behaviorsAdded[pageId] = behaviorsData.added.concat(this._behaviorsAdded[pageId] || []);
        this._behaviorsRemoved[pageId] = behaviorsData.removed.concat(this._behaviorsRemoved[pageId] || []);
        _(this._registeredBehaviors[pageId])
            .pick(behaviorsData.removed)
            .forEach(function(behavior) {
                var handler = behaviorHandlersFactory.getHandler(behavior.type);
                if (_.has(handler, 'cancelPreCondition')) {
                    handler.cancelPreCondition(behavior, this._aspectSiteAPI);
                }
            }, this)
            .commit();
        this._registeredBehaviors[pageId] = behaviorsData.map;

        var actionsData = classifyAddedRemoved(actionsAndBehaviors, this._registeredActions[pageId] || {}, 'action', uniqueActionIdentifier);
        this._actionsRemoved[pageId] = this._actionsRemoved[pageId] || {};
        _.assign(this._actionsRemoved[pageId], _.pick(this._registeredActions[pageId], actionsData.removed));
        this._registeredActions[pageId] = actionsData.map;
        this._actionsAdded[pageId] = actionsData.added.concat(this._actionsAdded[pageId] || []);

        this._actionsToBehaviorsMap[pageId] = _(actionsAndBehaviors)
            .groupBy(function(actionBehavior) {
                return uniqueActionIdentifier(actionBehavior.action);
            })
            .mapValues(function(actionBehaviors) {
                return _(actionBehaviors)
                    .map('behavior')
                    .map(uniqueBehaviorIdentifier)
                    .value();
            })
            .value();
        this._behaviorsToActionsMap[pageId] = _(actionsAndBehaviors)
            .groupBy(function(actionBehavior) {
                return uniqueBehaviorIdentifier(actionBehavior.behavior);
            })
            .mapValues(function(actionBehaviors) {
                return _(actionBehaviors)
                    .map('action')
                    .map(uniqueActionIdentifier)
                    .value();
            })
            .value();
    }

    function getFilteredMap(baseMap, pageIds, idsByPage) {
        var filtered = _(baseMap)
            .pick(pageIds)
            .map(function (content, pageId) {
                return idsByPage === true ? content : _.pick(content, idsByPage[pageId]);
            })
            .values()
            .value();
        return _.assign.apply(_, [{}].concat(filtered));
    }

    function needToRunPreConditions(action) {
        var actionsAspect = this._aspectSiteAPI.getSiteAspect('actionsAspect');
        return actionsAspect.needToRunPreConditions(action);
    }


    function filterBehaviors(behaviors, ranOnceArr) {
        return _.filter(behaviors, function (behavior) {
            var id = uniqueBehaviorIdentifier(behavior);
            if (behavior.playOnce && ranOnceArr[id]) {
                return false;
            }
            ranOnceArr[id] = true;
            return true;
        });
    }

    function getRegisteredActionForBehavior(renderedRootIds, actionBehaviorMap, behavior) {
        /*eslint lodash/no-double-unwrap: 0*/
        return _(actionBehaviorMap)
            .chain()
            .pick(renderedRootIds)
            .find(function(actionsBehaviorsArr){
                return _(actionsBehaviorsArr).map('behavior').some(behavior);
            })
            .find(function(actionBehaviorObj){
                return _.isEqual(actionBehaviorObj.behavior, behavior);
            })
            .get('action')
            .value();
    }

    function handleBehaviors(behaviors, event, type) {
        var siteAPI = this._aspectSiteAPI.getSiteAPI();
        var renderedRootIds = siteAPI.getAllRenderedRootIds();
        var processedBehaviors = _.map(behaviors, function(behavior){
            var action = getRegisteredActionForBehavior(renderedRootIds, this._rawBehaviorsForActions, behavior);
            return behaviorHandlersFactory.getBehaviorPreprocessor(type)(behavior, action, siteAPI);
        }, this);
        behaviorsService.handleBehaviors(siteAPI, processedBehaviors, event, type);
    }

    /**
     *
     * @typedef {Object} BehaviorHandler
     * @property {function} handle
     */

    /**
     *
     * @param {SiteAspectSiteAPI} aspectSiteAPI
     * @constructor
     */
    function BehaviorsAspect(aspectSiteAPI) {
        this._aspectSiteAPI = aspectSiteAPI;
        this._registeredActions = {};
        this._registeredBehaviors = {};
        this._ranOnce = {};
        this._rawBehaviorsForActions = {};
        this._behaviorsAdded = {};
        this._behaviorsRemoved = {};
        this._actionsAdded = {};
        this._actionsRemoved = {};
        this._actionsToBehaviorsMap = {};
        this._behaviorsToActionsMap = {};
        this._behaviorsWaitingToFlush = {};
        this._registeredActionsByTypeSource = {};
        _.bindAll(this);
        this._aspectSiteAPI.registerToDidLayout(this._handleDidLayout);
        this._aspectSiteAPI.registerToAddedRenderedRootsDidLayout(this._handleRootsAddedDidLayout);
        this._aspectSiteAPI.registerToRenderedRootsChange(this._handleRootsChanged);
    }


    BehaviorsAspect.prototype = {

        /**
         * handle an action.
         * @param {Action} action
         */
        handleActions: function (actions, event) {
            _.forEach(this._actionsToBehaviorsMap, function (actionsToBehaviors, pageId) {
                _(actionsToBehaviors)
                    .pick(_.map(actions, uniqueActionIdentifier))
                    .values()
                    .flatten()
                    .map(_.get.bind(_, this._registeredBehaviors[pageId]))
                    .groupBy('type')
                    .forEach(function (behaviors, type) {
                        behaviors = filterBehaviors(behaviors, this._ranOnce);
                        event = _.defaults({}, event, {action: 'action'});
                        actions = actions || [{name: 'action'}];
                        event.action = actions[0].name;
                        handleBehaviors.call(this, behaviors, event, type);
                    }, this)
                    .commit();
            }, this);

        },

        handleAction: function (action, event) {
            this.handleActions([action], event);
        },

        /**
         * Set/Replace the actions and behaviors for the given page id.
         * @param {{action: Action, behavior: Behavior}[]} actionsAndBehaviors
         * @param {string} pageId
         */
        setBehaviorsForActions: function (actionsAndBehaviors, pageId) {
            var self = this;
            var actionsAspect = this._aspectSiteAPI.getSiteAspect('actionsAspect');
            actionsAndBehaviors = _(actionsAndBehaviors)
                .reject(function (actionAndBehavior) {
                    return actionsAspect.isActionDisabled(actionAndBehavior.action.name);
                })
                .filter(function (actionAndBehavior) {
                    var behaviorHandler = behaviorHandlersFactory.getHandler(_.get(actionAndBehavior, 'behavior.type', 'animation'));
                    return (_.isUndefined(behaviorHandler.isEnabled) ||
                        behaviorHandler.isEnabled(actionAndBehavior.behavior, self._aspectSiteAPI.getSiteAPI()));
                })
                .map(function (actionAndBehavior) {
                    return _.defaultsDeep(actionAndBehavior, {
                        behavior: {type: 'animation', pageId: pageId},
                        action: {pageId: pageId}
                    });
                })
                .value();

            this._registeredActionsByTypeSource[pageId] = _(actionsAndBehaviors)
                .map('action')
                .groupBy(typeAndSourceIdentifier)
                .value();
            this._rawBehaviorsForActions[pageId] = actionsAndBehaviors;
        },

        /**
         * Get all the different actions for this type and source id.
         * @param {string} type The action type (i.e. 'comp')
         * @param {string} sourceId The source id of the action (i.e. compId, applicationId, etc.)
         * @returns {Object.<string, Action>} An object of unique actions for this type and source id group by the action name.
         */
        getActions: function (type, sourceId) {
            return _(this._registeredActionsByTypeSource)
                .map(type + ':' + sourceId)
                .flatten()
                .compact()
                .uniq()
                .mapKeys(function (action) {
                    return action.name;
                })
                .value();
        },

        _handleDidLayout: function () {
            var renderedRoots = this._aspectSiteAPI.getAllRenderedRootIds();
                _.forEach(renderedRoots, function (renderedRoot) {
                    var actionsAndBehaviors = this._rawBehaviorsForActions[renderedRoot];
                    var measureMapHeights = this._aspectSiteAPI.getSiteData().measureMap.top;
                    actionsAndBehaviors = _.filter(actionsAndBehaviors, function(actionAndBehavior) {
                        var sourceId = actionAndBehavior.action.sourceId;
                        var actionType = actionAndBehavior.action.type;
                        var behaviorType = actionAndBehavior.behavior.type;
                        var targetId = actionAndBehavior.behavior.targetId;

                        var legalSource = actionType !== 'comp' || _.isNumber(measureMapHeights[sourceId]);
                        var legalTarget = behaviorType === 'widget' || behaviorType === 'site' || _.isNumber(measureMapHeights[targetId]);
                        return legalSource && legalTarget;
                    }, this);
                    updateActionsAndBehaviorsMaps.call(this, actionsAndBehaviors, renderedRoot);
                }, this);
            var addedActions = getFilteredMap(this._registeredActions, renderedRoots, this._actionsAdded);
            var removedActions = _(this._actionsRemoved)
                .pick(renderedRoots)
                .values()
                .reduce(_.assign, {});

            var currentActions = _(this._registeredActions)
                .pick(renderedRoots)
                .values()
                .reduce(_.assign, {});

            var behaviorsAdded = getFilteredMap(this._registeredBehaviors, renderedRoots, this._behaviorsAdded);
            _.forEach(behaviorsAdded, function(behavior, id) {
                var shouldRunPre = _(this._behaviorsToActionsMap)
                    .pick(renderedRoots)
                    .values()
                    .map(id)
                    .compact()
                    .flatten()
                    .map(_.get.bind(_, currentActions))
                    .every(needToRunPreConditions, this);
                if ((!behavior.playOnce || !this._ranOnce[id]) && shouldRunPre) {
                    var handler = behaviorHandlersFactory.getHandler(behavior.type);
                    if (_.has(handler, 'handlePreCondition')) {
                        handler.handlePreCondition(behavior, this._aspectSiteAPI);
                    }
                }
            }, this);
            _.forEach(renderedRoots, function(pageId) {
                this._actionsAdded[pageId] = [];
                this._actionsRemoved[pageId] = {};
                this._behaviorsAdded[pageId] = [];
                this._behaviorsRemoved[pageId] = [];
            }, this);
            if (!_.isEmpty(removedActions)) {
                this._aspectSiteAPI.getSiteAspect('actionsAspect').actionsRemoved(removedActions);
            }
            if (!_.isEmpty(addedActions)) {
                this._aspectSiteAPI.getSiteAspect('actionsAspect').actionsAddedLayouted(addedActions);
            }
        },

        _handleRootsChanged: function (rootsAdded, rootsRemoved) {
            var removedActions = getFilteredMap(this._registeredActions, rootsRemoved, true);
            _.forEach(rootsRemoved, function (rootRemoved) {
                this._rawBehaviorsForActions[rootRemoved] = [];
                this._registeredActions[rootRemoved] = {};
                this._registeredBehaviors[rootRemoved] = {};
                this._behaviorsAdded[rootRemoved] = [];
                this._behaviorsRemoved[rootRemoved] = [];
                this._actionsAdded[rootRemoved] = [];
                this._actionsRemoved[rootRemoved] = {};
                this._actionsToBehaviorsMap[rootRemoved] = {};
                this._behaviorsToActionsMap[rootRemoved] = {};
                this._registeredActionsByTypeSource[rootRemoved] = {};
            }, this);
            this._aspectSiteAPI.getSiteAspect('actionsAspect').actionsRemoved(removedActions);
        },

        _handleRootsAddedDidLayout: function () {
        },

        resetBehaviorsRegistration: function () {
            this._ranOnce = {};
        },

        registerBehavior: function (behavior, callback) {
            var registeredBehaviors = _.get(this._behaviorsWaitingToFlush, behavior.targetId, []);
            _.set(this._behaviorsWaitingToFlush, [behavior.targetId, registeredBehaviors.length], {
                name: behavior.name,
                params: behavior.params,
                callback: callback
            });
        },

        extractBehaviors: function (targetId) {
            var registeredBehaviors = this._behaviorsWaitingToFlush[targetId] || [];
            delete this._behaviorsWaitingToFlush[targetId];
            return registeredBehaviors;
        },

        handleBehavior: function(behavior, event) {
            handleBehaviors.call(this, [behavior], event, behavior.type);
        }
    };

    return BehaviorsAspect;
});
