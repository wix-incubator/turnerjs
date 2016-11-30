/**
 * this component groups together specified input components, and enables common operations on all
 * of the grouped inputs, such as collaping all the group members
 *
 * @Class wysiwyg.editor.components.inputs.InputGroup
 * @extends wysiwyg.editor.components.panels.base.AutoPanel
 */
define.component('wysiwyg.editor.components.inputs.InputGroupWithIcon', function(componentDefinition){
    /** @type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits("wysiwyg.editor.components.inputs.InputGroup");


    def.skinParts({
        icon: {type: 'htmlElement'},
        contentWrapper: {type: 'htmlElement'},
        content: {type: 'htmlElement'},
        separator: {type: 'htmlElement'}
    });


    /**
     * @lends wysiwyg.editor.components.inputs.InputGroup
     */
    def.methods({
        initialize: function(compId, viewNode, args) {
            this.parent(compId, viewNode, args);
            args = args || {};
            this._iconSrc = args.iconSrc;
            this._iconSizes = args.iconSizes;

            this._showBorder = args.showBorder;
            this._showSeparator = args.showSeparator;
        },

        collapseGroup: function() {
            this.$view.collapse();
            this._skinParts.contentWrapper.collapse();
            this._skinParts.content.collapse();
            this._skinParts.icon.collapse();
            this._skinParts.separator.collapse();
            this._isCollapsed = true;
            this.setState('collapsed','collapsibiliy');
        },

        uncollapseGroup: function() {
            this.$view.uncollapse();
            this._skinParts.contentWrapper.uncollapse();
            this._skinParts.content.uncollapse();
            this._skinParts.icon.uncollapse();
            if(this._showSeparator) {
                this._skinParts.separator.uncollapse();
            }
            this._isCollapsed = false;
            this.setState('uncollapsed','collapsibiliy');
        },

        _onAllSkinPartsReady : function() {
            this.parent();

            this._skinParts.icon.setStyles({
                'background' : 'url(' + W.Theme.getProperty("WEB_THEME_DIRECTORY") + this._iconSrc +') no-repeat 50% 50%',
                'width':this._iconSizes.width,
                'height': this._iconSizes.height
            });

            if(!this._showBorder) {
                this._skinParts.content.style.border = "0px";
            }

            if(!this._showSeparator) {
                this._skinParts.separator.collapse();
            }
        }
    });
});