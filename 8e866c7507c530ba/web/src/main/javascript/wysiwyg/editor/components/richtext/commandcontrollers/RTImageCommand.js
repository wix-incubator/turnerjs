define.Class('wysiwyg.editor.components.richtext.commandcontrollers.RTImageCommand', function(classDefinition) {
    /**@type bootstrap.managers.classmanager.ClassDefinition */
    var def = classDefinition;


    def.inherits('wysiwyg.editor.components.richtext.commandcontrollers.RTDualCommand');

    def.traits(['wysiwyg.viewer.components.traits.MediaTextHandler']);

    def.resources(['W.Preview', 'W.UndoRedoManager', 'W.Commands']);

    def.fields({
        /** the user can remove a link in the link dialog */
        _imageCommandInstance: null
    });

    def.methods({

        initialize: function(commandInfo, controllerComponent) {
            this.parent(commandInfo, controllerComponent);
        },

        setExtraParameters: function() {

        },

        getUserActionEventName: function() {
            return Constants.CoreEvents.CLICK;
        },

        executeCommand: function(event) {
            this._openImageDialog();
        },

        _ckEditorImageInsert: function(imageData) {
            var imageDataItem = this._createImageDataItem(imageData);
            this._createImagePropertiesItem(imageDataItem.id);
            var jsonForCk = this._createImageCompPlaceholderJson(imageDataItem.id);

            this._editorInstance.execCommand(this._commandName, {
                json: jsonForCk,
                src: imageData.url
            });
        },

        _openImageDialog: function () {
            var params = {
                galleryConfigID: 'photos',
                publicMediaFile: 'photos',
                mediaType: 'picture',
                selectionType:'single',
                i18nPrefix:'single_image',
                callback:this._ckEditorImageInsert.bind(this)
            };

            if(this._commandName==='wixComp') {
                params.selectionType= 'multiple';
                params.i18nPrefix= 'multiple_images';
                params.callback = function(rawData) {
                    if(rawData instanceof Array) {
                        for (var i = 0; i < rawData.length; i++) {
                            var imageData = rawData[i];
                            this._ckEditorImageInsert(imageData);
                        }
                    }
                    else {
                        this._ckEditorImageInsert(rawData);
                    }
                }.bind(this);
            }

            W.Commands.executeCommand('WEditorCommands.OpenMediaFrame', params);
        },

        /**
         *
         * @param imageData
         * @returns {*}
         * @private
         */
        _createImageDataItem: function(imageData){
            var imageRawData = {
                "type": "Image",
                "uri": imageData.uri,
                "title": imageData.title,
                "description": "",
                "width": imageData.width,
                "height": imageData.height
            };

            return this.resources.W.Preview.getPreviewManagers().Data.addDataItemWithUniqueId('txtMedia', imageRawData);
        },

        _createImageCompPlaceholderJson: function(newDataItemQuery){
            var COMPS_ID_PREFIX = "innercomp_";
            return {
                "id": COMPS_ID_PREFIX + newDataItemQuery,
                "dataQuery": newDataItemQuery,
                "propertyQuery": newDataItemQuery,
                "componentType": "wysiwyg.viewer.components.WPhoto",
                "styleId": "",
                "skin": "wysiwyg.viewer.skins.photo.NoSkinPhoto"
            };
        }
    });
});
