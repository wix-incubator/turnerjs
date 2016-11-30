/** @type wysiwyg.viewer.managers.ActionsManager */
define.Class('wysiwyg.viewer.managers.ActionsManager', function(classDefinition) {
    /** @type bootstrap.managers.classmanager.ClassDefinition */
    var def = classDefinition;

    def.inherits('bootstrap.managers.BaseManager');

    def.resources(['W.Config', 'W.Viewer']);

    def.utilize([
        'wysiwyg.viewer.managers.actions.ScreenInAction',
        'wysiwyg.viewer.managers.actions.PageInAction',
        'wysiwyg.common.behaviors.Animations'
    ]);

    def.fields({
        _actions: {}
    });

    def.methods({

        initialize: function() {

            // Do not instantiate actions - in IE8
            if (!window.addEventListener){
                return;
            }

            this._animations = new this.imports.Animations();
            this._actions[Constants.Actions.PAGE_IN] = new this.imports.PageInAction(this._animations);
            this._actions[Constants.Actions.SCREEN_IN] = new this.imports.ScreenInAction(this._animations);
        },

        /**
         * components should call this function in order to register their actions to the manager
         * @param {String} pageId
         * @param {BaseComp|BaseComponent} compLogic
         * @param {Object|String} data structure is defined as:
         * {
         *   "<action>": {
         *       "<targetDomId>": [
         *           {
         *               “behavior”: “<behaviorClassName>”,
         *               "playOnce": <boolean>,
         *               "duration": <number>,
         *               "delay": <number>
         *               “params”: {
         *                   “<paramName>”:”<paramValue>”,
         *                   “<paramName>”:”<paramValue>”,
         *                   ...
         *              }
         *           },
         *           ...
         *       ],
         *       ...
         *       },
         *   ...
         * }
         *
         * The data is saved a bit differently in the Action classes, see BaseAction for more info
         */
        registerComponent: function(pageId, compLogic, data) {

            var compId = compLogic.getComponentId();
            var action;

            data = data || {};

            if (typeof data === 'string') {
                try {
                    data = JSON.parse(data);
                } catch(e){
                    // TODO: pass the compType
                    LOG.reportError(wixErrors.ANIMATIONS_REGISTER_CORRUPTED_DATA, 'ActionsManager', 'registerComponent', { dsc: compId });
                    return;
                }
            }

            for (action in this._actions) {
                this._actions[action].removeComponentBehaviors(compId);
            }

            for (action in data) {
                if (this._actions[action]) {
                    this._addBehaviorsByAction(pageId, compId, data, action);
                }
            }
        },

        /**
         *
         * @param pageId
         * @param sourceId
         * @param data
         * @param action
         * @private
         */
        _addBehaviorsByAction: function(pageId, sourceId, data, action){
            var behaviors = this._dataToBehaviorsList(pageId, sourceId, data[action]);
            this._actions[action].addBehaviors(behaviors);
        },

        /**
         * Validates the data data integrity
         * Currently, we are not using this function ( but we might.. in the future )
         * @param {Object} data
         * @returns {Boolean}
         */
        _validateDataStructure: function(data) {
            if (!data) {
                LOG.reportError(wixErrors.ANIMATIONS_REGISTER_INVALID_DATA, 'ActionsManager', 'registerComponent');
                return false;
            }
            return true;
        },

        /**
         * Return all behaviors as an array for component by actions:
         * {
         *      <actionName>:<behaviors[]>,
         *      ...
         * }
         * @param {String} sourceId
         * @returns {Object}
         */
        getActionsForComponent: function(sourceId) {
            var actionsList = null;
            for (var actionName in this._actions) {
                var behaviors = this.getBehaviorsForComponentAction(sourceId, actionName);
                if (behaviors && behaviors.length) {
                    actionsList = actionsList || {};
                    actionsList[actionName] = behaviors;
                }
            }
            return actionsList;
        },

        /**
         * Get all component behaviors for a specific action
         * @param {String} sourceId
         * @param {String} actionName
         * @returns {Array}
         * [
         *      {
         *          "pageId": <string>,
         *          "sourceId": <string>,
         *          "targetId": <string>,
         *          “name”: “<behaviorClassName>”,
         *          "playOnce": <boolean>,
         *          "duration": <number>,
         *          "delay": <number>
         *          “params”: {
         *              “<paramName>”:”<paramValue>”,
         *              “<paramName>”:”<paramValue>”,
         *              ...
         *          }
         *      },
         *      ...
         * ]
         */
        getBehaviorsForComponentAction: function(sourceId, actionName) {
            var behaviors = this._actions[actionName] && this._actions[actionName].getBehaviorsBySourceId(sourceId);
            return behaviors;
        },

        /**
         * set action behaviors to a component
         * @param {String} sourceId
         * @param {String} actionName
         * @param {Array} behaviors
         */
        setBehaviorsForComponentAction: function(sourceId, actionName, behaviors) {
            var comp = this.resources.W.Viewer.getCompLogicById(sourceId);
            var actions = this.getActionsForComponent(sourceId) || {};
            var actionData;
            
            if (behaviors && behaviors.length){
                actionData = this._behaviorsListToData(_.cloneDeep(behaviors));
                actions[actionName] = actionData;
            } else {
                delete actions[actionName];
                if (_.isEmpty(actions)){
                    actions = null;
                }
            }
            comp.setBehaviors(actions);

            return actions;
        },

        /**
         * Get the Animations Class
         * @returns {wysiwyg.common.behaviors.Animations}
         */
        getAnimationClass: function(){
            return this._animations;
        },

        isReady: function() {
            return true;
        },

        /**
         * Receive an object grouped by targets and return a list of behaviors
         * @param pageId
         * @param sourceId
         * @param targets
         * @returns {Array}
         * [
         *      {
         *          "pageId": <string>,
         *          "sourceId": <string>,
         *          "targetId": <optional, string>,
         *          “name”: “<behaviorClassName>”,
         *          "playOnce": <boolean>,
         *          "duration": <number>,
         *          "delay": <number>
         *          “params”: {
         *              “<paramName>”:”<paramValue>”,
         *              “<paramName>”:”<paramValue>”,
         *              ...
         *          }
         *      },
         *      ...
         * ]
         * @private
         */
        _dataToBehaviorsList: function(pageId, sourceId, targets){
            var behaviorsList = [];
            _.forEach(targets, function(behaviors, targetId){
                _.forEach(behaviors, function(behavior){
                    var extendedBehavior = _.extend({pageId: pageId, sourceId: sourceId, targetId: targetId}, behavior);
                    behaviorsList.push(extendedBehavior);
                }, this);
            }, this);
            
            return behaviorsList;
        },

        /**
         * Receive a list of behaviors and return an object grouped by targets
         * @param {Array} behaviors
         * @returns {Object} behaviors parsed to a format fit to save on the component structure.
         *  {
         *       "<targetDomId>": [
         *           {
         *               “behavior”: “<behaviorClassName>”,
         *               "playOnce": <boolean>,
         *               "duration": <number>,
         *               "delay": <number>
         *               “params”: {
         *                   “<paramName>”:”<paramValue>”,
         *                   “<paramName>”:”<paramValue>”,
         *                   ...
         *              }
         *           },
         *           ...
         *       ],
         *       ...
         *       },
         *   ...
         * @private
         */
        _behaviorsListToData: function(behaviorsList){
            var behaviorsByTarget = _.groupBy(behaviorsList, 'targetId');
            _.forEach(behaviorsByTarget, function(behaviors){
                _.forEach(behaviors, function(behavior){
                    delete behavior.pageId;
                    delete behavior.sourceId;
                    delete behavior.targetId;
                });
            });

            return behaviorsByTarget;
        },

        _isActionExists: function(action) {
            return !!this._actions[action];
        },

        __removeAllBehaviorsFromSite__: function(){},
        __convertSiteFromOldBehaviorStructure__: function(){}

    });
});