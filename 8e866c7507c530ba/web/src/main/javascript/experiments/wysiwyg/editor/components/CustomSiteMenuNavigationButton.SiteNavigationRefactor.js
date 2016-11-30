/**@class wysiwyg.editor.components.CustomMenuNavigationButton */
define.experiment.newComponent('wysiwyg.editor.components.CustomSiteMenuNavigationButton.SiteNavigationRefactor', function (componentDefinition) {
    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('wysiwyg.editor.components.DraggableSettingsNavigationButton');

    def.skinParts({
        label:{type:'htmlElement'},
        menu:{type:'htmlElement'},
        icon:{type:'htmlElement'},
        drag:{type:'htmlElement'}
    });

    def.resources(['W.Editor', 'W.Commands', 'W.Preview', 'W.Config', 'W.Data']);

    def.statics({
        _settingsTooltipId: 'Pages_Symbol_ttid'
    });

    def.binds(['_onSettingsClicked', '_onSetViewerMode']);

    def.states({
        mouse:      [ "up", "over", "selected", "down", "pressed" ],
        page:       [ "normal", "subPage" ],
        mainPage:   [ "mainPage" ],
        visibility: [ "visibility_true", "visibility_false" ],
        pageType:   [ "normalPage", "wixAppsPage" ],
        controls: ['readOnlyControls', 'normalControls'],
        level:      [ "level0", "level1", "level2", "level3", "level4", "level5", "level6", "level7", "level8", "level9" ]
    });

    /**
     * @lends wysiwyg.editor.components.CustomMenuNavigationButton
     */
    def.methods({
        render:function () {
            this.parent();
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
            var pageId = this.getPageId().replace('#', '');
            this.setCommand("EditorCommands.gotoSitePage", pageId);
        },

        _listenToPageDataChange: function() {
            this.getDataItem().addEvent('dataChanged', this._updateItemProps);
            this.getDataItem().getLinkedDataItem().addEvent('dataChanged', this._updateItemProps);

            if(this.getPageId()){
                this._getPageDataItem(this.getPageId()).addEvent('dataChanged', this._updateItemProps);
            }
        },

        _listenToHomepageChange: function() {
            // Update button display when the homepage change
            this.resources.W.Commands.registerCommandListenerByName("WEditorCommands.SetHomepage", this, this._updateItemProps, null);
        },

        _setButtonState: function() {
            // Set button display accroding to currently viewed page
            var pageId = this.getPageId().replace('#', '');
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

        /**
         * @override
         * @returns {boolean}
         * @private
         */
        _isVisible: function() {
            var pageId = this.getPageId(),
                isMobile = this.resources.W.Config.env.isViewingSecondaryDevice();

            return pageId ? this._isPageVisible(pageId) : this.getDataItem().isVisible(isMobile);
        },

        /**
         * @override
         * @returns {string}
         * @private
         */
        _getItemType: function() {
            if (this._isHomepage(this.getPageId())) {
                return 'homepage';
            }

            return '';
        },

        /**
         * @override
         * @returns {string}
         * @private
         */
        _getItemTitle: function() {
            var linkDataItem,
                title = this._data.get('label');

            if (title) {
                return title;
            }

            // If this is a page item and there's no title in the custom menu data item,
            // get the actual page title
            linkDataItem = this._getPageDataItem(this._data.get('link'));
            if(!linkDataItem){
                return '';
            }

            if (linkDataItem.get('type') === 'Page') {
                return this._getPageTitle(linkDataItem);
            }

            return this._getLinkTitle(linkDataItem);
        },

        _getPageTitle: function(refDataItem){
            return refDataItem.get('title');
        },

        _getLinkTitle: function(linkDataItem){
            return this.resources.W.Preview.getLinkRenderer().renderLinkDataItemForCustomMenu(linkDataItem);
        },

        /** Settings handling **/

        /**
         * @override
         */
        _onSettingsClicked: function() {
            var commandName = this.getState('controls') === 'normalControls' ?
                "WEditorCommands.PageSettings" : "WEditorCommands.MobilePageSettings";

            this.resources.W.Commands.executeCommand(commandName, {
                pageId: this.getPageId(),
                settingsButtonOverride: true
            });
        },

        dispose: function(){
            this.getDataItem().removeEvent('dataChanged', this._updateItemProps);
            this.parent();
        },

        getPageId: function(noHash){
            var linkedDataItem;

            if(!this._pageId){
                linkedDataItem = this.getDataItem().getLinkedDataItem();
                if(linkedDataItem && linkedDataItem.getType() === 'PageLink'){
                    this._pageId = linkedDataItem.get('pageId');
                }
            }

            return noHash ? this._pageId.substr(1) : this._pageId;
        },

        /*override*/
        isSelected: function(pageId){
            return pageId === this.getPageId(true);
        }
    });

});
