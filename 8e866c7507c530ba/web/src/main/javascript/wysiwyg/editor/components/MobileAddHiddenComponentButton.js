define.component('wysiwyg.editor.components.MobileAddHiddenComponentButton', function(componentDefinition){
    /**@type core.managers.component.ComponentDefinition*/
    var def = componentDefinition;

    def.inherits('mobile.core.components.base.BaseComponent');

    def.resources(['W.Commands']);

    def.skinParts({
        button: {type: 'wysiwyg.editor.components.WButton'},
        label : {type: 'wysiwyg.editor.components.inputs.Label'}
    });

    def.methods({

        initialize: function(compId, viewNode, args){
            args = args || {};
            this._buttonArgs = null;
            this._labelArgs = null;
            this.parent(compId, viewNode, args);
            this.setParameters(args);
        },

        _onAllSkinPartsReady: function() {
            this._setSkinPartValues();
        },

        _setSkinPartValues: function() {
            if (!this._allComponentPartsReady || !this._buttonArgs || !this._labelArgs) {
                return;
            }
            this._skinParts.button.setParameters(this._buttonArgs);
            this._skinParts.label.setParameters(this._labelArgs, true);
            this._skinParts.label.setValue(this._labelArgs.label);
            //Fix #MOB-601, keeping here to add back one day
            //this._addToolTipToSkinPart(this._skinParts.button, 'Mobile_re_add_component_ttid');
        },

        setParameters: function(args){
            this._buttonArgs = {
                command         : args.command,
                commandParameter: args.commandParameter
            };
            this._labelArgs = {
                spriteSrc   : args.spriteSrc,
                spriteSize  : args.spriteSize,
                spriteOffset: args.spriteOffset,
                label       : args.label
            };
            this._setSkinPartValues();
        }
    });
});
