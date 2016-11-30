define.component('wysiwyg.editor.components.richtext.WRichTextEditor', function(componentDefinition){
    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('mobile.core.components.base.BaseComponent');

    def.utilize(['wysiwyg.editor.components.richtext.TextCompEditorLayoutHandler',
        'wysiwyg.editor.components.richtext.TextStylesHandler',
        'wysiwyg.editor.components.richtext.TextFontsHandler',
        'wysiwyg.common.utils.TextMigrationHandler',
        'wysiwyg.editor.layoutalgorithms.TextLayoutCalculator'
    ]);

    def.traits(['wysiwyg.editor.components.richtext.WRTEClosingTrait',
        'wysiwyg.editor.components.richtext.WRTEToolbarTrait',
        'wysiwyg.editor.components.richtext.WRTEUndoTrait']);

    def.resources(['W.Preview', 'W.Config', 'W.Data', 'W.Commands', 'W.Editor', 'W.UndoRedoManager', 'W.Utils', 'W.Resources', 'topology']);

    def.dataTypes(['Text', 'RichText', '']);

    def.states({
        'editable': ['editable', 'not-editable'],
        'loadingFont' : ['fontReady','waitingForFont']
    });

    def.skinParts({
        ckArea: {type: Constants.ComponentPartTypes.HTML_ELEMENT},
        toolBar: {'type':'wysiwyg.editor.components.richtext.ToolBar', hookMethod: '_setToolBarArguments'},
        componentToolBar: {'type':'wysiwyg.editor.components.richtext.ComponentToolBar', hookMethod: '_setToolBarArguments'}
    });

    def.fields({
        _ckEditor: null,
        _editedComponent: null,
        _compSizeSync: null,
        _stylesHandler:null,
        _fontsHandler: null,
        _isFixedHeight: false,
        _getDataOnCKChange: false,
        _locked: false,
        _isInitiallyCollapsed: true
    });

    def.statics({
        ATTRIBUTE_LIST: ["id", "comp","dataquery","propertyquery","styleid","skin","skinpart","y","x","scale", "angle", "idprefix","state","container","listposition","hasproxy", "vcfield", "vcview", "vctype", "pos"],
        IMAGE_ATTRIBUTES: ["src", "style", "wix-comp"]
    });

    def.methods({
        initialize: function(compId, viewNode, extraArgs){
            this.parent(compId, viewNode, extraArgs);
            this._extraArgs = extraArgs;
            this._isFixedHeight = !!extraArgs.isFixedHeight;
            this._isInitiallyCollapsed = extraArgs.isInitiallyCollapsed !== false;
            this._getDataOnCKChange = !!extraArgs.getDataOnCKChange;
            this.setState('editable','editable');
            /** @type wysiwyg.editor.components.richtext.TextCompEditorLayoutHandler */
            this._compSizeSync = new this.imports.TextCompEditorLayoutHandler(this);
            this._stylesHandler = new this.imports.TextStylesHandler(extraArgs.addTextBackground);
            this._fontsHandler = new this.imports.TextFontsHandler();
            this._migrationHandler = new this.imports.TextMigrationHandler();
            this._textLayoutCalculator = new this.imports.TextLayoutCalculator();
            this._undoRedoManager = this.resources.W.UndoRedoManager;

            this.resources.W.Preview.getPreviewManagersAsync(this._onCssManagerReady, this);

            if (this._isInitiallyCollapsed) {
                this.collapse();
            }

            this.isEditorText = extraArgs.isEditorText;
            this.resources.W.Commands.registerCommandAndListener('WEditorCommands.toggleFontLoaderImage', this, this._setLoadingFont);
        },
        _onCssManagerReady: function(managers) {
            this._viewer = {
                css: managers.Css
            };
        },
        _setLoadingFont: function(waitForFont){
            if (waitForFont){
                this.setState('waitingForFont','loadingFont');
            } else {
                this.setState('fontReady','loadingFont');
            }
        },

        _calcTextRealMaxWidth: function(textDiv) {
            var textRectangles = this._textLayoutCalculator.getEffectiveTextLayout(textDiv);
            var maxWidth = Number.MIN_VALUE;

            _.forEach(textRectangles, function(rect) {
                var curWidth = rect.right - rect.left;
                maxWidth = _.max([maxWidth, curWidth]);
            });

            return maxWidth;
        },

        _validateAndFixComponentWidth: function (size) {
            if (!this._isFixedHeight) { //autogrow is disabled when fixed height is true (wixapps...)
                var editedTextWidth = this._calcTextRealMaxWidth(this._editedComponent.$view);
                if (size.x < editedTextWidth) {
                    this._editedComponent.setWidth(editedTextWidth);
                    size.x = editedTextWidth;
                }
            }
        },

        /**
         * @param {wysiwyg.viewer.components.RichText} editedComponent
         */
        startEditingComponent: function(editedComponent){
            this.__dataBeforeEditing = '';
            try {
                this._editedComponent = editedComponent;
                var size = this.getComponentSize();
                this._validateAndFixComponentWidth(size);
                var data = this._getComponentText();
                this.__dataBeforeEditing = data;
                var migratedText;
                if (this._shouldMigrateComponentData(this._editedComponent)) {
                    LOG.reportError(wixErrors.MIGRATING_OLD_TEXT);
                    migratedText = this._migrationHandler.migrateComponent(this._editedComponent);
                }

                //we remove the data from the component so that we can resize the component to smaller size than the initial.
                this._setComponentText('');
                this._editedComponent.setHeight(size.y);
                this._startUndoTransaction(size, data, migratedText);
                this.startEditing(this._dataBeforeStartEditing, size.y, size.x, this._getCompStylesMapData());
            } catch(err) {
                this._handleError(wixErrors.RICH_TEXT_UKNOWN_FAILURE, this.$className, 'startEditingComponent', {"desc" : err.stack});
            }
        },

        startEditing: function(htmlData, height, width, stylesMapDataItem){
            if (!this.isInEditingMode && !this._locked) {
                try {
                    this._locked = true;
                    this.resources.W.Utils.freezeScroll(750);
                    this.resources.W.Editor.hideFloatingPanel();
                    this.resources.W.Editor.disableEditCommands();
                    this.isInEditingMode = true;
                    this._setAutoClose();
                    var fullMapId = this._getFullStylesMapId(stylesMapDataItem);
                    this._validateCkInitialization(function(){
                        try {
                            this._ckEditor.isReady = true;
                            this._stylesHandler.setStylesMapsToCk(fullMapId);
                            this._setStylesToToolBar(fullMapId);
                            this._ckEditor.setReadOnly(false);
                            this._ckEditor.setData(
                                htmlData,
                                function() {
                                    this._ckEditor.resetUndo(); // reset the undo stack after data is ready
                                    this.fireEvent("richTextEditorReady");
                                    this.trigger("richTextEditorReady");
                                }.bind(this)
                            );
                            //appendCssToCkEditor is called after setData, because setData replaces the whole html in the iframe
                            this._stylesHandler.appendCssToCkEditor(fullMapId);
                            this._setEditorSize(height, width);
                            this.uncollapse();
                            this._showToolbar();

                            if (this._editedComponent) { //wix apps do not pass edited component
                                this._compSizeSync.startEditing(this._editedComponent);
                            }

                            this._locked = false;
                        } catch(err) {
                            this._handleError(wixErrors.RICH_TEXT_UKNOWN_FAILURE, this.$className, '_validateCkInitializationCB', {"desc" : err.stack});
                        }
                    });
                } catch(err) {
                    this._handleError(wixErrors.RICH_TEXT_UKNOWN_FAILURE, this.$className, 'startEditing', {"desc" : err.stack});
                }
            }
        },

        _onContentDom: function(){
            this._fontsHandler.startEditing();
            this._propagateCkMouseDownToEditor();
            if (!this._isFixedHeight) {
                this._ckEditor.editable().$.style.overflow = "hidden";
            }
        },

        endEditing: function () {
            var currentTextComp = this._editedComponent;
            var wasUndoCalled = false;
            var isEmptyText = false;
            try {
                if(!this.isInEditingMode || this._locked){
                    return;
                }
                var data = this._getCKData();
                if(currentTextComp){
                    this._setComponentText(data, this._dataBeforeStartEditing);
                    //calculation of isEmptyText must be here because handleUndo will revert the components data if this is empty text
                    isEmptyText = this._isEmptyText(currentTextComp);
                    this._handleUndo(isEmptyText);
                    wasUndoCalled = true;
                    this._compSizeSync.endEditing();
                    this._editedComponent = null;
                }
                this.fireEvent('endEditing', data);
                this._setLoadingFont(false);
                this.closeCkEditor();
            } catch(err) {
                this._handleError(wixErrors.RICH_TEXT_UKNOWN_FAILURE, this.$className, 'endEditing', {"desc" : err.stack});
                if (!wasUndoCalled) {
                    this._handleUndo();
                }
            }
            if(isEmptyText) {
                this._handleEmptyText(currentTextComp);
            }
            return data;
        },

        _isEmptyText: function (textComp) {
            return textComp.$view.textContent.length < 1;
        },

        _handleEmptyText: function(textComp) {
            var editedCompBeforeDelete = this.resources.W.Editor.getEditedComponent(),
                isSelectedComponentTextEditor = _.isEqual(textComp, editedCompBeforeDelete);

            this.resources.W.Editor.setSelectedComp(textComp);
            this.resources.W.Commands.executeCommand('WEditorCommands.WDeleteSelectedComponent');
            if(!isSelectedComponentTextEditor) {
                this.resources.W.Editor.setSelectedComp(editedCompBeforeDelete);
            }

            LOG.reportEvent(wixEvents.TXT_EDITOR_REMOVE_EMPTY_BOX);
        },

        setFocus: function () {
            this._ckEditor.focus();
        },

        dispose: function(){
            this._ckEditor && this._ckEditor.destroy(true);

            this.parent();
        },

        _shouldMigrateComponentData: function(editedComponent) {
            var dataType = editedComponent.getDataItem().getType();
            return dataType !== 'StyledText' && dataType !== 'MediaRichText';
        },

        _onEditorReady: function (callback) {
            this._ckEditor.setReadOnly(true);
            this._ckIsReady = true;
            this._skinParts.toolBar.setEditorInstance(this._ckEditor, this.isEditorText);
            callback.call(this);
            window.setPreloaderState('ready');
            if (this._editedComponent) {
                this._editedComponent.setLoading(false);
            }
            this._skinParts.componentToolBar.setEditorInstance(this._ckEditor);
        },

        _validateCkInitialization: function(callback){
            if(this._ckEditor) {
                callback.call(this);
                return;
            }

            setTimeout(function() {
                if(!this._ckIsReady) {
                    this._handleError(wixErrors.RICH_TEXT_LOADING_TIMEOUT, this.$className, '_validateCkInitialization');
                }
            }.bind(this), 5000);

            window.setPreloaderState('invisibleLockEditor');
            if (this._editedComponent) {
                this._editedComponent.setLoading(true);
            }

            CKEDITOR.config.wixViewerCss = this.resources.topology.wysiwyg + "/css/wysiwyg/viewerWeb.css";
            CKEDITOR.config.helveticaFonts = this._viewer.css.getHelveticaCssUrl();
            var self = this;
            this._ckEditor = CKEDITOR.replace(this._skinParts.ckArea,{
                customConfig: 'my/myConfig.js',
                removePlugins: 'resize' + (self._isFixedHeight ? ',autogrow' : '')
            });

            this._ckEditor.on('instanceReady', function(){
                this._onEditorReady(callback);
            }, this);
            this._ckEditor.on('contentDom', this._onContentDom, this);
            this._ckEditor.on('dataReady', this._setFocus, this);
            this._ckEditor.on('change', this._handleCKDataChange, this);
            this._compSizeSync.setCkEditorInstance(this._ckEditor);
            this._stylesHandler.setCkEditorInstance(this._ckEditor);
            this._fontsHandler.setCkEditorInstance(this._ckEditor);

            this._ckEditor.on('wixCompSelected', function(compData) {
                if (compData.data === null) {
                    this._hideComponentsToolbar();
                } else {
                    this._showComponentToolbar(compData.data);
                }
            }, this);
        },

        _setFocus: function(){
            var element  = this._ckEditor.editable();
            var range = new CKEDITOR.dom.range(element);
            range.moveToElementEditablePosition(element, false);
            range.select();
            this.setFocus();
        },

        _handleCKDataChange: function (event) {
            this._undoIfContentTooLong(event);
            if (this._getDataOnCKChange) {
                var data = this._ckEditor.getData();
                // doesn't handle this._editedComponent !== null
                this.fireEvent("ckDataChanged", data);
            }
        },

        _undoIfContentTooLong: function(event){
            var newDataLength =  this._ckEditor.editable().getHtml().length;
            if (newDataLength === this.currentLength) {
                return;
            }
            // TODO
            //var code = event.data.keyCode;
            //this.isDeleting = code == 8 || code == 46;

            this.currentLength = newDataLength;
            if (this.currentLength > Constants.RichText.MAX_LIMIT) {
                W.EditorDialogs.openErrorDialog(
                    this.resources.W.Resources.get('EDITOR_LANGUAGE', 'TEXT_TOO_LONG', 'Oops'),
                    this.resources.W.Resources.get('EDITOR_LANGUAGE', 'TEXT_TOO_LONG_DESC', 'You have entered too much text for this box.'),
                    undefined,
                    function() {
                        this._ckEditor.execCommand('undo');
                    }.bind(this)
                );
            }
        },

        isTextComponentValid: function () {
            return !!(this._editedComponent && this._editedComponent.$view && this._editedComponent.getDataItem());
        },

        _setComponentText: function(data, oldValue){
            if (this.isTextComponentValid()) {
                var textDataItem = this._editedComponent.getDataItem();

                if(data !== "" && this._editedComponent.markInnerCompsForDispose){
                    this._editedComponent.markInnerCompsForDispose();
                    this._updateComponentsRefList(textDataItem, data);
                    this._editedComponent.disposeUnusedComps();
                }

                //change to apply!!
                if (oldValue) {
                    textDataItem.set('text', data, undefined, this._editedComponent, {text: oldValue});
                }
                else {
                    textDataItem.set('text', data);
                }
            }
        },

        _updateComponentsRefList: function(textDataItem, data){
            var innerCompsJsonDataArray = this.getCompPlaceholdersData(data);

            var refLists = [];

            _.forEach(innerCompsJsonDataArray, function(compJson){
                refLists.push("#" + compJson.dataQuery);
                this._editedComponent.markInnerCompAsUsed(compJson.id);
            }, this);

            textDataItem.set('componentDataList', refLists, true);
        },

        /**
         * return an array of elements who have the wix-comp attribute
         * TODO move to trait ???
         */
        getCompPlaceholdersData: function(elementHtmlContent){
            var div = document.createElement('div');
            div.innerHTML = elementHtmlContent;
            var placeHolders = $(div).getElements("*[wix-comp]");
            return _.map(placeHolders, function(currentPh){
                return JSON.parse(currentPh.get('wix-comp'));
            });
        },

        _getComponentText: function(){
            var dataItem = this._editedComponent.getDataItem();
            return dataItem.get('text');
        },

        getComponentSize: function(){
            if(!this._editedComponent){
                return;
            }
            return {'x': this._editedComponent.getWidth(), 'y': this._editedComponent.getPhysicalHeight()};
        },

        _setEditorSize: function(height, width){
            this._ckEditor.resize(width || '100%', height, true, false, false);
        },

        _getFullStylesMapId: function(specificStylesMapDataItem){
            var dataMngr = this.resources.W.Data;
            var newItemId = specificStylesMapDataItem.get('id') + '_Full';
            if(dataMngr.isDataAvailable('#' + newItemId)){
                return newItemId;
            }
            var compStylesMap = specificStylesMapDataItem.get('items');
            var generalStylesMap = dataMngr.getDataByQuery('#CK_EDITOR_FONT_STYLES').get('items');

            var compFullMap = Object.map(compStylesMap, function(item){
                var className = item.cssClass;
                return Object.append(Object.clone(generalStylesMap[className]), item);
            });

            dataMngr.addDataItem(newItemId, {
                'type': 'map',
                'items': compFullMap
            });
            return newItemId;
        },

        _getCompStylesMapData: function(){
            if(!this._editedComponent){
                return null;
            }
            var compData = this._editedComponent.getDataItem();
            var dataMngr = this.resources.W.Data;
            var compStylesMapId = compData.get('stylesMapId');
            return dataMngr.getDataByQuery('#'+compStylesMapId);
        },

        _handleError: function(wixError, className, funcName, params) {
            LOG.reportError(wixError, className, funcName, params);
            window.setPreloaderState('ready');
            if (this._editedComponent) {
                this._setComponentText(this.__dataBeforeEditing);
                this._editedComponent.setLoading(false);
            }
            this._locked = false;
            this.closeCkEditor();
        },

        closeCkEditor: function () {
            this.collapse();
            if (this._ckEditor && this._ckEditor.status === "ready" && this._ckEditor.window.getFrame() !== null) {
                this._ckEditor.getSelection().reset();
                this._ckEditor.setReadOnly(true);
            }
            this._skinParts.toolBar.stopEditing(true);
            this.isInEditingMode = false;
            this.resources.W.Editor.enableEditCommands();
        },

        _getCKData:function() {
            if (this._ckEditor) {
                this._removeRedundantAttributes(this._ckEditor.editable().$);
                return this._ckEditor.getData();
            } else {
                return this._dataBeforeStartEditing;
            }
        },
        _removeRedundantAttributes: function(element) {
            for (var i=0; i< element.children.length; i++) {
                var child = element.children[i];
                this._removeAttributes(child);
                this._removeRedundantAttributes(child);
            }
        },
        _removeAttributes: function (element) {
            var attrs2remove = [];
            if (element.nodeName.toLowerCase() === 'img') {
                var attrNames = _.map(element.attributes, function(attribute) {
                    return attribute.nodeName.toLowerCase();
                });

                attrs2remove = _.difference(attrNames, this.IMAGE_ATTRIBUTES);
            } else {
                _.forEach(this.ATTRIBUTE_LIST, function(attrName) {
                    if (element.nodeName.toLowerCase() !== 'a' || attrName !== 'dataquery') {
                        attrs2remove.push(attrName);
                    }
                });
            }

            _.forEach(attrs2remove, function(attrName) {
                element.removeAttribute(attrName);
            });
        },
        getCKEditor: function() {
            return this._ckEditor;
        }
    });
});
