define.component('wysiwyg.editor.components.dialogs.BoxShadowDialog', function(componentDefinition) {
    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition;
    def.skinParts({
        content: {type: 'htmlElement'}
    });
    def.utilize(['core.utils.css.BoxShadow']);
    def.inherits('wysiwyg.editor.components.panels.base.AutoPanel');
    def.binds(['_onBeforeClose', '_onDataChange']);
    def.methods({
        initialize: function(compId, viewNode, args){
            this.parent(compId, viewNode, args);
            args = args || {};
            this._closeCommand = this.injects().Commands.createCommand('cp');
            this._changeCB = args.onChange;
            this._dialogWindow = args.dialogWindow;
            this._dialogWindow.addEvent('onDialogClosing', this._onBeforeClose);
            this._initialValue = new this.imports.BoxShadow(args.shadow);
            this._value = new this.imports.BoxShadow(this._initialValue);
            this.setDataItem(this._createDataFromValue(this._initialValue));

            this._dialogHasInset = args.hasInset !== false;
            this._dialogHasColor = args.hasColor !== false;
            this._dialogHasDirection = args.hasDirection !== false;

            this.getViewNode().on(Constants.CoreEvents.MOUSE_ENTER, this, function() {
                W.Editor.getComponentEditBox().setState('styleChangeOpacity', 'opacityLevel');
            });
            this.getViewNode().on(Constants.CoreEvents.MOUSE_LEAVE, this, function() {
                W.Editor.getComponentEditBox().setState('fullOpacity', 'opacityLevel');
            });
        },

        _createDataFromValue: function(boxShadow){
            var dataObj = {
                angle   : boxShadow.getAngle(true) * (-1),
                distance: boxShadow.getDistance(),
                blur    : boxShadow.getBlurRadius(),
                spread  : boxShadow.getSpreadRadius(),
                color   : boxShadow.getColor(),
                inset   : boxShadow.getInset()
            };
            return this.injects().Data.createDataItem(dataObj);
        },

        _createFields: function(){
            this.addBreakLine(null, null, '5px');
            if (this._dialogHasInset){
                this.addInputGroupField(function(){
                    var list = [
                        {value: 'outer', label: this._translate('BOX_SHADOW_OUTER')},
                        {value: 'inner', label: this._translate('BOX_SHADOW_INNER')}
                    ];
                    this.addRadioButtonsField(null, list, 'outer', null, 'inline').bindToField('inset').bindHooks(function(inputValue){
                        return (inputValue == 'inner') ? 'inset' : '';
                    }, function(dataValue){
                        return (dataValue == 'inset') ? 'inner' : 'outer';

                    });
                });
            }
            if (this._dialogHasDirection){
                this.addInputGroupField(function(){
                    this.addCircleSliderField(this._translate('BOX_SHADOW_DIRECTION'), false, true).bindToField('angle');
                });
            }
            this.addInputGroupField(function(){
                this.addSliderField(this._translate('BOX_SHADOW_DISTANCE'), 0, 50, 1, false, true, true, false, 'px').bindToField('distance');
                this.addSliderField(this._translate('BOX_SHADOW_SIZE'), -50, 50, 1, false, true, true, false, 'px').bindToField('spread');
                this.addSliderField(this._translate('BOX_SHADOW_BLUR'), 0, 50, 1, false, true, true, false, 'px').bindToField('blur');
            });
            if (this._dialogHasColor){
                this.addInputGroupField(function(){
                    this.addColorField(this._translate('BOX_SHADOW_COLOR'), true, 'dialog').bindToField('color');
                });
            }
        },

        _onDataChange: function(dataItem, field, value){
            switch (field){
                case 'angle'   :
                    this._value.setAngle(value.angle * (-1), true);
                    break;
                case 'distance':
                    this._value.setDistance(value.distance);
                    break;
                case 'blur'    :
                    this._value.setBlurRadius(value.blur);
                    break;
                case 'spread'  :
                    this._value.setSpreadRadius(value.spread);
                    break;
                case 'color'   :
                    this._value.setColor(value.color);
                    break;
                case 'inset'   :
                    this._value.setInset(value.inset);
                    break;
            }
            this._onShadowChange(this._value.getThemeString());
        },

        _onShadowChange: function(shadowString, cause){
            cause = cause || 'change';
            this._changeCB({shadow: shadowString, cause: cause});
        },

        _onBeforeClose: function(e){
            var cause = 'cancel';
            var shadowString = this._initialValue.getThemeString();
            if (e && e.result == 'OK'){
                cause = 'ok';
                shadowString = this._value.getThemeString();
            }
            this._onShadowChange(shadowString, cause);
            W.Editor.getComponentEditBox().setState('fullOpacity', 'opacityLevel');
        }

    });
});