define.component('wysiwyg.editor.components.inputs.HtmlIsland', function (componentDefinition) {
    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('mobile.core.components.base.BaseComponent');

    def.resources(['W.Commands']);
    def.binds(['_onToolTipMouseLeave', '_onToolTipMouseEnter']);

    def.skinParts({
        contentArea: {type: 'htmlElement'}
    });

    def.methods({
        initialize: function (compId, viewNode, args) {
            this.parent(compId, viewNode, args);
            args = args || {};
            this._styles = args.styles;
            this._content = args.htmlContent || "";
            this._toolTipData = args.toolTip;
        },

        _onAllSkinPartsReady: function (parts) {
            parts.contentArea.set("html", this._content);
            if(this._styles){
                this.$view.setStyles(this._styles);
            }
            if(this._toolTipData){
                this.addToolTip();
            }
        },

        addToolTip: function(){
            var tooltipSkinPart = this._skinParts.contentArea;
            tooltipSkinPart.addEvent('mouseenter', this._onToolTipMouseEnter);
            tooltipSkinPart.addEvent('mouseleave', this._onToolTipMouseLeave);
        },

        _onToolTipMouseEnter: function() {
            this.resources.W.Commands.executeCommand('Tooltip.ShowTip', this._toolTipData, this._skinParts.contentArea);
        },

        _onToolTipMouseLeave: function() {
            this.resources.W.Commands.executeCommand('Tooltip.CloseTip');
        }
    });
});
