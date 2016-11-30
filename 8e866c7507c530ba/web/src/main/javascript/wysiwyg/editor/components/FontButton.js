define.component('wysiwyg.editor.components.FontButton', function (componentDefinition) {
    /** @type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('wysiwyg.editor.components.BasicFontButton');

    def.binds(['_onFontChange', '_openFontDialog', '_closeFontDialog']);

    def.fields({
        MAX_FONT_SIZE: 52
    });
    def.methods({
        initialize: function(compId, viewNode, args) {
            this.parent(compId, viewNode, args);
        },

        _onClick: function() {
            this._openFontDialog();
        },

        _openFontDialog:function(){
            var pos = this.injects().Utils.getPositionRelativeToWindow(this._skinParts.view);
            var dim = this._skinParts.view.getSize();
            var params = {
                title       : this._label,
                font        : this._font,
                onChange    : this._onFontChange,
                callback    : this._closeFontDialog,
                top         : pos.y + dim.y*0.66,
                left        : pos.x + dim.x*0.66
            };
            this._initFont = this._font;

            this.toggleSelected(true);
            this.injects().Commands.executeCommand('WEditorCommands.OpenFontDialogCommand', params);
        },

        _onFontChange:function(e){
            if (!e) {
                return;
            }

            this.setFont(e.font);
            var evData = {'font':e.font, 'cause': e.cause};
            if (e.fontDetails) {
                evData.fontDetails = e.fontDetails;
            }
            this.fireEvent(Constants.CoreEvents.CHANGE, evData);
        },

        _closeFontDialog: function(){
            this.toggleSelected(false);
        }
    });
});
