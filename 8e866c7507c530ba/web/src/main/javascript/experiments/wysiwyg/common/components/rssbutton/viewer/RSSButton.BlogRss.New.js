define.experiment.newComponent('wysiwyg.common.components.rssbutton.viewer.RSSButton.BlogRss.New', function(componentDefinition){
    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('core.components.base.BaseComp');

    def.resources(['W.Config', 'W.Data', 'W.MessagesController', 'W.Resources']);

    def.propertiesSchemaType('RssButtonProperties');

    def.dataTypes(['RssButton']);

    def.binds([
        'click'
    ]);

    def.utilize([
        'core.components.image.ImageSettings',
        'wysiwyg.common.utils.LinkRenderer'
    ]);

    def.statics({
        RSS_NOT_AVAILABLE_MESSAGE: {
            TITLE: "OH OH",
            MESSAGE: "This won't work while the site is not published. Publish it to view your Blog Rss feed."
        },
        RSS_FEED: "feed.xml"
    });


        def.skinParts({
        'link': {
            type: 'htmlElement',
            dataRefField: 'link'
        },
        'image': {
            type: 'core.components.image.ImageNew',
            dataRefField: 'image',
            argObject: { requestExactSize: false }
        }
    });

    def.fields({
        _linkRenderer: null,
        _imageSettings: null
    });

    def.methods({
        initialize: function (compId, viewNode, argsObject) {
            this.parent(compId, viewNode, argsObject);
            this._linkRenderer = new this.imports.LinkRenderer();
            this._rotatable = true;
            this.initImageSettings();
            this.attachListeners();
        },
        initImageSettings: function () {
            var ImageSettings = this.imports.ImageSettings,
                CROP_CONTAINS = ImageSettings.CropModes.CONTAINS;

            this._imageSettings = new ImageSettings(CROP_CONTAINS, 16, 16);
        },
        attachListeners: function () {
            var view = this.$view;

            view.addNativeListener('click', this.click);
            view.addNativeListener('dragstart', this.preventDefaultAction);
        },

        preventDefaultAction: function (e) {
            if (e.preventDefault) {
                e.preventDefault();
            }
            return false;
        },

        click: function (e) {
            var editorModel = window.editorModel || window.top.editorModel;
            if (editorModel && !editorModel.siteHeader.published) {
                var title = this.resources.W.Resources.get('EDITOR_LANGUAGE', "blog_RSSBUTTON_ONLY_AVAILABLE_WHEN_PUBLISHED_TITLE", this.RSS_NOT_AVAILABLE_MESSAGE.TITLE);
                var msg = this.resources.W.Resources.get('EDITOR_LANGUAGE', "blog_RSSBUTTON_ONLY_AVAILABLE_WHEN_PUBLISHED_MESSAGE", this.RSS_NOT_AVAILABLE_MESSAGE.MESSAGE);
                this.resources.W.MessagesController.showMessage(title, msg);
                this.preventDefaultAction(e);
            }
            return true;
        },

        _onRender: function (e) {
            var FIRST_RENDER = this.INVALIDATIONS.FIRST_RENDER,
                DATA_CHANGE = this.INVALIDATIONS.DATA_CHANGE,
                SIZE_REQUEST = [
                    this.INVALIDATIONS.WIDTH_REQUEST,
                    this.INVALIDATIONS.HEIGHT_REQUEST
                ];

            if (this.debugMode || e.data.invalidations.isInvalidated([FIRST_RENDER])) {
                this._onFirstRender();
                this._onDataChange();
                this._onSizeRequest();
            } else if (e.data.invalidations.isInvalidated([DATA_CHANGE])) {
                this._onDataChange();
            } else if (e.data.invalidations.isInvalidated(SIZE_REQUEST)) {
                this._onSizeRequest();
            }
        },
        _onFirstRender: function () {
            this.removeInlineStyles(); // NOTE: IE8 fix
        },
        _onDataChange: function () {
            this.renderLink();
        },
        _onSizeRequest: function () {
            this.setImageSettings();
        },
        renderLink: function () {
            var data = this.getDataItem(),
                renderer = this._linkRenderer,
                anchor = this._skinParts.link,
                linkId = data.get('link'),
                linkData,
                imageId = data.get('image'),
                imageData;

            imageData = this.resources.W.Data.getDataByQuery(imageId);
            anchor.set('title', imageData.get('alt'));

            if (!linkId) {
                renderer.removeRenderedLinkFrom(anchor);
                return;
            }

            linkData = this.resources.W.Data.getDataByQuery(linkId);

            var baseUrl = this.resources.W.Config.getExternalBaseUrl() || this.resources.W.Config.getUserPublicUrl();
            if(baseUrl) {
                var slash = (baseUrl.charAt(baseUrl.length - 1) === "/" ? "" : "/");
                linkData._data.url = baseUrl + slash + this.RSS_FEED;
            }
            renderer.renderLink(anchor, linkData, this);
        },
        setImageSettings: function () {
            var settings = this._imageSettings,
                width = this.getWidth(),
                height = this.getHeight();

            settings.setSize(width, height);

            this._skinParts.image.setSettings(settings);

            this._skinParts.link.style.width = width + 'px';
            this._skinParts.link.style.height = height + 'px';
        },
        removeInlineStyles: function () {
            this._skinParts.image.$view.style.visibility = "";
        }
    });
});
