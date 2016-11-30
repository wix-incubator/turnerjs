define.experiment.Class('wysiwyg.editor.managers.WPreviewManager.ScrollBlock', function(classDefinition, experimentStrategy){
    var def = classDefinition;
    var strategy = experimentStrategy;

    def.methods({
        initialize: function() {
            this._siteId = null;
            this._preview = $('live-preview-iframe');
            this._previewContainer = this._getPreviewContainer();
            this._previewCurrentSizePosition = null;

            this.setPreviewFrameSizePosition(Constants.EditorUI.PREVIEW_SIZE_POSITION.DEFAULT);

            /** @type wysiwyg.editor.managers.preview.MultipleViewersHandler */
            this._multipleViewersHandler = new this.imports.MultipleViewersHandler(this);
            /** @type wysiwyg.editor.managers.preview.FullStructureSerializer */
            this._fullStructureSerializer = new this.imports.FullStructureSerializer(this._multipleViewersHandler);
            /** @type wysiwyg.editor.managers.preview.SiteDataSerializer */
            this._siteDataSerializer = new this.imports.SiteDataSerializer();

            W.Commands.registerCommandAndListener('WEditorCommands.WSetEditMode', this, this._handlePreviewAttribute);
            W.Commands.registerCommandAndListener('WEditorCommands.SetViewerMode', this, this._handleDeviceAttribute);
            W.Commands.registerCommandAndListener('WPreviewCommands.WEditModeChanged', this, this._handlePreviewFrameResizeOnEditMode);
            W.Commands.registerCommandAndListener('WPreviewCommands.ViewerStateChanged', this, this._handlePreviewFrameResizeOnViewerState);

            resource.getResources(['W.Config', 'W.Editor', 'W.Commands', 'W.ScrollHandler'], function (resources) {
                this._resources = resources;
                this._init();
            }.bind(this));
            this._isWindowReady = false;
            this._isPreviewReadyDeferred = Q.defer();
        },

        _onWindowScroll: function(event) {

            if (this._resources.W.ScrollHandler.isScrollBlocked()) {
                return false;
            }

            var windowScrollY = window.getScroll().y;
            var previewDocument = this._preview.contentWindow || this._preview.contentDocument.window;

            previewDocument.scrollTo(0, windowScrollY);

            //TODO: 14 Oct 2013: is this still necessary?
            //Icky safari-hack, cannot render position:fixed in side positioned iframes. meh.
//            this._bgNode = this._bgNode || this._previewFrame.contentWindow.document.getElementById('bgNode');
//            if (this._bgNode.style.position === 'fixed') {
//                this.resources.W.Utils.forceBrowserRepaintOnScroll(this._bgNode);
//
//            }
        }
    });
});
