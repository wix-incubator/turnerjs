define.component('wysiwyg.editor.components.inputs.DocInput', function(componentDefinition){
    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('wysiwyg.editor.components.inputs.BaseInput');

    def.states({'label': ['hasLabel', 'noLabel']});
    def.binds(['_openMediaDialog', '_onDocSelect']);

    def.skinParts({
        label: {type: 'htmlElement'},
        docName: {type: 'htmlElement'}
    });

    def.methods({
        /**
         * @override
         * Initialize Input
         * @param compId
         * @param viewNode
         * @param args
         * Optional args:
         * buttonText: {String} The text of the image replacement button
         * data: {Object} The Image data object
         */
        initialize: function(compId, viewNode, args) {
            this.parent(compId, viewNode, args);
            this._buttonText = args.buttonText || '';
            this._docRawData = null;
        },
        /**
         * Render the component,
         * at the end of each render, before the fireComponentReady command
         * _stopListeningToInput() and _listenToInput() should be called
         */
        render: function() {
            this.parent();
            if (this._data) {
                this._buttonText = this._data.get('text');
            }
            this.setButton(this._buttonText);
            if(this._dataIsOfTypeDoc()){
                this._docRawData = this._data.getData();
            }
            if (this._docRawData){
                this.setValue(this._docRawData);
            }
            this._listenToInput();

        },
        /**
         * Set the image from an imageDataType object
         * @param {Object} rawData The image data object to set
         */
        setValue: function(rawData){
            if (rawData){
                this._docRawData = rawData;
                if(this._dataIsOfTypeDoc()){
                    this._data.setData(rawData);
                }
            }
        },

        /**
         * Returns the details of the image as an imageDataType object
         */
        getValue: function(){
            return this._docRawData || null;
        },
        /**
         * Set the text on the "choose doc" button
         * @param text If text value is falsie - hide the button
         */
        setButton: function(text){
            if (text){
                this._skinParts.docName.set('value', text);
            }else{
                this._skinParts.docName.set('value', '');
            }
        },

        _dataIsOfTypeDoc: function(){
            return this._data && this._data.getType && this._data.getType() == 'Document';
        },
        /**
         * Open dialog
         */
        _openMediaDialog: function(){
            W.EditorDialogs.openMediaDialog(this._onDocSelect, false, 'documents');
        },
        _onDocSelect: function(rawData){
            //doc files - updates the title during download if it's not a pdf. For pdf's it does not do this, so that it can open in the browser.
            if(this._rawDataIsOfTypePDF(rawData.uri)){
                rawData.isPDF = true;
            }
            this._buttonText = rawData.title;
            this.setValue(rawData);
            this._changeEventHandler();
        },
        _rawDataIsOfTypePDF: function(dataURI){
            var dataURIparts = dataURI.split('.');
            var fileExtension = dataURIparts[dataURIparts.length-1];
            return fileExtension.indexOf('pdf') !== -1;
        },
        _changeEventHandler: function(e) {
            this.parent(e);
        },

        setFocus: function(){
            this._skinParts.docName.focus();
        },
        /**
         * Assign change events
         */
        _listenToInput: function() {
            this._view.addEvent(Constants.CoreEvents.CLICK, this._openMediaDialog);
        },
        /**
         * Remove change events
         */
        _stopListeningToInput: function() {
            this._view.removeEvent(Constants.CoreEvents.CLICK, this._openMediaDialog);
        }
    });
});
