define.component('wysiwyg.viewer.components.IFrameComponent', function(componentDefinition){
    /** @type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('mobile.core.components.base.BaseComponent');

    def.traits(['wysiwyg.viewer.components.traits.IframeUtils']);

    def.methods({
        initialize: function(compId, viewNode, args){
            args = args || {};
            this.parent(compId, viewNode, args);

            this._iframeUrl = args.iframeUrl || '';
            /** @type HTMLIFrameElement */
            this._iframe = null;
        },

        render: function(){
            this._renderIframe();
        },

        /**
         * @override
         */
        _onResize: function(){
            this.parent();
            if(this._skinParts){
                this._renderIframe();
            }
        },

        _renderIframe: function(force){
            if(!this._iframe){
                // If no iframe, create it
                this._createIframe();
            } else {
                // Else update url (if changed) and dimensions of the iframe
                this._updateIframe(force);
            }
        },
        _createIframe: function(){
            this._iframe = new IFrame({
                src                  : this._iframeUrl,
                width                : '100%',
                height               : '100%',
                webkitAllowFullScreen: 'true',
                mozallowfullscreen   : 'true',
                allowfullscreen      : 'allowfullscreen',
                frameborder          : '0',
                scrolling            : 'no'
                //style                : '';//overflow: visible'
            });

            this._setBasicIframeParams();
            this._setIframeParams();

            this._iframe.insertInto(this._getIframeContainer());
        },

        _getIframeContainer: function(){
            return this._view;
        },

        _changeSize: function(size, triggerOnResize){
            var currentWidth = this.getWidth();
            var currentHeight = this.getHeight();

            var elementWidth  = size.x || size.w || size.width;
            var elementHeight = size.y || size.h || size.height;

            if(elementWidth && elementWidth != currentWidth){
                this.setWidth(elementWidth, false, (!elementHeight && triggerOnResize));
                this._iframe.setStyle("width", elementWidth + "px");
            }
            if(elementHeight && elementHeight != currentHeight){
                this.setHeight(elementHeight, false, triggerOnResize);
                this._iframe.setStyle("height", elementHeight + "px");
            }

            this._wCheckForSizeChangeAndFireAutoSized(1);
        },

        _updateIframe: function(force) {
            this._setBasicIframeParams(force);
            this._setIframeParams();
        },

        _setBasicIframeParams: function(force){
            force = force || false;
            var newUrl = this._getUrl(force);
            if(force || this._iframe.src !== newUrl) {
                this.setIFrameSrc(this._iframe, newUrl);
            }

            this._iframe.width = this.getWidth();
            this._iframe.height = this.getHeight();
        },

        /**
         * Override to implement custom iframe params
         */
        _setIframeParams: function(){

        },

        /**
         * Abstract, should be overridden
         * @return {string}
         */
        _getUrl: function(force){
            throw new Error("IFrameComponent::_getUrl() must be overridden.");
        },

        getIFrame: function(){
            return this._iframe;
        }
    });
});

