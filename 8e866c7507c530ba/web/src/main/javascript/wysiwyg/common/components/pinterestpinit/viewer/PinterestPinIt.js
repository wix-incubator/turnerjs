define.component('wysiwyg.common.components.pinterestpinit.viewer.PinterestPinIt', function (componentDefinition) {
    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('core.components.base.BaseComp');

    def.utilize(['core.components.image.ImageUrlNew']);

    def.resources(['W.Config', 'topology', 'W.Theme']);

    def.dataTypes(['PinterestPinIt']);

    def.propertiesSchemaType('PinterestPinItProperties');

    def.skinParts({
        iframe: { type: 'htmlElement' }
    });

    def.statics({
        _pinButtonSizes: {
            none: {
                small: {
                    width: 40,
                    height: 20
                },
                large: {
                    width: 56,
                    height: 28
                }
            },
            beside: {
                small: {
                    width: 40 + 40 + 1, // 40 is counter block width, 1 is margin
                    height: 20
                },
                large: {
                    width: 56 + 44 + 1, // 42 is counter block width, 1 is margin
                    height: 28
                }
            },
            above: {
                small: {
                    width: 40,
                    height: 20 + 29 + 1// 29 is counter block height, 1 is margin
                },
                large: {
                    width: 56,
                    height: 28 + 37 + 1 // 37 is counter block height, 1 is margin
                }
            }
        },
        _requiredFields: [
            'uri',
            'description'
        ]
    });

    def.methods({
        initialize: function (compId, viewNode, args) {
            this.parent(compId, viewNode, args);
            this._imgUtils = new this.imports.ImageUrlNew();
        },

        _onRender: function (ev) {
            var invalidations = ev.data.invalidations;

            if (invalidations.isInvalidated([this.INVALIDATIONS.FIRST_RENDER])) {
                this._firstRender(invalidations);
            }
        },

        _firstRender: function (invalidations) {
            this._changeIframeDimensions();
            this._changeIframe();
        },

        _getSiteUrl: function () {
            return window.location.href;
        },

        _changeIframeDimensions: function () {
            var iframe = this._skinParts.iframe,
                propsItem = this.getComponentProperties(),
                counterPosition = propsItem.get('counterPosition'),
                size = propsItem.get('size');

            iframe.width = this._pinButtonSizes[counterPosition][size].width;
            iframe.height = this._pinButtonSizes[counterPosition][size].height;
        },

        _changeIframe: function () {
            var iframe = this._skinParts.iframe;

            iframe.src = this._generateIframeUrl(this._haveRequiredData());
        },

        _haveRequiredData: function () {
            var i,
                data = this.getDataItem().getData();

            for (i = 0; i < this._requiredFields.length; i++) {
                if (!data[this._requiredFields[i]]) {
                    return false;
                }
            }

            return true;
        },

        _generateIframeUrl: function (isHaveData) {
            var baseUrl = this.resources.topology.wysiwyg + "/html/external/pinterestpin.html",
                dataItem,
                propsItem,
                size,
                sets;

            if (isHaveData) {
                dataItem = this.getDataItem();
                propsItem = this.getComponentProperties();
                size = propsItem.get('size');
                sets = {
                    media: this._getImageUrl(),
                    url: this._getSiteUrl(),
                    description: dataItem.get('description'),
                    'data-pin-config': propsItem.get('counterPosition'),
                    'data-pin-color': propsItem.get('color'),
                    'data-pin-height': this._pinButtonSizes.none[size].height
                };
            } else {
                /**
                 * this is done mainly for IE 8.
                 * It can't show background image of the iframe,
                 * so it should be set inside of the iframe.
                 * This background image is the "inactive" state of the pinIt button,
                 * that should be shown according to the Product's spec
                 */
                sets = {
                    gagPath: this.resources.W.Theme.getProperty('WEB_THEME_DIRECTORY') + 'pinterestPinIt/pinterest_disabled.png'
                };
            }

            return baseUrl + '?' + Object.toQueryString(sets);
        },

        addProtocolIfMissing: function (url) {
            var beginsWithProtocol = /^(ftps|ftp|http|https):.*$/.test(url),
                beginsWithDoubleSlash = /^\/\//.test(url);

            if (beginsWithProtocol) {
                return url;
            }
            if (beginsWithDoubleSlash) {
                return 'http:' + url;
            }

            return 'http://' + url;
        },

        _getImageUrl: function () {
            var uri = this.getDataItem().get('uri');

            uri = this._imgUtils.getImageAbsoluteUrlFromRelativeUrl(uri);

            return this.addProtocolIfMissing(uri);
        }
    });
});