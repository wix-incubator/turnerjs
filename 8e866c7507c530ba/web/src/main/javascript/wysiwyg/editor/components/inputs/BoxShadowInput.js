define.component('wysiwyg.editor.components.inputs.BoxShadowInput', function(compDefinition){
    /**@type core.managers.component.ComponentDefinition*/
    var def = compDefinition;

    def.inherits('wysiwyg.editor.components.inputs.BaseInput');

    def.utilize(['core.utils.css.BoxShadow']);

    def.skinParts({
        label : {type: 'htmlElement'},
        check : {type: 'wysiwyg.editor.components.inputs.CheckBox'},
        button: {type: 'wysiwyg.editor.components.WButton'}
    });

    def.states({'label': ['hasLabel', 'noLabel']});

    def.binds(['_openShadowDialog', '_shadowVisibilityChanged', '_onShadowChange', '_changeEventHandler']);

    def.methods({
        initialize: function(compId, viewNode, args){
            this.parent(compId, viewNode, args);
            this._value = new this.imports.BoxShadow();
            this._isOn = false;
            this._dialogHasInset = args.hasInset !== false;
            this._dialogHasColor = args.hasColor !== false;
            this._dialogHasDirection = args.hasDirection !== false;

        },

        setValue: function(cssValue, isOn){
            this._value = new this.imports.BoxShadow(cssValue);
            this._setShadowOn((typeof isOn !== 'undefined') ? !!isOn : this._isOn);
        },

        getValue: function(){
            return this._value.getCssValue();
        },

        isShadowOn: function(){
            return !!this._isOn;
        },

        _onAllSkinPartsReady: function(){
            this._skinParts.button.setParameters({
                label   : this.injects().Resources.get('EDITOR_LANGUAGE', 'BOX_SHADOW_BUTTON_ADJUST'),
                iconSrc : 'button/adjust-icon.png',
                iconSize: {width: 16, height: 15},
                minWidth: '55'
            });
            this._skinParts.check.setLabel(this.injects().Resources.get('EDITOR_LANGUAGE', 'ADVANCED_ENABLE_SHADOW'));
            this._skinParts.button.disable();
        },

        disable: function(){
            this.parent();
            if (this.isReady()){
                this._skinParts.check.disable();
                this._skinParts.button.disable();
            }
        },

        enable: function(){
            this.parent();
            if (this.isReady()){
                this._skinParts.check.enable();
                if (this._skinParts.check.getChecked()){
                    this._skinParts.button.enable();
                }
            }
        },

        _openShadowDialog: function(){
            var pos = this.injects().Utils.getPositionRelativeToWindow(this._skinParts.view);
            var dim = this._skinParts.view.getSize();
            var params = {
                shadow      : this._value,
                onChange    : this._onShadowChange,
                //callback    : this._closeShadowDialog,
                top         : pos.y + dim.y * 0.66,
                left        : pos.x + dim.x * 0.66,
                hasColor    : this._dialogHasColor,
                hasInset    : this._dialogHasInset,
                hasDirection: this._dialogHasDirection
            };
            this.injects().Commands.executeCommand('WEditorCommands.ShowBoxShadowDialog', params);
        },

        _onShadowChange: function(event){
            if (!event){
                return;
            }
            this.setValue(event.shadow);
            this._changeEventHandler(event);
        },

        //        _closeShadowDialog: function(){
        //
        //        },

        _shadowVisibilityChanged: function(event){
            this._setShadowOn(event.value);
            this._changeEventHandler(event);
        },

        _setShadowOn: function(isOn){
            this._isOn = !!isOn;
            if (this._isOn){
                this._skinParts.button.enable();
            } else {
                this._skinParts.button.disable();
            }
            this._skinParts.check.setChecked(isOn);
        },

        _changeEventHandler: function(e){
            var value = this.getValue();
            var isOn = this.isShadowOn();
            if (typeof value == 'string'){
                value = this.injects().Utils.convertToHtmlText(value);
            }
            var event = {value: value, isOn: isOn, origEvent: e, compLogic: this};
            this.fireEvent('inputChanged', event);
        },

        _listenToInput: function(){
            this._skinParts.button.addEvent(Constants.CoreEvents.CLICK, this._openShadowDialog);
            this._skinParts.check.addEvent('inputChanged', this._shadowVisibilityChanged);
        },

        _stopListeningToInput: function(){
            this._skinParts.button.removeEvent(Constants.CoreEvents.CLICK, this._openShadowDialog);
            this._skinParts.check.removeEvent('inputChanged', this._shadowVisibilityChanged);
        }
    });
});
