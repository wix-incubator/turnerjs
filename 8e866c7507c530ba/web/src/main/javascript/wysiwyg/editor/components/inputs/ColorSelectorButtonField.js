define.component('wysiwyg.editor.components.inputs.ColorSelectorButtonField', function(componentDefinition){
    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition;
    def.skinParts({
        label: {type: 'htmlElement'},
        name: {type: 'htmlElement'},
        icon: {type: 'htmlElement'},
        iconBg: {type: 'htmlElement'}
    });
    def.traits(['wysiwyg.editor.components.traits.BindValueToData']);
    def.utilize(['core.utils.css.Color']);
    def.inherits('wysiwyg.editor.components.inputs.BaseInput');
    def.states({'label': ['hasLabel', 'noLabel'], 'mouse': ['over', 'pressed', 'selected']});
    def.binds(['_onMouseOver', '_onMouseOut', '_onMouseDown', '_onMouseUp', '_changeEventHandler']);
    def.methods({
        initialize: function(compId, viewNode, args) {
            this.parent(compId, viewNode, args);
            args = args || {};
            this._color = args.colorObj || new this.imports.Color();
            this._value = args.colorName;
            this._name = (this._value)? this.injects().Resources.get('EDITOR_LANGUAGE', this._value) : '';
            this._selected = args.selected || false;
        },

        render: function() {
            this.parent();
            this._skinParts.iconBg.setStyle('background', this._color.getHex());
            this._skinParts.name.set('text', this._name);
            this.toggleSelected(this._selected);
        },

        toggleSelected: function(force){
            if (typeof force != 'undefined'){
                this._selected = !!force;
            }
            if (this._selected){
                this.setState('selected', 'mouse');
                this._stopListeningToInput();
            }else{
                this.removeState('selected', 'mouse');
                this._stopListeningToInput();
                this._listenToInput();

            }
        },

        _onMouseOver: function(){
            this.setState('over', 'mouse');
        },
        _onMouseOut: function(){
            this.removeState('over', 'mouse');
            this._onMouseUp();
        },
        _onMouseDown: function(){
            this.setState('pressed', 'mouse');
        },
        _onMouseUp: function(){
            this.removeState('pressed', 'mouse');
        },

        _changeEventHandler: function(e) {
            var value = this.getValue();
            if (typeof value == 'string'){
                value = this.injects().Utils.convertToHtmlText(value);
            }
            var event = {value: value, origEvent: e, compLogic: this};
            this.fireEvent('inputChanged', event);
            this.fireEvent(Constants.CoreEvents.CLICK, event);
        },
        /**
         * @override
         * Assign change events
         */
        _listenToInput: function() {
            this._skinParts.view.addEvent(Constants.CoreEvents.MOUSE_OVER, this._onMouseOver);
            this._skinParts.view.addEvent(Constants.CoreEvents.MOUSE_OUT, this._onMouseOut);
            this._skinParts.view.addEvent(Constants.CoreEvents.MOUSE_DOWN, this._onMouseDown);
            this._skinParts.view.addEvent(Constants.CoreEvents.MOUSE_UP, this._onMouseUp);
            this._skinParts.view.addEvent(Constants.CoreEvents.CLICK, this._changeEventHandler);
        },
        /**
         * @override
         * Remove change events
         */
        _stopListeningToInput: function() {
            this._skinParts.view.removeEvent(Constants.CoreEvents.MOUSE_OVER, this._onMouseOver);
            this._skinParts.view.removeEvent(Constants.CoreEvents.MOUSE_OUT, this._onMouseOut);
            this._skinParts.view.removeEvent(Constants.CoreEvents.MOUSE_DOWN, this._onMouseDown);
            this._skinParts.view.removeEvent(Constants.CoreEvents.MOUSE_UP, this._onMouseUp);
            this._skinParts.view.removeEvent(Constants.CoreEvents.CLICK, this._changeEventHandler);

        }
    });
});