define.component('wysiwyg.viewer.components.MediaZoomDisplayer', function (componentDefinition) {
    /** @type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('mobile.core.components.base.BaseComponent');

    def.binds(['_setCorrectImageSize', '_closeMediaZoom']);

    def.dataTypes(['Image']);

    def.resources(['W.Data']);

    def.utilize(['wysiwyg.common.utils.LinkRenderer']);

    def.skinParts({
        'title': { type: 'htmlElement', optional: false },
        'description': { type: 'htmlElement', optional: false },
        'link': { type: 'htmlElement', optional: true  },
        'imageWrapper': { type: 'htmlElement', 'command': 'WViewerCommands.MediaZoom.Next'},
        'image': { type: 'core.components.Image', dataRefField: "*", optional: false, 'hookMethod': '_addImageArgs' }
    });

    def.states({'link': ['showLink', 'hideLink']});

    def.fields({
        _minWidth: 600,
        _maxWidth: -1,
        _maxHeight: -1,
        _imgActualSize: {'x': 0, 'y': 0}
    });

    def.methods({
        initialize: function (compId, viewNode, argsObject) {
            this.parent(compId, viewNode, argsObject);
            this._maxWidth = argsObject.maxWidth;
            this._maxHeight = argsObject.maxHeight;

            this._linkRenderer = new this.imports.LinkRenderer();
        },

        _tweetHookMethod: function (definition) {
            definition.dataItem = this.injects().Data.createDataItem({'defaultText': '', 'accountToFollow': '', 'type': 'TwitterTweet'}, 'TwitterTweet');
            return definition;
        },

        _addImageArgs: function (definition) {
            this._imageDimensionsClass = this.injects().Classes.get('core.components.image.ImageDimensions');
            this._imageDimensions = new this._imageDimensionsClass();
            this._imageDimensions.setCropMode(this._imageDimensionsClass.settingOptions.crop.FULL);
            this._imageDimensions.setFullScreenMode();//TODO this is the only addition

            var imagePadding = this.getSkin().getParams().first(function (param) {
                return param.id === 'imgPadding';
            });
            this._maxWidth = this._maxWidth - (imagePadding.defaultValue * 2);

            var dims = this._imageDimensions.getDimensionsForContainerSize(
                {
                    'x': this.getDataItem().get('width'),
                    'y': this.getDataItem().get('height')
                },
                {
                    'x': this._getImageWidth(),
                    'y': this._getImageHeight()
                }
            );
            this._imgActualSize = dims.imageVisibleSize;
            definition.argObject = {'unit': 'px', 'cropMode': 'full', 'width': this._imgActualSize.x, 'height': this._imgActualSize.y};

            return definition;
        },

        _onAllSkinPartsReady: function () {
            this.parent();
            if (this._skinParts.comments) {
                this._minWidth = 600;
            }
            this._setCorrectImageSize(this._imgActualSize);
            this._updateParts();
        },

        _updateParts: function () {
            if (this._skinParts) {
                this._skinParts.title.set("text", this._data.get("title"));
                this._skinParts.description.set("text", this._data.get("description"));
                var linkId = this.getDataItem().get('link');
                if (linkId) {
                    var linkDataItem = this.resources.W.Data.getDataByQuery(linkId);
                    var node = this._skinParts.link;
                    this._linkRenderer.renderLink(node, linkDataItem, this);
                    this.setState('showLink', 'link');
                } else {
                    this.setState('hideLink', 'link');
                }
            }
            this._addCloseEventForLinkIfNeeded();
        },

        _addCloseEventForLinkIfNeeded: function(){
            var linkId = this.getDataItem().get('link'),
                linkDataItem = linkId && W.Data.getDataByQuery(linkId),
                linkType = linkDataItem && linkDataItem.getType();

            if(linkType === 'AnchorLink' && this._skinParts && this._skinParts.link){
                this._skinParts.link.addEvent("click", this._closeMediaZoom);
            }
        },

        _closeMediaZoom: function(){
            this.resources.W.Commands.executeCommand('WViewerCommands.MediaZoom.Close', this);
        },


        //Experiment ZoomWidth.BugFix was promoted to feature on Wed Oct 10 17:40:13 IST 2012


        _setCorrectImageSize: function (imageSize) {
            var imgWrapperHeight = imageSize.y;
            var imgWrapperWidth = this._getDisplayerWidth(imageSize.x);
            this._skinParts.imageWrapper.setStyles({'width': imgWrapperWidth + 'px', 'height': imgWrapperHeight + 'px', 'min-width': "600px"});
            this._skinParts.title.setStyles({'max-width': imgWrapperWidth + 'px', 'word-wrap': 'break-word'});
            this._skinParts.description.setStyles({'max-width': imgWrapperWidth + 'px', 'word-wrap': 'break-word' });
        },

        _getDisplayerWidth: function (imgWidth) {
            if (imgWidth < this._minWidth) {
                return this._minWidth;
            }
            return imgWidth;
        },

        _getImageWidth: function () {
            var imgWidth = this._data.get("width");
            if (this._maxWidth < 0 || imgWidth <= this._maxWidth) {
                return imgWidth;
            }
            return this._maxWidth;
        },

        _getImageHeight: function () {
            var imgHeight = this._data.get("height");
            if (this._maxHeight < 0 || imgHeight <= this._maxHeight) {
                return imgHeight;
            }
            return this._maxHeight;
        }
    });
});