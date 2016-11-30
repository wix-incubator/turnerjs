define.component('wysiwyg.common.components.spotifyfollow.viewer.SpotifyFollow', function (componentDefinition) {
    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('core.components.base.BaseComp');

    def.propertiesSchemaType('SpotifyFollowProperties');

    def.dataTypes(['SpotifyFollow']);

    def.skinParts({
        iframe: { type: 'htmlElement'},
        placeholder: { type: 'htmlElement' }
    });

    def.states({
        'placeholder': [
            'basic_all_show',
            'basic_all_hide',
            'detailed_dark_show',
            'detailed_dark_hide',
            'detailed_light_show',
            'detailed_light_hide'
        ]
    });

    def.statics({
        EDITOR_META_DATA: {
            general: {
                settings: true,
                design: false
            }
        },
        _resizableSides: [
            Constants.BaseComponent.ResizeSides.LEFT,
            Constants.BaseComponent.ResizeSides.RIGHT
        ],
        defaultSizes: {
            large: {
                width: 225,
                height: 56,
                label: 'detail'
            },
            small: {
                width: 156,
                height: 25,
                label: 'basic'
            }
        },
        _sizeLimits: {
            minW: 156,
            minH: 25,
            maxW: 980,
            maxH: 56
        }
    });

    def.methods({
        initialize: function (compId, viewNode, args) {
            this.parent(compId, viewNode, args);
        },
        _onRender: function (renderEvent) {
            var invalidations = renderEvent.data.invalidations,
                data = this.getDataItem(),
                properties = this.getComponentProperties(),
                uri,
                size,
                theme,
                showFollowersCount,
                hasSizeInvalidation;

            if (invalidations.isInvalidated([
                this.INVALIDATIONS.DATA_CHANGE, this.INVALIDATIONS.PROPERTIES_CHANGE
            ])) {
                uri = data.get('uri');
                size = this.defaultSizes[properties.get('size')];
                theme = properties.get('theme');
                showFollowersCount = properties.get('showFollowersCount');

                this._sizeLimits.minW = size.width;

                this._togglePlaceholderImage(!!uri, size.label, theme, showFollowersCount);
                this._setIframeSource(uri, size.label, theme, showFollowersCount);

                hasSizeInvalidation = !!_.find(invalidations._invalidations.dataChange, function(dc) {return dc.field === 'size';});

                if(hasSizeInvalidation){
                    this.setWidth(size.width);
                    this.setHeight(size.height);
                } else {
                    this._matchIframeSizeToCompSize();
                }
            }
        },

        _togglePlaceholderImage: function (shouldHideImage, sizeLabel, theme, showFollowersCount){
            var fileName;

            this._skinParts.placeholder.setCollapsed(shouldHideImage);
            this._skinParts.iframe.setCollapsed(!shouldHideImage);

            if(!shouldHideImage){
                this._setPlaceholderState(sizeLabel, theme, showFollowersCount);
            }
        },

        _setIframeSource: function (uri, sizeLabel, theme, showFollowersCount) {
            var src;

            if (!this._isUriValid(uri)) {
                return;
            }
            src = 'https://embed.spotify.com/follow/1/?uri=' + uri + '&size=' + sizeLabel + '&theme=' + theme + '&show-count=' + (showFollowersCount ? 1 : 0);
            this._skinParts.iframe.setAttribute('src', src);
        },

        _isUriValid: function (uri) {
            return uri && uri.length > 0;
        },

        setWidth: function (width) {
            this.parent(width);
            this._matchIframeSizeToCompSize();
        },

        setHeight: function (height) {
            this.parent(height);
            this._matchIframeSizeToCompSize();
        },

        _matchIframeSizeToCompSize: function(){
            this._skinParts.iframe.setAttribute("width", this.getWidth() + "px");
            this._skinParts.iframe.setAttribute("height", this.getHeight() + "px");
        },

        _setPlaceholderState: function(layout, color, counter){
            var mode = layout === 'basic' ? 'basic' : 'detailed',
                theme = mode === 'basic' ? 'all' : color === 'dark' ? 'light' : 'dark',
                show = counter ? 'show' : 'hide',
                stateName = mode + '_' + theme + '_' + show;

            this.setState(stateName, 'placeholder');
        }

    });
});