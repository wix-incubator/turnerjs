define.experiment.component('wysiwyg.common.components.facebooklikebox.viewer.FacebookLikeBox.NewFacebookLikebox', function (componentDefinition, experimentStrategy) {

    var def = componentDefinition,
        strategy = experimentStrategy;
    var compHeight = {SIMPLE: 130, FACES: 224, STREAM: 575, MAX: 2000};

    def.inherits('core.components.base.BaseComp');

    def.dataTypes(['FacebookLikeBox']);
    def.propertiesSchemaType('FacebookLikeBoxProperties');

    def.resources(['W.Utils', 'W.Viewer', 'W.Commands', 'W.Config', 'topology']);

    def.skinParts({
        'likeboxContainer': {type: 'htmlElement'},
        'iframe': {type: 'htmlElement'}
    });

    def.methods({

        initialize: function (compId, viewNode, argsObject) {
            this.parent(compId, viewNode, argsObject);
            this.debounceSetIframeSource = _.debounce(this._setIframeSrc.bind(this), 200);
        },

        _onRender: function (renderEvent) {
            if (renderEvent.data.invalidations.isInvalidated([this.INVALIDATIONS.DATA_CHANGE, this.INVALIDATIONS.SIZE])) {
                this._setSizeLimits();
                this.debounceSetIframeSource();
            }
        },

        _setIframeSrc: function () {
            this._skinParts.iframe.src = this.getSource();
            this.showPreloader();
        },

        _getHeights: function (props) {
            var showFaces = props.showFaces,
                showStream = props.showStream,
                currentHeight = this.getHeight();
            var heights = {};

            if (!showStream && showFaces) {
                heights.minHeight = heights.maxHeight = heights.currentHeight = compHeight.FACES;
            } else if (showStream) {
                heights.minHeight = compHeight.STREAM;
                heights.maxHeight = compHeight.MAX;
                heights.currentHeight = currentHeight < heights.minHeight ? heights.minHeight : currentHeight;
            } else {
                heights.minHeight = heights.maxHeight = heights.currentHeight = compHeight.SIMPLE;
            }
            return heights;
        },

        _setSizeLimits: function () {
            var data = _.pick(this._data._data, ['showFaces', 'showHeader', 'showStream']);
            var heights = this._getHeights(data);
            this._setHeightLimits(heights);
            this._setWidthLimits();
        },

        _setHeightLimits: function (heights) {
            this.setMaxH(heights.maxHeight);
            this.setMinH(heights.minHeight);
            this.parent(heights.minHeight);

            if (heights.currentHeight != this.getHeight()) {
                this.setHeight(heights.currentHeight);
            }
        },

        _setWidthLimits: function () {
            this.setMinW(280);
            this.setMaxW(500);
        },

        _shouldChangeHeight: function (currData, prevData) {
            return (prevData.showStream !== currData.showStream) || (!currData.showStream && prevData.showFaces !== currData.showFaces);
        },

        getSource: function () {
            var baseURL = this.resources.topology.wysiwyg + "/html/external/";
            var data = this.getDataItem();

            return baseURL + 'fbpagelike.html?data-href=https://facebook.com/' +
                data.get('facebookPageId').trim() +
                '&data-height=' + (this.getHeight()) +
                '&data-width=' + (this.getWidth()) +
                '&data-hide-cover=' + !data.get('showHeader') +
                '&data-show-posts=' + data.get('showStream') +
                '&data-show-facepile=' + data.get('showFaces');
        },

        showPreloader: function () {
            var image = this.$view.getElementsByClassName('loadImg')[0];
            image.style.display = 'block';
        }
    });
});
