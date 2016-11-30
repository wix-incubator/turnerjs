define.Class('wysiwyg.editor.components.richtext.commandcontrollers.RTVideoUrlCommand', function(classDefinition) {
    /**@type bootstrap.managers.classmanager.ClassDefinition */
    var def = classDefinition;


    def.inherits('wysiwyg.editor.components.richtext.commandcontrollers.RTDualCommand');

    def.traits(["wysiwyg.viewer.components.traits.VideoUtils"]);

    def.binds(['_getVideoPreviewCallback']);

    def.methods({
        getUserActionEventName: function() {
            return Constants.CoreEvents.INPUT_CHANGE;
        },
        _getVideoPreviewCallback: function(videoType, videoId) {
            var _videoType = videoType;
            var _videoId = videoId;
            return function(previewUrl, isUrlValid) {
                if(!isUrlValid) {
                    this._controllerComponent.$view.addClass('invalid');
                } else {
                    this._controllerComponent.$view.removeClass('invalid');
                }
                this._editorInstance.execCommand(this._commandName, {src: previewUrl, "videoType": _videoType, "videoId": _videoId});
            }.bind(this);
        },
        executeCommand: function(event) {
            if(!event.origEvent || event.origEvent.type==='change') {
                return;
            }
            var videoData = this._getVideoDataFromVideoUrl(event.value);

            if(this._getServices()[videoData.videoType]) {
                this._getServices()[videoData.videoType].getPreviewUrl(videoData.videoId, this._getVideoPreviewCallback(videoData.videoType, videoData.videoId));
            } else {
                this._getVideoPreviewCallback()(this._getDefaultPreviewImage());
            }

            if (this._videoDataItem) {
                this._videoDataItem.set('videoType', videoData.videoType);
                this._videoDataItem.set('videoId', videoData.videoId);
            } else {
                //todo - handle missing video data item...
                console.log("missing video data item");
            }
        },
        setDataItem: function(videoDataItem) {
            if(videoDataItem) {
                this._videoDataItem = videoDataItem;
                var videoUrl = this._getVideoUrlFromVideoData(videoDataItem.getData());
                this._controllerComponent.setTextContent(videoUrl);
            }
        }
    });
});
