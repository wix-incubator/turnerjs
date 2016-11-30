/**@class wysiwyg.editor.components.CheckboxNavigationButton */
define.experiment.newComponent('wysiwyg.editor.components.CheckboxNavigationButton.SiteNavigationRefactor', function (componentDefinition) {
    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('wysiwyg.editor.components.BaseNavigationButton');

    def.skinParts({
        label:{type:'htmlElement'},
        icon:{type:'htmlElement'},
        checkbox:{type:'htmlElement'}
    });

    def.resources(['W.Editor', 'W.Commands', 'W.Preview', 'W.Config']);

    def.statics({
        _settingsTooltipId: null
    });

    def.binds(['_onClick']);

    /**
     * @lends wysiwyg.editor.components.CheckboxNavigationButton
     */
    def.methods({
        initialize: function(compId, viewNode, args) {
            this.parent(compId, viewNode, args);

            args = args || {};
            this._checkboxState = args.isCheckboxChecked || false;
        },

        render:function () {
            this.parent();
            this._skinParts.checkbox.checked = this._checkboxState;
        },

        /**
         * @override
         * @returns {boolean}
         * @private
         */
        _isVisible: function() {
            return this._isPageVisible(this._getPageId());
        },

        // Abstract -- to be implemented by BaseNavigationButton implementations
        /**
         * @override
         * @returns {string}
         * @private
         */
        _getItemType: function() {
            if (this._isHomepage(this._getPageId())) {
                return 'homepage';
            } else {
                return 'page';
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

            //TODO - this should be in the base component (revisit when CustomMenuNavigationButton is implemented)
            // Update display on page data change
            this._getPageDataItem(this._getPageId()).addEvent('dataChanged', this._updateItemProps);

            // Update button display when the homepage change
            W.Commands.registerCommandListenerByName("WEditorCommands.SetHomepage", this, this._updateItemProps, null);

            this._skinParts.checkbox.addEvent('click', function(e) {
                var state = this._skinParts.checkbox.checked;
                this._onCheckboxStateChanged(state);

                e.stopPropagation();
            }.bind(this));
        },

        /**
         * @override core.components.Button
         * @param e
         * @private
         */
        _onClick:function(e){
            if(this.isEnabled()) {
                var newState = !this._checkboxState;
                this._skinParts.checkbox.checked = newState;
                this._onCheckboxStateChanged(newState);
            }
        },

        /**
         * @param {Boolean} state
         * @private
         */
        _onCheckboxStateChanged: function(state) {
            this._checkboxState = state;
            this.resources.W.Commands.executeCommand('W.EditorCommands.CustomMenu.CheckboxStateChanged', {
                state: state,
                dataItem: this.getDataItem()
            });
        }
    });

});
