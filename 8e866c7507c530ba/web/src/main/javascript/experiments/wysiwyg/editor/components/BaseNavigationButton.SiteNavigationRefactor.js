/**@class wysiwyg.editor.components.BaseNavigationButton */
define.experiment.newComponent('wysiwyg.editor.components.BaseNavigationButton.SiteNavigationRefactor', function (componentDefinition) {
    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('core.components.Button');

    def.skinParts({
        label:{type:'htmlElement'},
        icon:{type:'htmlElement'}
    });

    def.traits(['wysiwyg.editor.components.traits.TreeItem', 'wysiwyg.editor.components.traits.NavigationButtonPageUtils']);

    def.binds(['_updateItemProps']);

    def.statics({
        _iconsPosition: {
            _visible: "-9999px -9999px",
            _hidden: "0 0",
            homepage_visible: "0 -20px",
            homepage_hidden: "0 -40px"
        },
        _INDENT: 20
    });

    def.states({
        mouse:      [ "up", "over", "selected", "down", "pressed" ],
        page:       [ "normal", "subPage" ],
        level:      [ "level0", "level1", "level2", "level3", "level4", "level5", "level6", "level7", "level8", "level9" ]
    });

    def.dataTypes(['MenuItem', 'BasicMenuItem']);

    def.fields({
        _triggers:['click'],
        _renderTriggers:[Constants.DisplayEvents.DISPLAYED]
    });

    /**
     * @lends wysiwyg.editor.components.BaseNavigationButton
     */
    def.methods({
        initialize: function(compId, viewNode, args) {
            this.parent(compId, viewNode, args);

            args = args || {};
            this._itemLevel = args.itemLevel || 0;
        },

        /**
         * @override core.components.Button
         */
        render:function () {
            this._setIcon();
            this.setItemLevel(this._itemLevel); // Initial level (set in initialize)
        },

        /** ABSTRACTS **/

        /**
         * @abstract -- to be implemented by BaseNavigationButton implementations
         * @returns {boolean}
         * @private
         */
        _isVisible: function() {
            return true;
        },

        /**
         * @abstract -- to be implemented by BaseNavigationButton implementations
         * @returns {string}
         * @private
         */
        _getItemType: function() {
            return '';
        },

        /**
         * @abstract -- to be implemented by BaseNavigationButton implementations
         * @returns {string}
         * @private
         */
        _getItemTitle: function() {
            return '';
        },

        /**     **/
        _onAllSkinPartsReady:function () {
            this._updateItemProps();
        },


        /** Item level in menu **/

        isSubItem:function () {
            if (this.getState('page') == 'subPage') {
                return true;
            }
            return false;
        },

        setAsSubItem:function () {
            this.setState('subPage', 'page');
        },

        setAsParentItem:function () {
            this.setState('normal', 'page');
        },

        setItemLevel: function(level) {
            this._itemLevel = level;

            this.setState('level' + level, 'level');
            this._setIndentationByLevel();
        },

        getItemLevel: function() {
            return this._itemLevel;
        },

        _setIndentationByLevel: function() {
            var indent = this._itemLevel * this._INDENT;
            this.getViewNode().setStyle('margin-left', indent + 'px');
        },

        /**
         * @abstract -- to be implemented by BaseNavigationButton implementations
         * @returns {boolean}
         * @private
         */
        isSelected: function(){
            return false;
        },

        /** Item Properties **/

        _updateItemProps:function () {
            this._setTitle();
            this._setIcon();
        },

        _setTitle:function () {
            this._label = this._getItemTitle();
            this._skinParts.label.set('text', this._label || '');
        },

        _setIcon:function () {
            var itemType = this._getItemType(),
                visibility = (this._isVisible() ? 'visible' : 'hidden');

            var iconType = itemType + '_' + visibility,
                iconPosition = this._iconsPosition[iconType] || this._iconsPosition['_' + visibility];

            if (iconPosition) {
                this._skinParts.icon.setStyle('background-position', iconPosition);
            }

            this.getViewNode().setAttribute('iconType', iconType);
        }
    });

});
