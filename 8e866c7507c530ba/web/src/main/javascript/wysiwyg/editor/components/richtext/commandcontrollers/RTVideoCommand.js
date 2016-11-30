define.Class('wysiwyg.editor.components.richtext.commandcontrollers.RTVideoCommand', function(classDefinition) {
    /**@type bootstrap.managers.classmanager.ClassDefinition */
    var def = classDefinition;


    def.inherits('wysiwyg.editor.components.richtext.commandcontrollers.RTDualCommand');

    def.resources(['W.Preview', 'W.UndoRedoManager', 'W.Commands']);

    def.traits(["wysiwyg.viewer.components.traits.VideoUtils"]);

    def.statics({
        'DefaultVideoId': '83nu4yXFcYU',
        'DefaultVideoType': 'YOUTUBE'
    });

    def.methods({
        getUserActionEventName: function() {
            return Constants.CoreEvents.CLICK;
        },

        executeCommand: function(event) {
            var videoDataItem = this._createVideoDataItem(this.DefaultVideoId, this.DefaultVideoType);
            var jsonForCk = this._createVideoCompPlaceholderJson(videoDataItem);

            this._getServices()["YOUTUBE"].getPreviewUrl(this.DefaultVideoId, function(videoUrl) {
                this._editorInstance.execCommand(this._commandName, {
                    json: jsonForCk,
                    src: videoUrl
                });
            }.bind(this));
        },

        _createVideoDataItem: function(videoId, videoType){
            return {
                "type": "Video",
                'videoId': videoId,
                'videoType': videoType
            };
        },

        _createVideoCompPlaceholderJson: function(videoDataItem){
            var COMPS_ID_PREFIX = "innercomp_";
            var newDataItemQuery = this.resources.W.Preview.getPreviewManagers().Data.addDataItemWithUniqueId('txtMedia', videoDataItem);
            return {
                "id": COMPS_ID_PREFIX + newDataItemQuery.id,
                "dataQuery": newDataItemQuery.id,
                "propertyQuery": newDataItemQuery.id,
                "componentType": "wysiwyg.viewer.components.Video",
                "styleId": "",
                "skin": "wysiwyg.viewer.skins.VideoSkin",
                "src": "",
                "minWidth" : "240px",
                "minHeight": "180px",
                "videoId":videoDataItem.videoId,
                "videoType":videoDataItem.videoType,
                "width":1
            };
        }
    });
});
