define.component('wysiwyg.viewer.components.LinkBarItem', function (componentDefinition) {
    /** @type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('mobile.core.components.base.BaseComponent');

    def.binds(['_onMouseOver', '_onMouseOut', '_onLinkMouseDown', '_onImageStateChange']);

    def.utilize(['wysiwyg.common.utils.LinkRenderer']);

    def.resources(['W.Data']);

    def.dataTypes([]);

    def.skinParts({
        'image': { type: 'core.components.Image', dataRefField: "*", optional: false },
        'imageBG': { type: 'htmlElement', optional: true },
        'link': {  type: 'htmlElement', optional: false }
    });

    def.dataTypes(['Image']);

    def.states(['loading', 'normal', 'rollover']);

    def.fields({
        _parentList: null
    });

    def.methods({
        initialize: function (compId, viewNode, args) {
            this.parent(compId, viewNode, args);
            this._linkRenderer = new this.imports.LinkRenderer();
        },

        _onRender: function () {
            if (this._isRendered) {
                this._renderLink();
            }
        },

        _renderLink: function () {
            var dataItemWithSchema = this.getDataItem();
            var linkId = dataItemWithSchema._data.link;
            if (!linkId) {
                this._linkRenderer.removeRenderedLinkFrom(this._skinParts.link, this);
                return;
            }
            var linkDataItem = this.resources.W.Data.getDataByQuery(linkId);
            if (linkDataItem) {
                this._linkRenderer.renderLink(this._skinParts.link, linkDataItem, this);
            }
        },

        setParentList: function (value) {
            this._parentList = value;
        },

        _onImageStateChange: function (event) {
            switch (this._skinParts.image.getState()) {
                case 'loading':
                    this.setState('loading');
                    break;
                case 'loaded':
                    this.setState('normal');
                    break;
            }
        },

        _onMouseOver: function () {
            if (this.getState() == "normal") {
                this.setState("rollover");
            }
        },

        _onMouseOut: function () {
            if (this.getState() == "rollover") {
                this.setState("normal");
            }
        },

        _onLinkMouseDown: function (event) {
            var targetURL = this._data.get("link");
            var target = this._data.get("target") || "_blank";
            if (targetURL) {
                window.open(targetURL, target);
            }
        },

        setSize: function (size, margin, scale, isHoriz) {
            var marginHoriz, marginVert;

            if (isHoriz) {
                marginHoriz = margin;
                marginVert = 0;
            }
            else {
                marginHoriz = 0;
                marginVert = margin;
            }

            var contentSize;
            var center = {};

            this._skinParts.image.setSize(size, size, 'px');

            /*
             We removed the BG ability. (for now I hope..) (!!)

             if (this._skinParts.imageBG) {
             var BG = this._skinParts.imageBG;
             var imgSize = this._skinParts.image.getImageSize().x;
             var bgSize = (scale * imgSize);

             if (scale > 1)  // Background is bigger than icon
             contentSize = bgSize;
             else              // background is small than icon
             contentSize = imgSize;

             // Find the biggest element's center
             center.x = center.y = contentSize / 2;

             BG.setStyles({
             // Resize
             'width'  : String (  bgSize  ) + "px",
             'height' : String (  bgSize )  + "px",
             // Position
             left : center.x - (bgSize / 2),
             top  : center.y - (bgSize / 2) - imgSize // (-size) to put the BG on top of the image, -2, since the image does the same...
             });
             }
             else {*/
            contentSize = size;
            center.x = center.y = contentSize / 2;
            /*}*/

            // Position the icon
            this._skinParts.image.getViewNode().setStyles({
                left: center.x - (size / 2), /* when no background exist, this should equal 0 */
                top: center.y - (size / 2) /* when no background exist, this should equal 0 */
            });

            this.getViewNode().setStyles({
                'width': String(contentSize + marginHoriz) + "px",
                'height': String(contentSize + marginVert) + "px"
            });
        },


        /**
         * @override
         */
        _onDataChange: function (dataItem) {
            this.parent();
        },

        _onAllSkinPartsReady: function () {
            var data = this._skinParts.image.getDataItem(),
                uri = data.get('uri'),
                urisToEdit = ['b1cd13f9d4dfb1450bbb325285106177.png', '01113281ebb7dfb57a8dc2a02eb1cb92.png', '303edc0e9267d1fbf617777609f864ae.wix_mp', '806f5f56d9a7b8849f2f2ea71ff5c0cc.png'],
                i;

            this.parent();
            for (i = 0; i < urisToEdit.length; i++) {
                if (urisToEdit[i] === uri) {
                    data.set('width', 128);
                    data.set('height', 128);
                }
            }
        },

        /**
         * @override
         */
        _onResize: function () {
            this.parent();
            if (this._skinParts["image"]) {
                this._skinParts.image._invalidate("size");
                this._skinParts.image._renderIfReady();
            }
        },

        getImageRef: function () {
            var value = "";

            if (this._skinParts) {
                value = String(this._skinParts.image.getDataItem().get("id"));
            }

            return value;
        }
    });
});
