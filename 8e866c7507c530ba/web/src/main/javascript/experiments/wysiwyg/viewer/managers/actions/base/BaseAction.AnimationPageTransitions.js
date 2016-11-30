/** @class wysiwyg.viewer.managers.actions.triggers.BaseAction */
define.experiment.Class('wysiwyg.viewer.managers.actions.base.BaseAction.AnimationPageTransitions', function(classDefinition, experimentStrategy) {

    /** @type bootstrap.managers.classmanager.ClassDefinition */
    var def = classDefinition;
    /** @type bootstrap.managers.experiments.ExperimentStrategy */
    var strategy = experimentStrategy;

    def.methods({
        initialize: function(animations, viewingDevice) {
            this._animations = animations;
            this._behaviors = {};
            this._viewingDevice = null;
            this._isPublic = this.resources.W.Config.env.$isPublicViewerFrame;
            this._isActive = false;
            this._syncWithViewingDeviceChanges(viewingDevice);
        },

        /**
         * Get the active state of an action.
         * @returns {boolean}
         */
        isActive: function(){
            return this._isActive;
        },

        /**
         *
         * @param isActive
         */
        setActiveState: function(isActive){
            this._isActive = !!isActive;
        },

        /**
         * For Editor environment only.
         * Keep Action in sync with viewing device changes.
         * @private
         */
        _syncWithViewingDeviceChanges: function(viewingDevice){
            this._setViewingDeviceForBehaviors({viewerMode: viewingDevice || this.resources.W.Config.env.$viewingDevice});
            this.resources.W.Commands.registerCommandAndListener('WEditorCommands.SetViewerMode', this, this._setViewingDeviceForBehaviors);
            this.resources.W.Commands.registerCommandListenerByName('WPreviewCommands.ViewerStateChanged', this, this._setViewingDeviceForBehaviors);
        },


        /**
         * @abstract
         * This function is called by the ActionsManager to initiate the action's triggers
         * Must be overridden by every Action Class
         * Cannot be undone (You can't set action to 'inactive' without refreshing the environment)
         */
        setActionListeners: function() {

        },

        /**
         * @abstract
         * @optional
         * This function is called by the ActionsManager to initiate the action's triggers when the action is inactive if needed
         * May be overridden by every Action Class
         * Cannot be undone (You can't set action to 'inactive' without refreshing the environment)
         */
        setInactiveActionListeners: function(){

        },

        /**
         * @abstract
         * This function is intended to create a unified interface for all Actions to start their operation.
         * It can be called by the action triggers or manually
         */
        executeAction: function() {

        }
    });
});