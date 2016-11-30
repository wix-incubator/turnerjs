define.experiment.Class('wysiwyg.editor.managers.BlogManagerFrameManager.BlogManager', function (classDefinition, experimentStrategy) {

    /**@type bootstrap.managers.classmanager.ClassDefinition*/
    var def = classDefinition;
    /**@type bootstrap.managers.experiments.ExperimentStrategy*/
    var strategy = experimentStrategy;

    def.inherits("core.editor.managers.DialogManager");

    def.resources(['W.Resources', 'scriptLoader', 'W.Config', 'W.EditorDialogs', 'W.Theme', 'W.Data', 'W.Utils']);

    def.binds(['_onLoadReady', '_createFrame', '_closeFrame', '_initEditorProtocol']);

    def.statics({
        framePath: "assets/media_gallery/index.html",
        protocolPath: "assets/media_gallery/protocol.js",
        _topology: {
            baseUrl: "mediaGalleryBaseUrl",
            baseHost: "baseDomain",
            mediaGallery: "mediaGalleryStaticBaseUrlB"
        }
    });

    def.methods({
        initialize: function (params) {
            this._params = params;
            this._onLoadReady();
        },

        _onLoadReady: function () {
            LOG.reportEvent(wixEvents.BLOG_MANAGER_OPEN);
            this.$frame = this._createFrame();
            document.body.appendChild(this.$frame);
            this._initEditorProtocol(this.$frame);
        },

        _createFrame: function() {
            var frameOptions = {
                width: "100%",
                height: "100%",
                display: "block",
                overflow: "hidden",
                position: "fixed",
                top: 0,
                left: 0
            };

            var frame = document.createElement("iframe");
            frame.setAttribute("id", "blogManagerFrame");
            frame.setAttribute("src", this._params.url);
            frame.setStyles(frameOptions);

            return frame;
        },

        _initFrame: function (event) {
            var message = {
                type  : 'settings',
                payload : this._params.payload
            };
            window.top.document.body.addClass('fullScreenMode');
            event.source.postMessage(JSON.stringify(message), '*');
            this.$frame.addEvent(Constants.CoreEvents.MOUSE_WHEEL, this.resources.W.Utils.stopMouseWheelPropagation);
            this.$frame.setAttribute("isReady", "true");
        },

        _closeFrame: function () {
            window.top.document.body.removeClass('fullScreenMode');
            this.$frame.removeEvent(Constants.CoreEvents.MOUSE_WHEEL, this.resources.W.Utils.stopMouseWheelPropagation);
            this.$frame.dispose();

            if (this._params.onClosedCallback) {
                this._params.onClosedCallback();
            }
        },
        _initEditorProtocol: function (frame) {
            // This implementation is a workaround of some Firefox security issue. The issue was, that when trying to
            // send post message from editor to blog manager frame's content window, we were receiving Access denied
            // error. We suggested, that the reason was in protocol.js file, which was hosted on different server,
            // we moved the logic to this file
            window.addEventListener('message', function onBlogManagerMessage(event) {
                if (event.source === frame.contentWindow) {
                    var data = JSON.parse(event.data);
                    if (data.type === 'ready') {
                        this._initFrame(event);
                    } else if (data.type === 'cancel') {
                        this._closeFrame();
                    }
                }
            }.bind(this));
        }
    });
});