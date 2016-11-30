/** @class wysiwyg.viewer.managers.actions.base.BaseAction */
define.Class('wysiwyg.viewer.managers.actions.base.BaseAction', function(classDefinition) {

    /**@type bootstrap.managers.classmanager.ClassDefinition*/
    var def = classDefinition;

    def.resources(['W.Config', 'W.Commands', 'W.Viewer']);

    def.methods({
        initialize: function(viewingDevice) {
            this._behaviors = {};
            this._viewingDevice = null;
            this._isPublic = this.resources.W.Config.env.$isPublicViewerFrame;

            this._setViewingDeviceForBehaviors({viewerMode: viewingDevice || this.resources.W.Config.env.$viewingDevice});

            this.resources.W.Commands.registerCommandAndListener('WEditorCommands.SetViewerMode', this, this._setViewingDeviceForBehaviors);
            this.resources.W.Commands.registerCommandListenerByName('WPreviewCommands.ViewerStateChanged', this, this._setViewingDeviceForBehaviors);
        },

        /**
         * Add all behaviors of this action type for a component,
         * redefining the same component overrides the old definition
         * In public mode hide the components that should be hidden
         * Requires viewerWeb.css to have 'hideForAnimation' class
         * The passed parameters are saved on each Action class in the following structure:
         * {
         * "<viewingDevice>":[
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
         * @param {Object} behaviors
         */
        addBehaviors: function(behaviors) {
            _.forEach(behaviors, function(behavior) {
                this._behaviors[this._viewingDevice].push(behavior);
            }, this);
        },

        /**
         * Remove all behaviors of this action type for a component
         * @param {String} sourceId
         */
        removeComponentBehaviors: function(sourceId) {
            var filteredBehaviors = _.reject(this._behaviors[this._viewingDevice], {sourceId: sourceId});
            this._behaviors[this._viewingDevice] = filteredBehaviors;
        },

        /**
         * return all behaviors triggered by passed source component id
         * @param {String} sourceId
         * @returns {Array}
         */
        getBehaviorsBySourceId: function(sourceId) {
            return _.filter(this._behaviors[this._viewingDevice], {sourceId: sourceId});
        },

        /**
         * Return the list of components behaviors for the passed page id
         * @param pageId
         * @returns {Array}
         */
        getBehaviorsByPageId: function(pageId) {
            return _.filter(this._behaviors[this._viewingDevice], {pageId: pageId});
        },

        /**
         * return all behaviors applied on passed target component id
         * @param {String} targetId
         * @returns {Array}
         */
        getBehaviorsByTargetId: function(targetId) {
            return _.filter(this._behaviors[this._viewingDevice], {targetId: targetId});
        },

        /**
         * Get ids fo all target components with a behavior in a page and masterpage
         * @returns {Array}
         */
        getTargetIdsByPageId: function(pageId) {
            var behaviors = this.getBehaviorsByPageId(pageId);
            var masterBehaviors = this.getBehaviorsByPageId('master');
            behaviors = behaviors.concat(masterBehaviors);

            return _.uniq(_.pluck(behaviors, 'targetId'));
        },
        /**
         * Get ids fo all target components with a behavior in a page and masterpage
         * @returns {String}
         */
        getPageIdByTargetId: function(targetId) {
            var behaviors = this.getBehaviorsByTargetId(targetId);
            return behaviors[0].pageId;
        },

        /**
         * Ready elements for animations on a page and masterpage
         * Currently just hides all components that should start hidden
         * @param {String} pageId
         */
        hideCurrentPageAnimationTargets: function() {
            var pageId = this.resources.W.Viewer.getCurrentPageId();
            this._hideElements(pageId);
            this._hideElements('master');
        },

        /**
         * Clear animation from elements on a page and masterpage
         * @param pageId
         */
        clearAllAnimationTargets: function() {
            var pageId = this.resources.W.Viewer.getCurrentPageId();
            this._clearAnimations(pageId);
            this._clearAnimations('master');
        },

        /**
         * Get ids fo all target components with a behavior on current page
         * @returns {Array}
         */
        getCurrentPageTargetsIds: function() {
            var pageId = this.resources.W.Viewer.getCurrentPageId();
            return this.getTargetIdsByPageId(pageId);
        },

        /**
         * Get DOM elements by target ids
         * @param {String} targetId
         * @returns {HTMLElement}
         * @private
         */
        _getDomElementByTargetId: function(targetId) {
            return this.resources.W.Viewer.getCompByID(targetId);
        },

        /**
         * Set the viewing device to the current (passed) viewing device
         * Viewing devices are currently 'DESKTOP' or 'MOBILE'
         * @param {string} [params.viewerMode]
         * @param {string} [params.mode]
         * @private
         */
        _setViewingDeviceForBehaviors: function(params) {
            this._viewingDevice = params.viewerMode || params.mode;
            this._behaviors[this._viewingDevice] = this._behaviors[this._viewingDevice] || [];
        }

    });
});