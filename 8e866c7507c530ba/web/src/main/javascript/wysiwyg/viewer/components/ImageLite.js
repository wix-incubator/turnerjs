define.component('wysiwyg.viewer.components.ImageLite', function(componentDefinition){
    /** @type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('mobile.core.components.base.BaseComponent');

    def.utilize(['core.components.image.ImageUrl']);

    def.dataTypes(['Image']);

    def.fields({
        _currentUri : ""
    });

    def.methods({
        initialize: function(compId, viewNode, args) {
            this.parent(compId, viewNode, args);
        },

        _onAllSkinPartsReady : function () {
            if(!this._img) {
                this._img = new Element("img");
                this._view.adopt(this._img);
            }
        },

        render : function () {
            var size = this._view.getSize();
            this.setSize(size.x, size.y);
        },

        setOwner : function () {
        },

        invalidateSize : function () {
        },

        setSize : function (width, height) {
            this._imgWidth = parseInt(this._data.get("width"));
            this._imgHeight = parseInt(this._data.get("height"));

            var styleDef = {
                "width": parseInt(width),
                "height": parseInt(height),
                "overflow": "hidden"
            };
            this._view.setStyles(styleDef);

            var imgWidth = width;
            var imgHeight = width * (this._imgHeight/this._imgWidth);
            if(imgHeight < height) {
                imgHeight = height;
                imgWidth = height * (this._imgWidth/this._imgHeight);
            }
            var imgTop = (height - imgHeight) / 2.0;
            imgTop = imgTop < 0 ? imgTop : 0;
            var imgLeft = (width - imgWidth) / 2.0;
            imgLeft = imgLeft < 0 ? imgLeft : 0;

            var uri = new this.imports.ImageUrl().getImageUrlFromPyramid({ x: parseInt(imgWidth), y: parseInt(imgHeight) }, this._data.get("uri")).url;
            if(this._currentUri !== uri) {
                this._currentUri = uri;
                this._img.setAttribute("src", uri);
            }


            var imageDef = {
                "position": "static",
                "width": Math.round(imgWidth) + 1,
                "height": parseInt(imgHeight),
                "margin-top" : parseInt(imgTop),
                "margin-left": parseInt(imgLeft),
                "box-shadow": "#000 0 0 0",             // Solves firefox bug https://bugzilla.mozilla.org/show_bug.cgi?id=745446
                "image-rendering": "optimizequality"
            };
            this._img.setStyles(imageDef);
        }
    });
});