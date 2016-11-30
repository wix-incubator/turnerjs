define.component('wysiwyg.editor.components.inputs.ComboBox', function(componentDefinition){
    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition;
    def.skinParts({
        label:  {type: 'htmlElement'},
        collection: {type: 'htmlElement'}
    });
    def.inherits('wysiwyg.editor.components.inputs.SelectionListInput');
    def.states({
        'label': ['hasLabel', 'noLabel']
    });
    def.dataTypes(['', 'list']);
    def.methods({
        /**
         * @override
         * Initialize Input
         * @param compId
         * @param viewNode
         * @param args
         * Optional args:
         * labelText: the value of the label to show above/next to the field
         * defaultValue: the value that should be selected initially
         */
        initialize: function(compId, viewNode, args) {
            this.parent(compId, viewNode, args);
            //            this._defaultValue = args.defaultValue || null;
            this._htmlItems = {};
            this._omitBreakLinesUsage = true;
        },

        render: function() {
            this.parent();
            if (this._dataFieldName) {
                this.setValue(this._data.get(this._dataFieldName));
            }
        },

        /**
         * @override
         */
        _createSingleRepeater:function(rawData){
            var htmlElement = new Element('option');
            htmlElement.set({value: rawData.value, html: rawData.label || rawData.value});
            if (rawData.styles){
                htmlElement.setStyles(rawData.styles);
            }

            this._htmlItems[rawData.value] = htmlElement;
            return htmlElement;
        },

        /**
         * @override
         * Set the value of the select field
         * @param value The value to select
         */
        setValue: function(value){
            var selectedOld = this._skinParts.collection.getSelected()[0];
            var selectedNew = this._htmlItems[value];
            if (selectedNew){
                selectedOld && selectedOld.erase('selected');
                selectedNew.set('selected', 'selected');
            }
        },

        getValue: function(){
            return this._skinParts.collection.get('value');
        },

        /**
         * @override
         * Assign change events
         */
        _listenToInput: function() {
            this._skinParts.collection.addEvent(Constants.CoreEvents.CHANGE, this._changeEventHandler);
        },
        /**
         * @override
         * Remove change events
         */
        _stopListeningToInput: function() {
            this._skinParts.collection.removeEvent(Constants.CoreEvents.CHANGE, this._changeEventHandler);
        },

        setFocus:function(){
            this._skinParts.collection.focus();
        }
    });
});