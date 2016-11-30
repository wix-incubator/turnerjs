define.component('wysiwyg.common.components.skypecallbutton.viewer.SkypeCallButton', function(componentDefinition){
    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('core.components.base.BaseComp');

    def.propertiesSchemaType('SkypeCallButtonProperties');

    def.resources(['topology']);

    def.dataTypes(['SkypeCallButton']);

    def.skinParts({
        iframe: { type: 'htmlElement' },
        placeholder: { type: 'htmlElement' }
    });

    def.states({
        buttonType: ['call', 'chat'],
        imageSize: ['medium', 'small', 'large'],
        imageColor: ['blue', 'white'],
        iframe: ['iframe_loading', 'iframe_ready']
    });

    def.methods({
        initialize: function (compId, viewNode, args) {
            this.parent(compId, viewNode, args);

            this._defaultSizes = {
                call: {
                    small:  { width: 38, height: 16 },
                    medium: { width: 56, height: 24 },
                    large:  { width: 73, height: 32 }
                },
                chat: {
                    small:  { width: 45, height: 16 },
                    medium: { width: 65, height: 24 },
                    large:  { width: 86, height: 32 }
                }
            };
        },
        _onFirstRender: function () {
            var iframe = this._skinParts.iframe;
            iframe.addEvent('load', this._updateIframeReady.bind(this));
        },
        _onEachRender: function () {
            this._updatePlaceholderVisiblity();
            this._updateSize();
            this._updateIframeLoading();
            this._updateIframeSrc();
            this._updateVisualState();
        },
        _onRender: function (e) {
            var FIRST_RENDER = this.INVALIDATIONS.FIRST_RENDER;

            if (e.data.invalidations.isInvalidated([FIRST_RENDER])) {
                this._onFirstRender(e);
            }

            this._onEachRender(e);
        },
        isRenderNeeded: function (invalidations) {
            var renderTriggers = [
                this.INVALIDATIONS.FIRST_RENDER,
                this.INVALIDATIONS.DATA_CHANGE
            ];
            return invalidations.isInvalidated(renderTriggers);
        },
        _updatePlaceholderVisiblity: function () {
            var data = this.getDataItem(),
                skypeName = data.get('skypeName'),
                isLoginEntered;

            isLoginEntered = (skypeName || "").length > 0;
            if (isLoginEntered) {
                this._skinParts.iframe.setCollapsed(false);
                this._skinParts.placeholder.setCollapsed(true);
            } else {
                this._skinParts.iframe.setCollapsed(true);
                this._skinParts.placeholder.setCollapsed(false);
            }
        },
        getDefaultSize: function(buttonType, imageSize) {
            return this._defaultSizes[buttonType][imageSize];
        },
        _updateSize: function () {
            var data = this.getDataItem(),
                props = this.getComponentProperties(),
                buttonType = data.get('buttonType'),
                imageSize = props.get('imageSize'),
                size;
           
            size = this.getDefaultSize(buttonType, imageSize);

            this.setWidth(size.width);
            this.setHeight(size.height);
        },
        _updateIframeLoading: function () {
            this.setState('iframe_loading', 'iframe');
        },
        _updateIframeReady: function () {
            this.setState('iframe_ready', 'iframe');
        },
        _updateIframeSrc: function () {
            var data = this.getDataItem(),
                skypeName = data.get('skypeName'),
                buttonType = data.get('buttonType'),
                props = this.getComponentProperties(),
                imageColor = props.get('imageColor'),
                imageSize = props.get('imageSize'),
                iframe = this._skinParts.iframe,
                baseURL,
                size,
                queryString;

            if (!skypeName) {
                iframe.src = "about:blank";
                return;
            }

            size = this.getDefaultSize(buttonType, imageSize);

            queryString =  '?skypeName=' + encodeURIComponent(skypeName);
            queryString += '&buttonType=' + encodeURIComponent(buttonType);
            queryString += '&imageColor=' + encodeURIComponent(imageColor);
            queryString += '&imageSize=' + size.height;

            baseURL = this.resources.topology.wysiwyg.replace(/^https/, "http");
            iframe.src = baseURL + "/html/external/SkypeCallButton.html" + queryString;
        },
        _updateVisualState: function () {
            var data = this.getDataItem(),
                buttonType = data.get('buttonType'),
                props = this.getComponentProperties(),
                imageColor = props.get('imageColor'),
                imageSize = props.get('imageSize');

            this.setState(buttonType, 'buttonType');
            this.setState(imageSize, 'imageSize');
            this.setState(imageColor, 'imageColor');
        },
        setWidth: function (width) {
            this._skinParts.iframe.setStyle('width', width + 'px');
            this._skinParts.placeholder.setStyle('width', width + 'px');
            this.parent(width);
        },
        setHeight: function (height) {
            this._skinParts.iframe.setStyle('height', height + 'px');
            this._skinParts.placeholder.setStyle('height', height + 'px');
            this.parent(height);
        }
    });
});
