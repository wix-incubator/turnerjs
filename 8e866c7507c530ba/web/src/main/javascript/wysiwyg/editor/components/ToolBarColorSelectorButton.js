/**
 * @class wysiwyg.editor.components.ToolBarColorSelectorButton
 */
define.component('wysiwyg.editor.components.ToolBarColorSelectorButton', function(ComponentDefinition) {
    /**@type core.managers.component.ComponentDefinition*/
    var def = ComponentDefinition;

    def.inherits('wysiwyg.editor.components.ColorSelectorButton');

    def.statics({
        TRANSPARENT: "#00000000",
        BLACK: "#000000",
        RESET_COLOR_FLAG: 'resetColor'
    });

    def.binds(["_onReset"]);

    def.fields({
        /**the color to show near the reset button  */
        _resetDisplayColor: null
    });

    def.methods({

        initialize: function(compId, viewNode, args) {
            this.parent(compId, viewNode, args);
            this._alpha = args.alpha;
            this._showReset = args.showReset;
            this.setColor(args.colorValue, args.colorSource);
            this._toolBarCommand = args.command;
            this._biEvent = args.biEvent;
        },

        /**
         * @override
          * @private
         */
        _openColorSelectorDialog:function(){
            var pos = this.resources.W.Utils.getPositionRelativeToWindow(this._skinParts.colorSelector);
            var params = {
                color: (this._colorValue === this.TRANSPARENT ? this.BLACK : this._colorValue),
                colorSource: this._colorSource,
                onChange:this._onColorChange,
                top: pos.y,
                left: pos.x,
                onReset: (this._showReset ? this._onReset : undefined),
                resetDisplayColor: this._resetDisplayColor,
                commandName: this._commandName
            };
            this.resources.W.Commands.executeCommand('WEditorCommands.OpenColorSelectorDialogCommand', params);

            if(W.Experiments.isDeployed('RTColorSelectorBIEvents')){
                LOG.reportEvent(wixEvents.RT_COLOR_CLICKED, {c1: this._commandName});
            }
            LOG.reportEvent(this._biEvent, {c1: this._commandName});
        },

        _onColorChange:function(color, source){
            this.parent(color, source);
            var colorValue = this._color.getHex();
            this.fireEvent('change', {command: this._toolBarCommand, value: colorValue});
        },

        getSelectedOption: function() {

        },

        getColorValue: function() {
            return this._colorValue;
        },

        setResetDisplayColor: function(color){
            this._resetDisplayColor = color;
        },

        _onReset:function(){
            this.fireEvent('change', {command: this._toolBarCommand, value: this.RESET_COLOR_FLAG});
        }

    });

});