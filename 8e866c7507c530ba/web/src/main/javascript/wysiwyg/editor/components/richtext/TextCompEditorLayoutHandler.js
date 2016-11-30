/**
 * @class wysiwyg.editor.components.richtext.TextCompEditorLayoutHandler
 */
define.Class('wysiwyg.editor.components.richtext.TextCompEditorLayoutHandler', function(classDefinition){
    /**@type bootstrap.managers.classmanager.ClassDefinition */
    var def = classDefinition;

    def.fields({
        _ckEditor: null,
        _editedComponent: null,
        _editorComp: null,
        _isResizing: false,
        _isUserChangingHeight: false,
        _normalMinHeight: null
    });

    def.binds(['_goBackToEditableMode', '_updateCkEditorSize']);

    def.methods({

        initialize: function(richTextEditorComp){
            this._editorComp = richTextEditorComp;
        },

        setCkEditorInstance: function(editor){
            this._ckEditor = editor;
        },

        startEditing: function(editedComponent){
            this._editedComponent = editedComponent;
            this._registerToLayoutEvents();
            this._ckEditor.on('instanceReady',this._initCk, this);
            this._ckEditor.isReady && this._initCk();
        },

        _initCk: function(){
            this._normalMinHeight = null;
            this._goBackToEditableMode();
//            this._setAutoGrowMinHeight();
            //TODO: in this case will add scroll to the editor, but the viewer component will be bigger than allowed size..
            this._ckEditor.config.autoGrow_maxHeight = this._editedComponent.getSizeLimits().maxH;
            this._ckEditor.on('autoGrow', this._updateComponentHeight, this);
            this._ckEditor.on('resize', this._updateHeightIfNeeded, this);
        },

        endEditing: function(){
            this._ckEditor.removeListener('autoGrow', this._updateComponentHeight);
            this._ckEditor.removeListener('resize', this._updateHeightIfNeeded);
            this._isUserChangingHeight = false;
            if(!this._editedComponent){
                return;
            }
            this._unregisterLayoutEvents();
        },

        _registerToLayoutEvents: function(){
            this._editedComponent.addEvent('resize', this._updateCkEditorSize);
            this._editedComponent.addEvent('resizeEnd', this._goBackToEditableMode);
        },

        _unregisterLayoutEvents: function(){
            this._editedComponent.removeEvent('resize', this._updateCkEditorSize);
            this._editedComponent.removeEvent('resizeEnd', this._goBackToEditableMode);
        },

        _updateCkEditorSize: function(internal){
            if(!this._isResizing && !internal){
                this._startResize();
            }

            var height = this._editedComponent.getPhysicalHeight();
            var width = this._editedComponent.getWidth();
            if(!internal){
                this._isUserChangingHeight = this._isUserChangingHeight || height !== this._ckEditor.getResizable(true).getSize('height');
            }
            this._ckEditor.resize(width, height, true, false, false);
        },

        /**
         * if the width of the component is changed, the content height changes with it and there is a good chance that we need to update the height as well
         * but if the height is changed as well we need to take care only of the case that the content is bigger than the component
         * @param evtData
         * @private
         */
        _updateHeightIfNeeded: function(evtData){
            var widthChanged = Math.abs(evtData.data.oldWidth - evtData.data.newWidth) > 1;

            //note that there could be a discrepancy between evtData.data.oldWidth and evtData.data.newWidth

            if(widthChanged){
                var contentHeight = CKEDITOR.plugins.autogrow.getContentHeight(this._ckEditor);
                if(!contentHeight || isNaN(contentHeight)){
                    return;
                }
                if(contentHeight > evtData.data.newHeight){
                    //*set minHeight should be after since other wise it will force resize event
                    //* we don't want here a resize event since we want to be able to tell whether the user changes height
                    this._editedComponent.setHeight(contentHeight, false, false);
                    this._editedComponent.setMinH(contentHeight);
                    this._updateCkEditorSize(true);
                } else if(contentHeight < evtData.data.newHeight && !this._isUserChangingHeight){
                    //set minHeight should be before since otherwise it will prevent the set height
                    this._editedComponent.setMinH(contentHeight);
                    this._editedComponent.setHeight(Math.max( contentHeight, this._ckEditor.config.autoGrow_minHeight),false, false);
                    this._updateCkEditorSize(true);
                }
            }
        },

        _startResize: function(){
            this._editorComp.setState('not-editable', 'editable');
            var contentHeightOnStartResize = CKEDITOR.plugins.autogrow.getContentHeight(this._ckEditor);
            this._normalMinHeight = this._editedComponent.getSizeLimits().minH;
            if(contentHeightOnStartResize && !isNaN(contentHeightOnStartResize)){
                this._editedComponent.setMinH(contentHeightOnStartResize);
            }
            this._isResizing = true;
        },

        _goBackToEditableMode: function(){
            this._editorComp.setState('editable', 'editable');
            this._editorComp.setFocus();
            this._normalMinHeight && this._editedComponent.setMinH(this._normalMinHeight);
            this._isUserChangingHeight = false;
            this._setAutoGrowMinHeight();
            this._isResizing = false;
        },

        _updateComponentHeight: function(evtData){
            if(evtData.data.newHeight != evtData.data.currentHeight){
                this._editedComponent.setHeight(evtData.data.newHeight, false, false);
                this._editedComponent.fireEvent('autoSized',{ignoreLayout:false});
            }
        },

        _setAutoGrowMinHeight: function(){
            this._ckEditor.config.autoGrow_minHeight = this._editedComponent.getPhysicalHeight();
            if (CKEDITOR.plugins.autogrow && CKEDITOR.plugins.autogrow.refreshHeightConfig) {
                CKEDITOR.plugins.autogrow.refreshHeightConfig();
            }
        }
    });
});