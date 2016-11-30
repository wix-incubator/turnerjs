/**@class wysiwyg.editor.components.CustomMenuNavigationButton */
define.experiment.newComponent('wysiwyg.editor.components.CustomMenuNavigationButton.SiteNavigationRefactor', function (componentDefinition) {
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
        _settingsTooltipId: null // TODO add tooltip ID
    });

    def.binds([]);

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
            this.getDataItem().addEvent('dataChanged', this._updateItemProps);
            this.getViewNode().addEvent(Constants.CoreEvents.CLICK, this._onSettingsClicked);
            this._skinParts.menu.removeEvent(Constants.CoreEvents.CLICK, this._onSettingsClicked);
        },

        /**
         * @override
         * @returns {boolean}
         * @private
         */
        _isVisible: function() {
            return this.getDataItem().get('isVisible');
        },

        /**
         * @override
         * @returns {string}
         * @private
         */
        _getItemType: function() {
            return '';

            // TODO
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
            this.resources.W.Commands.executeCommand("W.EditorCommands.CustomMenu.OpenEditItemSettingsDialog", {data: this.getDataItem()});
        },

        dispose: function(){
            this.getDataItem().removeEvent('dataChanged', this._updateItemProps);
            this.parent();
        }
    });

});
