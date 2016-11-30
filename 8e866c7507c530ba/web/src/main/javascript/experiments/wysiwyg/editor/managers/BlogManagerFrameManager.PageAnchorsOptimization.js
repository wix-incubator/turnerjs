define.experiment.Class('wysiwyg.editor.managers.BlogManagerFrameManager.PageAnchorsOptimization', function (classDefinition, experimentStrategy) {

    /**@type bootstrap.managers.classmanager.ClassDefinition*/
    var def = classDefinition;
    /**@type bootstrap.managers.experiments.ExperimentStrategy*/
    var strategy = experimentStrategy;

    def.inherits("core.editor.managers.DialogManager");

    def.resources(['W.Resources', 'scriptLoader', 'W.Config', 'W.EditorDialogs', 'W.Theme', 'W.Data', 'W.Utils']);

    def.binds(['_loadProtocol', '_onLoadReady', '_createFrame', '_closeFrame', '_initEditorProtocol']);

    def.statics({
        framePath: "assets/media_gallery/index.html",
        protocolPath: "assets/media_gallery/protocol.js",
        _topology: {
            baseUrl: "mediaGalleryBaseUrl",
            baseHost: "baseDomain",
            mediaGallery: "mediaGalleryStaticBaseUrlB"
        },
        ANCHOR_NAMESPACE: "wysiwyg.common.components.anchor.viewer.Anchor"
    });

    def.methods({
        _sendAnchors: function(event, anchorsData, pageId) {
            var message = {
                payload : anchorsData,
                type : 'anchors'
            };
            event.source.postMessage(JSON.stringify(message), '*');

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
                    } else if (data.type === 'anchors') {
                        // Here we provide interface for loading anchors on demand for blog-manager.
                        this._getAnchorsByPageId(data.payload.pageId).then(function(anchorsData) {
                            this._sendAnchors(event, anchorsData);
                        }.bind(this));
                    }
                }
            }.bind(this));
        },

        _getAnchorsByPageId : function(pageId) {
            var anchorDeferred = Q.defer(),
                viewer = W.Preview.getPreviewManagers().Viewer,
                pageNode;
            pageId = pageId.indexOf('#') === 0 ? pageId.substr(1) : pageId;
            pageNode = viewer.getCompByID(pageId);
            viewer.loadPageById(pageId, pageNode, function(pageData) {
                var pageDom = pageData.pageNode,
                    anchorDomList = pageDom ? pageDom.querySelectorAll('[comp="'+this.ANCHOR_NAMESPACE+'"]') : [];
                anchorDeferred.resolve({
                    anchorsData : this._loadAnchorsListFromDom(pageId, anchorDomList),
                    pageId : pageId
                });
            }.bind(this));
            return anchorDeferred.promise;
        },

        _loadAnchorsListFromDom: function(pageId, anchorDomList) {
            var anchorCount = anchorDomList.length,
                currentDataItem, currentName, currentId, i, result = [];

            for (i = 0; i < anchorCount; i++) {
                currentDataItem = anchorDomList[i].getLogic().getDataItem();
                currentName = currentDataItem.get('name');
                currentId = "#" + currentDataItem.getData().id;
                result.push({
                    anchorId : currentId,
                    anchorName : currentName,
                    pageId : '#' + pageId
                });
            }
            return result;

        }
    });
});