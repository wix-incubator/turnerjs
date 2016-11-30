define.Class('wysiwyg.editor.managers.MediaFrameManager', function (classDefinition) {
    /**@type bootstrap.managers.classmanager.ClassDefinition*/
    var def = classDefinition;

    def.resources(["W.Config", "W.Utils", "W.Commands", "topology", "scriptLoader", "W.Experiments"]);

    def.binds(["_onLoadReady", "_onItems", "_initEditorProtocol", "_setProtocolHandlers", "_onOpen", "_onLoadDelay", "_onCancel"]);

    def.statics({
        framePath: "assets/media_gallery/index.html",
        protocolPath: "assets/media_gallery/protocol.js",
        _topology: {
            baseUrl: "mediaGalleryBaseUrl",
            baseHost: "baseDomain",
            mediaGallery: "mediaGalleryStaticBaseUrl"
        }
    });

    def.methods({
        initialize: function (params) {
            this._loadedAt = new Date().getTime();
            this._checkedIfLoaded = setTimeout(this._onLoadDelay, 15000);

            LOG.reportEvent(wixEvents.MEDIA_GALLERY_OPEN, {
                c1: params && params.i18nPrefix,
                c2: params && params.publicMediaFile,
                i1: params && params.selectionType
            });

            this._params = params;

            this._baseUrl = this.resources.W.Config.getServiceTopologyProperty(this._topology.baseUrl);
            this._framePath = this._baseUrl + this.framePath + this._getFrameUrlParams();
            this._protocolPath = this._baseUrl + this.protocolPath;
            this._reportOnClose = true;

            this.options = {
                editorSessionId: window.editorModel.editorSessionId,
                baseHost: this.resources.W.Config.getServiceTopologyProperty(this._topology.baseHost),
                i18nCode: this.resources.W.Config.getLanguage()
            };

            if (params && params.mediaType) {
                this.options.mediaType = params.mediaType;
            }

            if (params && params.i18nPrefix) {
                this.options.i18nPrefix = params.i18nPrefix;
            }

            if (params && params.publicMediaFile) {
                this.options.publicMediaFile = params.publicMediaFile;
            }

            if (params && params.selectionType) {
                this.options.selectionType = params.selectionType;
            }

            if (params && params.hasOwnProperty('hasPrivateMedia') && typeof params['hasPrivateMedia'] === "boolean") {
                this.options.hasPrivateMedia = params.hasPrivateMedia;
            }

            if (params && params.hasOwnProperty('startingTab')) {
                this.options.startingTab = params.startingTab;
            }

            this.options._deployedExperiments = this.resources.W.Experiments._runningExperimentIds;

            resource.getResources(["W.Editor", "W.UndoRedoManager"], function (resources) {
                this._resources = resources;
                this._initMediaGallery();
            }.bind(this));
        },

        _initMediaGallery: function () {
            if (!this._baseUrl) {
                return;
            }
            this.resources.scriptLoader.loadResource(
                {
                    url: this._protocolPath
                },
                {
                    onLoad: this._onLoadReady,
                    onFailed: function () {
                        LOG.reportError(wixErrors.MEDIA_GALLERY_FAIL_LOAD_PROTOCOL, this.className, '_onLoadDelay', this._baseUrl);
                    }
                }
            );
        },

        _onLoadReady: function () {
            this.$frame = this._createFrame();
            document.body.appendChild(this.$frame);
            this._initEditorProtocol(this.$frame);
        },

        _initEditorProtocol: function (frame) {
            this._editorProtocol = Protocol.forEditor(frame.contentWindow, window);
            this._editorProtocol.onReady(this._setProtocolHandlers);
        },

        _createFrame: function () {
            var $frame = $$("iframe#mediaGalleryFrame");

            if ($frame && !!$frame.length) {
                _.first($frame).dispose();
            }

            var frameOptions = {
                width: "100%",
                height: "100%",
                display: "none",
                overflow: "hidden",
                position: "fixed",
                top: 0,
                left: 0
            };

            var frame = document.createElement("iframe");
            frame.setAttribute("id", "mediaGalleryFrame");
            frame.setAttribute("src", this._framePath);
            frame.setStyles(frameOptions);

            return frame;
        },

        _getFrameUrlParams: function () {
            var urlParams = urlParams = {
                mediaGalleryStaticBaseUrl: this.resources.W.Config.getServiceTopologyProperty(this._topology.mediaGallery)
            };

            var queryParams = [];

            _.each(urlParams, function (val, key) {
                queryParams.push(key + "=" + val);
            });

            return "?" + queryParams.join("&");
        },

        _setProtocolHandlers: function () {
            this._editorProtocol.initialize(this.options);
            this._editorProtocol.onItems(this._onItems);
            this._editorProtocol.onCancel(this._onCancel);
            this._uncollapse();
            this._onOpen();
        },

        _onItems: function (payload) {
            if (!payload.items) {
                this._collapse();
                LOG.reportError(wixErrors.MEDIA_GALLERY_INVALID_PAYLOAD, this.className, '_onItems', '');
                return;
            }

            LOG.reportEvent(wixEvents.MEDIA_GALLERY_CLOSE, {
                c1: payload && payload.items && payload.items.length
            });

            if (payload && payload.items && payload.items.length) {
                this._reportOnClose = false;
            }

            if (payload.items.length === 1 && this._params.selectionType != "multiple") {
                payload.items = _.first(payload.items);
            }

            if (this._params.selectedComp) {
                this._startUndoTransaction(this._params.selectedComp.getDataItem());
                this._params.selectedComp[this._params.callback].call(this, payload.items);
                this._endUndoTransaction();
            }

            else if (this._params.callback) {
                this._params.callback(payload.items);
            }

            else {
                var items = '';
                try {
                    items = JSON.stringify(payload.items);
                    items = items.substring(0, 511);
                }
                catch (ex) { items = ''; }
                LOG.reportError(wixErrors.MEDIA_GALLERY_FAILED_ONITEMS_CALLBACK, this.className, '_onItems', items);
            }

            this._collapse();
        },

        _uncollapse: function () {
            this.$frame.addEvent(Constants.CoreEvents.MOUSE_WHEEL, this.resources.W.Utils.stopMouseWheelPropagation);
            this.$frame.setStyle("display", "block");
        },

        _collapse: function () {
            this.$frame.removeEvent(Constants.CoreEvents.MOUSE_WHEEL, this.resources.W.Utils.stopMouseWheelPropagation);
            this.$frame.dispose();
            this.resources.W.Commands.executeCommand('WEditorCommands.CloseMediaFrame');

            if (this._reportOnClose) {
                LOG.reportEvent(wixEvents.MEDIA_GALLERY_CLOSE, {
                    c1: 0
                });
            }
        },

        _startUndoTransaction: function (dataItem) {
            this._dataBeforeAddition = {};
            if (dataItem && dataItem._data) {
                _(this._dataBeforeAddition).merge(dataItem._data).value();
            }
        },

        _endUndoTransaction: function () {
            this._createTransaction(this._resources.W.Editor.getEditedComponent(), this._dataBeforeAddition);
        },

        _createTransaction: function (comp, dataBeforeAddition) {
            this._resources.W.UndoRedoManager.startTransaction();
            var dataAfterAddition = {};
            if (comp._data && comp._data._data) {
                _(dataAfterAddition).merge(comp._data._data).value();
                comp._data.fireDataChangeEvent(undefined, dataAfterAddition, dataBeforeAddition, this);
            }
            this._resources.W.UndoRedoManager.endTransaction();
        },

        _onOpen: function () {
            clearTimeout(this._checkedIfLoaded);
            LOG.reportEvent(wixEvents.MEDIA_GALLERY_SUCCESSFULLY_OPENED, {
                g1: new Date().getTime() - this._loadedAt
            });
        },

        _onCancel: function() {
            if (typeof this._params.callbackForCancel === 'function') {
                this._params.callbackForCancel();
            }

            this._collapse();
        },

        _onLoadDelay: function () {
            LOG.reportError(wixErrors.MEDIA_GALLERY_FAILED_TO_OPEN_WITHIN_FIFTEEN_SEC, this.className, "_onLoadDelay", this._loadedAt);
            clearTimeout(this._checkedIfLoaded);
        }
    });
});