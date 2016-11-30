define.component('wysiwyg.common.components.youtubesubscribebutton.viewer.YouTubeSubscribeButton', function (componentDefinition) {
    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('core.components.base.BaseComp');

    def.traits(["wysiwyg.viewer.components.traits.CustomPreviewBehavior"]);

    def.propertiesSchemaType('YouTubeSubscribeButtonProperties');

    def.dataTypes(['YouTubeSubscribeButton']);

    def.resources(['topology', 'W.Config']);

    def.skinParts({
        youtubeIframe: { type: 'htmlElement' }
    });
    def.binds(['_onMouseOut', '_onMouseOver']);

    def.states({
        'hoverMode':['hover', 'nonHover'],
        'layout':['full','default','fullIE','defaultIE']
    });


    def.statics({
        _defaultLayoutWidth: 145,
        _defaultLayoutHeight: 33,
        _fullLayoutWidth: 212,
        _fullLayoutHeight: 55,
        _fullLayoutHeightIE: 69,
        _toolTipExtraSpace: 60,
        _toolTipWidthExtraSpaceDefault: 150,
        _toolTipWidthExtraSpaceFull: 150
    });

    def.methods({

        initialize: function (compId, viewNode, args) {
            this.parent(compId, viewNode, args);
            this._resizableSides = [Constants.BaseComponent.ResizeSides.RIGHT, Constants.BaseComponent.ResizeSides.LEFT];
            if(W.Utils.isIE() || W.Utils.isEdge()){
                this._fullLayoutHeight = this._fullLayoutHeightIE;
            }
        },

        isRenderNeeded: function (invalidations) {
            var renderTriggers = [
                this.INVALIDATIONS.SKIN_CHANGE,
                this.INVALIDATIONS.DATA_CHANGE,
                this.INVALIDATIONS.SIZE
            ];
            return invalidations.isInvalidated(renderTriggers);
        },

        _onRender: function (ev) {
            var invalidations = ev.data.invalidations;
            var props = this.getComponentProperties().getData();
            this.setState("nonHover", "hoverMode");
            if (invalidations.isInvalidated([ this.INVALIDATIONS.SKIN_CHANGE,this.INVALIDATIONS.DATA_CHANGE ])) {
                if (props.layout === 'default') {
                    this.setMinW(this._defaultLayoutWidth);
                    this.setMinH(this._defaultLayoutHeight);
                    this.setHeight(this._defaultLayoutHeight+"px");
                }else{
                    this.setMinW(this._fullLayoutWidth);
                    this.setMinH(this._fullLayoutHeight);
                    this.setHeight(this._fullLayoutHeight+"px");
                }
            }
            this._createIframe();
            this._createClickOverlayForPreviewMode('Social_Widgets_Only_On_Public');
        },

        _getIframeDimensions: function (withExtraSpace) {
            var width, height;
            var viewerMode = this.resources.W.Config.env.$viewingDevice;
            var props = this.getComponentProperties().getData();
            if (props.layout === 'default') {
                if (Browser.ie || W.Utils.isEdge()){
                    this.setState("defaultIE", "layout");
                }else{
                    this.setState("default", "layout");
                }
                width = this.getWidth();
                height = this.getHeight();
                if (viewerMode === Constants.ViewerTypesParams.TYPES.DESKTOP&&withExtraSpace) {
                    height += this._toolTipExtraSpace;
                    width += this._toolTipWidthExtraSpaceDefault;
                }
            } else {
                if (Browser.ie || W.Utils.isEdge()){
                    this.setState("fullIE", "layout");
                }else{
                    this.setState("full", "layout");
                }
                width = this.getWidth();
                height = this.getHeight();
                if (viewerMode === Constants.ViewerTypesParams.TYPES.DESKTOP&&withExtraSpace) {
                    height += this._toolTipExtraSpace;
                    width += this._toolTipWidthExtraSpaceFull;
                }
            }
            return {
                width: width + 'px',
                height: height + 'px'
            };
        },

        _getIframeUrl: function () {
            var htmlUrl = this.resources.topology.wysiwyg + "/html/external/youtubeSubscribeButton.html";
            var data = this.getDataItem().getData();
            var props = this.getComponentProperties().getData();

            return htmlUrl +
                '?channel=' + data.youtubeChannelId +
                '&layout=' + props.layout +
                '&theme=' + props.theme;
        },

        _createIframe: function () {
            var iframeDimensions = this._getIframeDimensions();
            this._iframe = new IFrame({
                src: this._getIframeUrl(),
                webkitAllowFullScreen: 'true',
                mozallowfullscreen: 'true',
                allowfullscreen: 'allowfullscreen',
                frameborder: '0',
                width: '100%',
                height: '100%'
            });

            this._removePreviousIframesElements();
            this._skinParts.youtubeIframe.style.height = iframeDimensions.height;
            this._skinParts.youtubeIframe.style.width = iframeDimensions.width;
            this._skinParts.hitWidth.style.left = iframeDimensions.width;
            this._iframe.insertInto(this._skinParts.youtubeIframe);
            this._iframe.addEvent(Constants.CoreEvents.MOUSE_OVER, this._onMouseOver);
            this._iframe.addEvent(Constants.CoreEvents.MOUSE_OUT, this._onMouseOut);
        },
        _onMouseOver: function (e){
            var iframeDimensions = this._getIframeDimensions(true);
            this.setState("hover", "hoverMode");
            this._skinParts.youtubeIframe.style.height = iframeDimensions.height;
            this._skinParts.youtubeIframe.style.width = iframeDimensions.width;

        },
        _onMouseOut:function(e){
            var iframeDimensions = this._getIframeDimensions();
            this.setState("nonHover", "hoverMode");
            this._skinParts.youtubeIframe.style.height = iframeDimensions.height;
            this._skinParts.youtubeIframe.style.width = iframeDimensions.width;
        },

        _removePreviousIframesElements:function(){
            var childArr = Array.from(this._skinParts.youtubeIframe.childNodes);
            for (var i = 0; i < childArr.length; i++) {
                var elem = childArr[i];
                if (elem && elem.nodeName == "IFRAME"){
                    elem.parentElement.removeChild(elem);
                }
            }
        }
    });
});