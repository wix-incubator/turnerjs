define.component('wysiwyg.viewer.components.FlashComponent', function (componentDefinition) {
    /** @type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits("mobile.core.components.base.BaseComponent");

    def.resources(['W.Utils', 'W.Config', 'W.Commands', 'W.Data']);

    def.utilize(['wysiwyg.common.utils.LinkRenderer']) ;

    def.binds(['_enforceDisplayMode', '_mediaGalleryCallback']);

    def.skinParts({
        flashContainer: {type: 'htmlElement'},
        'link': {  type: 'htmlElement', optional: false },
        'mouseEventCatcher': { type: 'htmlElement'},
        'noFlashImgContainer': { type: 'htmlElement'},
        'noFlashImg': { type: 'core.components.Image', dataRefField: "placeHolderImage", argObject: { cropMode: "full" }}
    });

    def.dataTypes(['LinkableFlashComponent']);

    def.states({'linkableComponent': ["link", "noLink" ]});

    def.propertiesSchemaType("FlashComponentProperties");

    def.statics({
        EDITOR_META_DATA: {
            general: {
                settings: true,
                design: false,
                animation: false
            },
            custom: [
                {
                    label: 'GENERAL_CHANGE',
                    command:'WEditorCommands.OpenMediaFrame',
                    commandParameter:{
                        galleryConfigID: 'flash',
                        i18nPrefix: 'flash',
                        selectionType: 'single',
                        mediaType: 'swf',
                        callback: '_mediaGalleryCallback'
                    }
                },
                {
                    label: 'LINK_LINK_TO',
                    command: 'WEditorCommands.OpenLinkDialogCommand',
                    commandParameter: {
                        position: 'center'
                    },
                    commandParameterDataRef: 'SELF'
                }
            ],
            dblClick: {
                command:'WEditorCommands.OpenMediaFrame',
                commandParameter:{
                    galleryConfigID: 'flash',
                    i18nPrefix: 'flash',
                    selectionType: 'single',
                    mediaType: 'swf',
                    callback: '_mediaGalleryCallback'
                }
            }
        }
    });

    def.methods({

        initialize: function (compId, viewNode, args) {
            this.parent(compId, viewNode, args);
            this._noFlashMode = true;

            this._params = {};
            this._attributes = {};

            this._params.quality = "high";
            this._params.bgcolor = "#FAFAFA";
            this._params.allowscriptaccess = this._getFlashScriptAccess();
            this._params.allowfullscreen = "true";
            this._params.wMode = "transparent";
            this._params.scale = "exactFit";

            //passes the server root to use to the flash
            this._params.flashVars = '';
            this._attributes.align = "middle";
            this.resources.W.Commands.registerCommandListenerByName("WPreviewCommands.WEditModeChanged", this, this._onEditorModeChanged);

            this._linkRenderer = new this.imports.LinkRenderer();
        },

        _getFlashScriptAccess:function(){
            return "never";
        },

        render: function () {
            // URI Changes
            this._createFlashEmbed();
            this.parent();
        },

        _createFlashEmbed: function (force) {
            var uri = this._data.get("uri");

            if (!uri && !this._uri) {
                // If not URI is defined, use the current size as the "original" size
                this._mediaWidth = this._mediaWidth || this.getWidth();
                this._mediaHeight = this._mediaHeight || this.getHeight();
            }

            if (( force && this._uri) || (uri && uri != this._uri)) {
                this._uri = uri;

                // Height / Width changes
                this._mediaWidth = this._data.get("width");
                this._mediaHeight = this._data.get("height");

                var swfURL = this.resources.W.Config.getMediaStaticUrl(this._uri) + this._uri;
                this._skinParts.flashContainer.empty();
                this._embedDivID = this.resources.W.Utils.getUniqueId();
                this._embedDIV = new Element("DIV", {id: this._embedDivID});
                this._skinParts.flashContainer.adopt(this._embedDIV);

                this._params.play = this.resources.W.Config.env.isInInteractiveViewer() ? "true" : "false";
                this._params.autoplay = this.resources.W.Config.env.isInInteractiveViewer() ? "true" : "false";
                this._flashObj = swfobject.embedSWF(
                    swfURL,
                    this._embedDivID,
                    "100%",
                    "100%",
                    "10.0.0",
                    "playerProductInstall.swf",
                    null,
                    this._params,
                    this._attributes, function (obj) {
                        if (obj.success) {

                            this._noFlashMode = false;
                            this._skinParts.noFlashImgContainer.collapse();
                            this._embedCreated = true;
                        }

                        this._enforceDisplayMode();
                    }.bind(this));
            }

            // Display Mode changes.
            var displayMode = this.getComponentProperty('displayMode');
            if (displayMode != this._displayMode) {
                this._displayMode = displayMode;
                this._enforceDisplayMode();
            }
        },

        _onEditorModeChanged: function () {
            this._createFlashEmbed(true);
        },

        _onResize: function () {
            if (this.isReady() && this._embedCreated) {
                this._enforceDisplayMode();
            }

        },

        _enforceDisplayMode: function () {
            var displayMode = this._displayMode || this.getComponentProperty('displayMode');

            if (displayMode == "fit") {
                if (this._width != this.getWidth()) {
                    this._width = this.getWidth();
                    this._height = this._width * ( this._mediaHeight / this._mediaWidth );
                }
                else {
                    this._height = this.getHeight();
                    this._width = this._height * ( this._mediaWidth / this._mediaHeight );
                }
            }
            else if (displayMode === "stretch") {
                this._width = this.getWidth();
                this._height = this.getHeight();
            }
            else { // "original"
                this._width = this._mediaWidth;
                this._height = this._mediaHeight;
            }

            this.setWidth(this._width, true, false); // don't trigger resize again (anti-recursia)
            this.setHeight(this._height, true, false); // don't trigger resize again (anti-recursia)

            this.getViewNode().setStyles({
                width: this._width + "px",
                height: this._height + "px"
            });

            if (this._noFlashMode) {
                this._skinParts.noFlashImg.setSize(this._width, this._height, "px");
            }

            this._wCheckForSizeChangeAndFireAutoSized(1);

        },

        _onDataChange: function (ev) {
            this.parent();
            this.fireEvent('propertyChanged', ev.getData().displayMode);

            if(this._isRendered) {
                this._renderLink() ;
            }
        },

        _mediaGalleryCallback: function(rawData) {
            this.getDataItem().setFields({
                width: rawData.width,
                height: rawData.height,
                uri: rawData.fileName
            });
        },

        _onAllSkinPartsReady: function() {
            this._renderLink();
        },

        _renderLink: function() {
            var dataItemWithSchema = this.getDataItem();
            var linkId = dataItemWithSchema._data.link;
            if(!linkId) {
                this._linkRenderer.removeRenderedLinkFrom(this._skinParts.link, this);
                return;
            }
            var linkDataItem = this.resources.W.Data.getDataByQuery(linkId) ;
            if(linkDataItem) {
                this._linkRenderer.renderLink(this._skinParts.link, linkDataItem, this);
            }
        }
    });
});
