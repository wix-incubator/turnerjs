define.component('wysiwyg.common.components.spotifyplayer.viewer.SpotifyPlayer', function(componentDefinition){
    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('core.components.base.BaseComp');

    def.propertiesSchemaType('SpotifyPlayerProperties');

    def.dataTypes(['SpotifyPlayer']);

    def.skinParts({
        iframe: { type: 'htmlElement' },
        placeholder: { type: 'htmlElement' }
    });

    def.methods({
        initialize: function (compId, viewNode, args) {
            this.parent(compId, viewNode, args);

            this.baseUrl = 'https://embed.spotify.com/?';
        },

        _onRender: function (renderEvent) {
            var invalidations = renderEvent.data.invalidations,
                data = this.getDataItem(),
                properties = this.getComponentProperties(),
                uri,
                color,
                style,
                iframeUrl;

            if (invalidations.isInvalidated([
                this.INVALIDATIONS.DATA_CHANGE,
                this.INVALIDATIONS.PART_SIZE
            ])) {
                this.iframeSize = properties.get('size');
                uri = data.get('uri');
                color = properties.get('color');
                style = properties.get('style');

                this._togglePlaceholderImage(!!uri);
                if(!uri) {
                    return;
                }

                this._setSizeLimits(this.iframeSize);

                iframeUrl = this._buildIframeUrl(uri, color, style);
                this._refreshIframe(iframeUrl);

                this._setIframeSize();
                this.setWidth(this.getWidth());
            }
        },

        _togglePlaceholderImage: function (shouldHideImage){
            this._skinParts.placeholder.setCollapsed(shouldHideImage);
            this._skinParts.iframe.setCollapsed(!shouldHideImage);
        },

        _buildIframeUrl: function (uri, color, style){
            return this.baseUrl + 'uri=' + encodeURIComponent(uri) + '&theme=' + color + '&view=' + style;
        },

        _setIframeSize: function() {
            var newWidth = this.getWidth();
            var newHeight = this._calculateHeight(newWidth);

            this._skinParts.iframe.setAttribute('width', newWidth);
            this._skinParts.iframe.setAttribute('height', newHeight);
            this._refreshIframe();
        },

        _refreshIframe: function (url){
            var src = url || this._skinParts.iframe.getAttribute('src');
            this._skinParts.iframe.setAttribute('src', src);
        },

        _setSizeLimits: function (size){
            if(size === 'compact') {
                this._sizeLimits = {
                    minW: 250,
                    minH: 80,
                    maxW: 640,
                    maxH: 80
                };
            }
            else {
                this._sizeLimits = {
                    minW: 250,
                    minH: 330,
                    maxW: 640,
                    maxH: 720
                };
            }
        },

        _calculateHeight: function (width){
            var height = this._sizeLimits.minH;

            if(this.iframeSize === 'large') {
                //Add to height each px that was added to the width
                height = height + (width - this._sizeLimits.minW);
            }

            return height;
        },

        setWidth: function (width) {
            var newHeight = this._calculateHeight(width);
            this.setHeight(newHeight);
            this.parent(width);
        }
    });
});