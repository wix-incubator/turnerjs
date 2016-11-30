/**@class wysiwyg.editor.components.SiteNavigationButton */
define.experiment.component('wysiwyg.editor.components.SiteNavigationButton.SiteNavigationRefactor', function (componentDefinition, experimentStrategy) {
    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    /**@type bootstrap.managers.experiments.ExperimentStrategy*/
    var strategy = experimentStrategy;

    def.inherits('wysiwyg.editor.components.DraggableSettingsNavigationButton');

    def.skinParts({
        label:{type:'htmlElement'},
        menu:{type:'htmlElement'},
        icon:{type:'htmlElement'},
        drag:{type:'htmlElement'}
    });

    def.resources(['W.Editor', 'W.Commands', 'W.Preview', 'W.Config']);

    def.statics({
        _settingsTooltipId: 'Pages_Symbol_ttid'
    });

    def.binds(['_onSettingsClicked', '_onSetViewerMode']);

    def.states(strategy.merge({
        controls: ['normalControls', 'readOnlyControls'],
        pageType:   [ "normalPage", "wixAppsPage" ],
        // TODO - should be removed when merging - this should come from BaseNavigationButton
        level:      [ "level0", "level1", "level2", "level3", "level4", "level5", "level6", "level7", "level8", "level9" ]
    }));

    /**
     * @lends wysiwyg.editor.components.SiteNavigationButton
     */
    def.methods({
        render:function () {
            this.parent();
        },

        _setTitle: strategy.remove(),

        _getPageDataItem: strategy.remove(),

        _getCurrentHomepageId: strategy.remove(),

        _getSiteStructure: strategy.remove(),

        /**
         * @override
         * @returns {boolean}
         * @private
         */
        _isVisible: function() {
            return this._isPageVisible(this._getPageId());
        },

        /**
         * @override
         * @returns {string}
         * @private
         */
        _getItemType: function() {
            if (this._isHomepage(this._getPageId())) {
                return 'homepage';
            } else {
                return '';
            }
        },

        /**
         * @override
         * @returns {string}
         * @private
         */
        _getItemTitle: function() {
            return this._getPageDataItem(this._getPageId()).get('title');
        },

        _getPageId: function() {
            if (!this._refId) {
                this._refId = this._data.get('refId');
            }

            return this._refId;
        },

        /**
         * @override
         * @private
         */
        _onAllSkinPartsReady: function() {
            this.parent();

            this._listenToPageDataChange();
            this._listenToHomepageChange();
            this._setButtonState();

            // Set button controls state according to viewer mode
            this._onSetViewerMode(null);
            this._listenToViewerModeChanges();

            // On click, navigate to the button's page
            var pageId = this._getPageId().replace('#', '');
            this.setCommand("EditorCommands.gotoSitePage", pageId);
        },

        _listenToPageDataChange: function() {
            //TODO - this should be in the base component (revisit when CustomMenuNavigationButton is implemented)
            // Update display on page data change
            this._getPageDataItem(this._getPageId()).addEvent('dataChanged', this._updateItemProps);
        },

        _listenToHomepageChange: function() {
            // Update button display when the homepage change
            this.resources.W.Commands.registerCommandListenerByName("WEditorCommands.SetHomepage", this, this._updateItemProps, null);
        },

        _setButtonState: function() {
            // Set button display accroding to currently viewed page
            var pageId = this._getPageId().replace('#', '');
            if (this.resources.W.Preview.getPreviewManagers().Viewer.getCurrentPageId() === pageId) {
                this.setState('selected', 'mouse');
            } else {
                this.setState('up', 'mouse');
            }
        },

        _listenToViewerModeChanges: function() {
            this.resources.W.Commands.registerCommandListenerByName("WEditorCommands.SetViewerMode", this, this._onSetViewerMode);
        },

        _onSetViewerMode: function(params){
            var mode = (params && params.mode) || this.resources.W.Config.env.$viewingDevice;
            switch (mode){
                case Constants.ViewerTypesParams.TYPES.MOBILE:
                    this.setState('readOnlyControls', 'controls');
                    break;
                case Constants.ViewerTypesParams.TYPES.DESKTOP:
                    this.setState('normalControls', 'controls');
                    break;
            }
            this.setIcon();
        },


        /** Settings handling **/

        /**
         * @override
         */
        _onSettingsClicked: function() {
            var commandName = this.getState('controls') === 'normalControls' ?
                "WEditorCommands.PageSettings" : "WEditorCommands.MobilePageSettings";

            this.resources.W.Commands.executeCommand(commandName, {
                pageId: this._refId,
                settingsButtonOverride: true
            });
        }
    });

});
