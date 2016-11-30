define.component('wysiwyg.common.components.facebooklikebox.viewer.FacebookLikeBox', function (componentDefinition) {

    var def = componentDefinition;

    def.inherits('core.components.base.BaseComp');

    def.dataTypes(['FacebookLikeBox']);
    def.propertiesSchemaType('FacebookLikeBoxProperties');

    def.resources(['W.Utils', 'W.Viewer', 'W.Commands', 'W.Config']);

    def.skinParts({
        'likeboxContainer': {type: 'htmlElement'},
        'iframe': {type: 'htmlElement'}
    });

    def.states({
        'bgStyle':['bgStyle-noBg', 'bgStyle-light', 'bgStyle-dark']
    });

    def.methods({

        _onRender: function (renderEvent) {
            if (renderEvent.data.invalidations.isInvalidated([this.INVALIDATIONS.DATA_CHANGE, this.INVALIDATIONS.HEIGHT_REQUEST, this.INVALIDATIONS.WIDTH_REQUEST])) {
                this._setSizeLimits();
                this._skinParts.iframe.src = this.getSource();
                this._setBackgroundState();
            }
        },

        _setBackgroundState: function () {
            var isTransparentBg = this.getComponentProperty("transparentBg"),
                colorTheme      = this._data.get('colorScheme');

            var style = isTransparentBg ? 'noBg' : colorTheme;

            this.setState('bgStyle-' + style, 'bgStyle');
        },

        _setSizeLimits: function () {
            var stream = this._data.get('showStream'),
                faces = this._data.get('showFaces'),
                minHeight,
                maxHeight = 999;

            if (!stream && !faces) {
                minHeight = maxHeight = 63;
            }
            if (!stream && faces) {
                minHeight = 270;
            }
            if (stream && !faces) {
                minHeight = 425;
            }
            if (stream && faces) {
                minHeight = 575;
            }

            this.setMinW(292);
            this.setMinH(minHeight);
            this.setMaxH(maxHeight);

            if (this.getHeight() < minHeight) {
                this.setHeight(minHeight);
            }
            if (this.getHeight() > maxHeight) {
                this.setHeight(maxHeight);
            }
            this.parent(minHeight);

        },

        getSource: function () {
            var data = this.getDataItem();
            return '//www.facebook.com/plugins/likebox.php?href=https://www.facebook.com/'
                + data.get('facebookPageId').trim()
                + '&colorscheme=' + data.get('colorScheme')
                + '&height=' + this.getHeight()
                + '&width=' + this.getWidth()
                + '&show_faces=' + data.get('showFaces')
                + '&stream=' + data.get('showStream')
                + '&show_border=' + data.get('showBorder')
                + '&header=' + data.get('showHeader');
        }
    });
});