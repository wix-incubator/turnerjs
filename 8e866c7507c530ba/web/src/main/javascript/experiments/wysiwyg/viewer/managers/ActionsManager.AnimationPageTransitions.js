define.experiment.Class('wysiwyg.viewer.managers.ActionsManager.AnimationPageTransitions', function(classDefinition, experimentStrategy) {
    /** @type bootstrap.managers.classmanager.ClassDefinition */
    var def = classDefinition;
    /** @type bootstrap.managers.experiments.ExperimentStrategy */
    var strategy = experimentStrategy;

    def.resources(strategy.merge(['ActionsEnabledMap']));

    def.utilize(strategy.merge([
        'wysiwyg.viewer.managers.actions.PageTransitionAction',
            'wysiwyg.common.behaviors.Transitions'
        ])
    );

    def.methods({
        initialize: function() {
            this._actionsEnabledMap = this.resources.ActionsEnabledMap;
            this._anyActionEnabledInMap = _.any(this._actionsEnabledMap, Boolean);

            this._animations = new this.imports.Animations();
            this._transitions = new this.imports.Transitions(this._animations);
            this._createActionsInstances();
            this._setActionsListeners();

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
            var actionName;

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

            for (actionName in this._actions) {
                this._actions[actionName].removeComponentBehaviors(compId);
            }

            for (actionName in data) {
                if (this._actions[actionName] && this.isActionEnabledForSession(actionName)) {
                    this._addBehaviorsByAction(pageId, compId, data, actionName);
                }
            }
        },

        /**
         * Create instances for actions.
         * When adding a new action to the system it should be defined in 'def.utilze' and an instance should be created here.
         * @private
         */
        _createActionsInstances: function(){
            this._actions[Constants.Actions.PAGE_IN] = new this.imports.PageInAction(this._animations);
            this._actions[Constants.Actions.SCREEN_IN] = new this.imports.ScreenInAction(this._animations);
            this._actions[Constants.Actions.PAGE_TRANSITION] = new this.imports.PageTransitionAction(this._transitions);
        },

        /**
         * For each defined action, check if this action should be enabled in the current session and if so, enable it's listeners.
         * 'setInactiveActionListeners' is an optional function that can be defined for actions to run processes or events
         * that should always run, even if the action itself is disabled.
         * @private
         */
        _setActionsListeners: function(){
            _.forEach(this._actions, function(action, actionName){
                if (this.isActionEnabledForSession(actionName)){
                    action.setActionListeners();
                    action.setActiveState(true);
                } else {
                    action.setInactiveActionListeners();
                }
            }, this);
        },

        /**
         * Check in ActionsEnabledMap whether the passed action should be enabled for the current session
         * @param actionName
         * @returns {Boolean}
         */
        isActionEnabledForSession: function(actionName){
            return this._actionsEnabledMap[actionName];
        },

        /**
         * Return true if at least one action is enabled for the current session
         * @returns {Boolean}
         */
        isAnyActionsEnabledForSession: function(){
            return this._anyActionEnabledInMap;
        }
    });
});