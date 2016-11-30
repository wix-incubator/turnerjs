define.component('wysiwyg.editor.components.inputs.Link', function(componentDefinition) {
    /** @type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('wysiwyg.editor.components.inputs.Input');

    def.skinParts({
        label: {type: 'htmlElement'},
        input: {type: 'htmlElement'}
    });

    def.binds(['_openLinkDialog', '_onLinkDialogClosed']);

    def.states({'label': ['hasLabel', 'noLabel'], 'validation': ['invalid']});

    def.resources(['W.Utils', 'W.Commands', 'W.Resources', 'W.UndoRedoManager', 'W.Preview']);

    def.utilize(['wysiwyg.common.utils.LinkRenderer']);

    def.methods({
        initialize: function(compId, viewNode, args) {
            this.parent(compId, viewNode, args);
            args = args || {};
            this._placeholderText = args.placeholderText || this.resources.W.Resources.get('EDITOR_LANGUAGE', 'LINK_ADD_LINK');
            this._changeCallBack = args.changeCallBack;
            this._state = "Link";
            this._previewData = args.previewData;

            this._renderer = new this.imports.LinkRenderer() ;
        },

        /**
         * @override
         */
        setValue: function(val, isPreset){
            this._linkData = Object.subset(val, ['href', 'icon', 'linkType', 'target', 'text', 'type']);
            var displayVal = this._linkStringFromObj(val);
            return this.parent(displayVal, isPreset);
        },

        /**
         * @override
         */
        getValue: function(){
            var data = this.getDataItem().getData() ;
            return this._linkStringFromObj(data);
        },

        _linkStringFromObj: function(data){
            if(!data || !data.link) {
                return "";
            }

            var preview = this.resources.W.Preview ;
            var previewData = preview.getPreviewManagers().Data ;
            var linkData = previewData.getDataByQuery(data.link) ;
            if(linkData) {
                return this._renderer.renderLinkDataItemForPropertyPanel(linkData) ;
            } else {
                return "" ;
            }
        },

        _onAllSkinPartsReady:function(){
            this._skinParts.input.set('readonly', 'readonly');
            this.parent();
        },
        /**
         * @override
         * disable validation
         */
        getInputValidationErrorMessage:function() {
            return '';
        },

        _openLinkDialog:function(e){
            var pos = this.resources.W.Utils.getPositionRelativeToWindow(this._skinParts.view);
            var undoRedoManager = this.resources.W.UndoRedoManager;
            undoRedoManager.isActionSupportedByURM = undoRedoManager.checkIfDataChangeSupportedByURM(e);

            var params = {
                data            : this._previewData,
                closeCallback   : this._onLinkDialogClosed,
                top             : pos.y,
                left            : pos.x
            };
            this.resources.W.Commands.executeCommand('WEditorCommands.OpenLinkDialogCommand', params);

        },

        _onLinkDialogClosed:function(state, dialogDataItem){
            if (this._changeCallBack){
                this._changeCallBack(state, dialogDataItem);
            }
        },



        /**
         * @override
         * Assign change events
         */
        _listenToInput: function() {
            this._skinParts.input.addEvent(Constants.CoreEvents.CLICK, this._openLinkDialog);
            this._skinParts.input.addEvent(Constants.CoreEvents.BLUR, this._deselectPresetFieldContent);
        },
        /**
         * @override
         * Remove change events
         */
        _stopListeningToInput: function() {
            this._skinParts.input.removeEvent(Constants.CoreEvents.CLICK, this._openLinkDialog);
            this._skinParts.input.removeEvent(Constants.CoreEvents.BLUR, this._deselectPresetFieldContent);
        }
    });
});