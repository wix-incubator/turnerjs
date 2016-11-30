define.component('wysiwyg.viewer.components.BgImageStrip', function (componentDefinition) {
    var def = componentDefinition;
    def.inherits('core.components.base.BaseComp');
    def.resources(['W.Config', 'W.Viewer', 'topology']);
    def.dataTypes(['Image']);
    def.binds(['_mediaGalleryCallback', '_onWindowResize']);
    def.skinParts({bg: { type: 'htmlElement'}});
    def.propertiesSchemaType('BgImageStripProperties');

    def.statics({
        EDITOR_META_DATA: {
            general: {
                settings: true,
                design: true
            },
            custom: [
                {
                    label: 'BG_STRIP_CHANGE',
                    command: 'WEditorCommands.OpenMediaFrame',
                    commandParameter: {
                        galleryConfigID: 'backgrounds',
                        publicMediaFile: 'backgrounds',
                        i18nPrefix: 'background',
                        selectionType: 'single',
                        mediaType: 'picture',
                        callback: '_mediaGalleryCallback',
                        startingTab: 'free'
                    },
                    commandParameterDataRef: 'SELF'
                }
            ],
            dblClick: {
                command: 'WEditorCommands.OpenMediaFrame',
                commandParameter: {
                    galleryConfigID: 'backgrounds',
                    publicMediaFile: 'backgrounds',
                    i18nPrefix: 'background',
                    selectionType: 'single',
                    mediaType: 'picture',
                    callback: '_mediaGalleryCallback',
                    startingTab: 'free'
                },
                commandParameterDataRef: 'SELF'
            },
            mobile: {
                allInputsHidden: true
            }
        }
    });

    def.methods({

        initialize: function (compId, viewNode, args) {
            var openMediaFrameCommandIndex;
            this.parent(compId, viewNode, args);
            this._baseUrl = this.resources.W.Config.getServiceTopologyProperty('staticMediaUrl') + "/";
            this._isPrimeRender = true;
            this._docWidth = W.Viewer.getDocWidth();
            this._resizableSides = [ Constants.BaseComponent.ResizeSides.TOP, Constants.BaseComponent.ResizeSides.BOTTOM];

            openMediaFrameCommandIndex = _.findIndex(this.EDITOR_META_DATA.custom, function (item) {
                return item.command === 'WEditorCommands.OpenMediaFrame';
            });

            this.EDITOR_META_DATA.custom[openMediaFrameCommandIndex].commandParameter.startingTab = 'free';
            this.EDITOR_META_DATA.dblClick.commandParameter.startingTab = 'free';

            window.addEvent(Constants.CoreEvents.RESIZE, this._onWindowResize);
        },

        _mediaGalleryCallback: function (rawData) {
            this.getDataItem().setFields({
                uri: rawData.fileName,
                width: rawData.width,
                height: rawData.height
            });
        },

        _onWindowResize: function() {
            this._fixWidth();
        },

        _onRender: function (e) {
            if (this._isPrimeRender) {
                this._fixWidth();
                this._setBgDefaults();
                this._setBgImage();
                this._isPrimeRender = false;
                return;
            }

            if (!this.isRendered()) {
                return;
            }

            if (e.data.invalidations.isInvalidated([ this.INVALIDATIONS.WIDTH_REQUEST ])) {
                this._fixWidth();
            }

            if (e.data.invalidations.isInvalidated([ this.INVALIDATIONS.SKIN_CHANGE ])) {
                this._setBgDefaults();
                this._setBgImage();
            }

            if (e.data.invalidations.isInvalidated([ this.INVALIDATIONS.DATA_CHANGE ])) {
                this._setBg(e.data.invalidations._invalidations.dataChange);
            }
        },

        _fixWidth: function () {
            var w, l;
            if (this.resources.W.Config.env.isViewingSecondaryDevice()) {
                w = this._docWidth;
                l = 0;
            } else {
                w = document.body.clientWidth;
                l = this._getDiff();
            }

            if (w !== this.getWidth()) {
                this.setWidth(w);
            }

            this.$view.style.width = w + 'px';
            this.$view.style.left = l + 'px';
        },

        _setBgDefaults: function () {
            this._skinParts.bg.style.backgroundPosition = this.getComponentProperty('bgPosition');
            this._skinParts.bg.style.backgroundRepeat = this.getComponentProperty('bgRepeat');
            this._skinParts.bg.style.backgroundSize = this.getComponentProperty('bgSize');
        },

        _setBgImage: function () {
            if( this._isFakeOrEmptyUri()) {
                this._skinParts.bg.style.backgroundImage = '';
                this._data.set('uri', this.resources.topology.skins + '/images/wysiwyg/core/themes/editor_web/add_image_thumb.png');
                this.EDITOR_META_DATA.mobile.allInputsHidden = true;
                return;
            }
            else {
                this.EDITOR_META_DATA.mobile.allInputsHidden = false;
            }
            this._skinParts.bg.style.backgroundImage = 'url(' + this._baseUrl + this._data.get('uri') + ')';
        },

        _setBg: function (changes) {
            _.each(changes, function (change) {
                (change.dataItem._dataType === 'Image') ? this._setBgImage() : this._setBgDefaults();

            }, this);
        },

        _getDiff: function () {
            var offset = ( this._docWidth - document.body.clientWidth ) / 2;
            return ( offset >= 0 ) ? 0 : offset;
        },

        _isFakeOrEmptyUri: function () {
            var uri = this._data.get('uri');
            return !uri || uri === '' || /add_image_thumb\.png$/i.test(uri);
        },

        isContainer: function () {
            return false;
        },
        isContainable: function (logic) {
            return logic.isSiteSegment();
        },
        getSelectableX: function () {
            return this.resources.W.Config.env.isViewingSecondaryDevice() ? 0 : this._getDiff();
        },
        getX: function () {
            return 0;
        },
        setX: function () {
        }
    });
});
