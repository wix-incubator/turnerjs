define.experiment.component('wysiwyg.editor.components.richtext.WRichTextEditor.funtextico', function(componentDefinition, experimentStrategy) {
    /**@type core.managers.component.ComponentDefinition*/
    var def = componentDefinition;

    /**@type bootstrap.managers.experiments.ExperimentStrategy*/
    var strategy = experimentStrategy;

    def.binds(["_initWhenAllReady"]);

    def.methods({
        initialize: strategy.after(function(compId, viewNode, extraArgs) {
            this._shouldCloseOnlyInComponentsPanel = !!extraArgs.shouldCloseOnlyInComponentsPanel;
        }),
        _onCssManagerReady: function(managers) {
            this._viewer = {
                css: managers.Css
            };

            this._initWhenAllReady();
        },

        /**
         * function make sure both CKEDITOR library and WRichTextEditor component are ready
         * @private
         */
        _initWhenAllReady: function() {
            //check if WRichTextEditor component is ready
            if (!this._componentReady || !this._skinParts) {
                this.addEvent(Constants.ComponentEvents.READY, this._initWhenAllReady);
                return;
            }

            //check if CKEDITOR is loaded
            if (CKEDITOR.status === 'unloaded' || !CKEDITOR.on) {
                setTimeout(this._initWhenAllReady, 50);
                return;
            } else if (CKEDITOR.status != 'loaded') {
                CKEDITOR.on('loaded', this._initWhenAllReady);
                return;
            }

            this._validateCkInitialization();
        },
        _createSetDataTimeout: function (htmlData) {
            var currentCompId = this._editedComponent && this._editedComponent.getComponentId();

            this._setDataTimeoutHandle = setTimeout(function () {
                if (this._locked && (!this._editedComponent || (currentCompId === this._editedComponent.getComponentId()))) {
                    this._handleError(wixErrors.RICH_TEXT_LOADING_TIMEOUT, this.$className, 'startEditing', {"desc": htmlData});
                }
            }.bind(this), 2000);
        },
        startEditing: function(htmlData, height, width, stylesMapDataItem){
            window.setPreloaderState('invisibleLockEditor');
            if(!this._ckIsReady) {
                this.once("WRTE.CKReady", this, function () {
                    this.startEditing(htmlData, height, width, stylesMapDataItem);
                });
            } else if (!this.isInEditingMode && !this._locked) {
                try {
                    this._locked = true;
                    this.resources.W.Utils.freezeScroll(750);
                    this.resources.W.Editor.hideFloatingPanel();
                    this.resources.W.Editor.disableEditCommands();
                    this.isInEditingMode = true;
                    this._setAutoClose();
                    var fullMapId = this._getFullStylesMapId(stylesMapDataItem);

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

                            setTimeout(function() {
                                this._setComponentText('');
                                this.uncollapse();

                                this._locked = false;
                                this._clearSetDataTimeout();

                                window.setPreloaderState('ready');
                            }.bind(this), 0);
                        }.bind(this)
                    );
                    //appendCssToCkEditor is called after setData, because setData replaces the whole html in the iframe
                    this._stylesHandler.appendCssToCkEditor(fullMapId);
                    this._setEditorSize(height, width);
                    this._showToolbar();

                    if (this._editedComponent) { //wix apps do not pass edited component
                        this._compSizeSync.startEditing(this._editedComponent);
                    }
                    this._createSetDataTimeout(htmlData);
                } catch(err) {
                    this._handleError(wixErrors.RICH_TEXT_UKNOWN_FAILURE, this.$className, 'startEditing', {"desc" : err.stack});
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
                    migratedText = this._migrationHandler.migrateComponent(this._editedComponent);
                }

                this._editedComponent.setHeight(size.y);
                this._startUndoTransaction(size, data, migratedText);
                this.startEditing(this._dataBeforeStartEditing, size.y, size.x, this._getCompStylesMapData());
            } catch(err) {
                this._handleError(wixErrors.RICH_TEXT_UKNOWN_FAILURE, this.$className, 'startEditingComponent', {"desc" : err.stack});
            }
        },

        _validateCkInitialization: function(){
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
                this._onEditorReady();
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

        _onEditorReady: function () {
            this._ckEditor.setReadOnly(true);
            this._ckIsReady = true;
            this._skinParts.toolBar.setEditorInstance(this._ckEditor, this.isEditorText);
            window.setPreloaderState('ready');
            if (this._editedComponent) {
                this._editedComponent.setLoading(false);
            }
            this.trigger("WRTE.CKReady");
            this._skinParts.componentToolBar.setEditorInstance(this._ckEditor);
        },
        _clearSetDataTimeout: function () {
            clearTimeout(this._setDataTimeoutHandle);
            delete this._setDataTimeoutHandle;
        },
        closeCkEditor: strategy.after(function() {
            this._clearSetDataTimeout();
            window.setPreloaderState('ready');
        })
    });
});
