define(['react', 'lodash', 'utils', 'santaProps', 'imageCommon/bi/errors'], function (React, _, utils, santaProps, biErrors) {
    'use strict';

    var svgFilters = utils.svgFilters;

    return {
        propTypes: {
            staticMediaUrl: santaProps.Types.ServiceTopology.staticMediaUrl,
            reportBI: santaProps.Types.reportBI,
            'data-type': React.PropTypes.string,
            effectName: React.PropTypes.string,
            id: React.PropTypes.string
        },

        imageForLoadEvents: null,

        getSvgStyle: function (imageAttributes) {
            return {
                style: {
                    width: imageAttributes.style.width || 0,
                    height: imageAttributes.style.height || 0,
                    left: 0,
                    top: 0,
                    overflow: 'hidden',
                    position: 'absolute',
                    visibility: 'hidden'
                }
            };
        },

        /**
         * Add load events
         * @param {function} [readyCallback]
         * @param {function} [errorCallback]
         * @param {string} uri
         */
        assignLoadEvents: function (readyCallback, errorCallback, uri) {
            if (!this.imageForLoadEvents) {
                if (typeof window !== 'undefined') {
                    this.imageForLoadEvents = new window.Image();
                    if (readyCallback) {
                        this.imageForLoadEvents.onload = readyCallback;
                    }
                    if (errorCallback) {
                        this.imageForLoadEvents.onerror = errorCallback;
                    }
                } else {
                    this.imageForLoadEvents = {};
                }
            }
            this.imageForLoadEvents.src = uri;
        },

        /**
         * Get image component, assign a style property of filter pointing to filterId if an effect was defined
         * TODO: handle IE/Edge
         * @param {ImageTransformResult} imageTransformObject
         * @param {string} altText
         * @param {string} filterId
         * @returns {object}
         */
        getImageAttributes: function (imageTransformObject, filterId, altText) {
            var componentStyle = imageTransformObject.css || {};
            var styleFilter = filterId ? {
                WebkitFilter: 'url(#' + filterId + ')',
                filter: 'url(#' + filterId + ')'
            } : {};
            return {
                displayName: 'Image Element',
                id: this.props.id + 'image',
                ref: 'image',
                key: 'image' + filterId,
                alt: altText,
                src: imageTransformObject.uri,
                style: _.assign(styleFilter, componentStyle.img),
                'data-type': this.props['data-type'],
                itemProp: imageTransformObject.itemProp
            };
        },

        getSvgImageAttributes: function (imageTransformObject, filterId) {
            var componentStyle = imageTransformObject.attr || {};
            var attributes = _.assign({
                displayName: 'SVG Image Element',
                id: this.props.id + 'image',
                ref: 'image',
                key: 'image',
                xlinkHref: imageTransformObject.uri,
                'data-type': this.props['data-type']
            }, componentStyle.img);

            if (filterId) {
                attributes.filter = 'url(#' + filterId + ')'; //"filter" attribute not supported in react 0.14, will override in imageLayout
            }

            return attributes;
        },

        /**
         * Get an SVG element attributes
         * @returns {object}
         */
        getSvgAttributes: function (componentStyle, filterId) {
            return _.assign({
                displayName: 'SVG Filter',
                ref: 'svg',
                key: 'svg' + filterId,
                version: '1.1'
            }, componentStyle);
        },

        getValidEffectName: function (){
            var name = '';
            var effectName = this.props.effectName;
            if (effectName && effectName !== 'none') {
                //TODO: handle bad filter name in filter getters
                if (svgFilters.isFilterExists(effectName)) {
                    name = effectName;
                } else {
                    this.props.reportBI(biErrors.IMAGE_FILTER_NOT_VALID, {filterName: effectName});
                }
            }
            return name;
        },

        /**
         * Get an SVG "defs" attributes with a filter of type "effectName" and "filterId"
         * @param effectName
         * @param filterId
         * @returns {object}
         */
        getSvgDefsAttributes: function (effectName, filterId, filterOverrides) {
            var attributes = {
                ref: 'defs',
                key: 'defs' + filterId
            };

            if (filterId) {
                attributes.dangerouslySetInnerHTML = {__html: svgFilters.getFilter(filterId, effectName, filterOverrides)};
            }
            return attributes;
        },

        /**
         * IE/Edge does not support CSS filter property with SVG url.
         * For these browers we render the image inside an SVG <image> element.
         *
         * NOTE: since React 0.14 does not support the "filter" SVG property, we need to save it and apply it in imageLayout.
         * @param {ImageTransformResult} imageTransformObjectForSvg
         * @param {function} [readyCallback]
         * @param {function} [errorCallback]
         * @returns {*}
         */
        getSvgOnlyImageComponent: function (imageTransformObjectForSvg, readyCallback, errorCallback) {
            var svgImageAndFilterComp, svgAttributes, defsAttributes, imageAttributes;
            var effectName = this.getValidEffectName();
            var filterId = effectName && effectName + '-' + this.props.id;
            var filterOverrides = {staticMediaUrl: this.props.staticMediaUrl};

            if (readyCallback || errorCallback) {
                this.assignLoadEvents(readyCallback, errorCallback, imageTransformObjectForSvg.uri);
            }

            imageAttributes = this.getSvgImageAttributes(imageTransformObjectForSvg, filterId);
            svgAttributes = this.getSvgAttributes(imageTransformObjectForSvg.attr.container, filterId);
            defsAttributes = effectName ? this.getSvgDefsAttributes(effectName, filterId, filterOverrides) : {};

            svgImageAndFilterComp = React.createElement('svg', svgAttributes, [
                React.createElement('defs', defsAttributes),
                React.createElement('image', imageAttributes)
            ]);

            return svgImageAndFilterComp;
        },

        /**
         * Get the components for rendering an image and if defined an svg filter
         * @param {ImageTransformResult} imageTransformObject
         * @param {function} [readyCallback]
         * @param {function} [errorCallback]
         * @returns {*}
         */
        getImageComponents: function (imageTransformObject, readyCallback, errorCallback) {
            var filterComp, imageComp, svgAttributes, defsAttributes, imageAttributes, svgStyle, filterOverrides;
            var effectName = this.getValidEffectName();
            var filterId = effectName && effectName + '-' + this.props.id;
            var altText = _.get(this, 'props.imageData.alt', '');

            if (readyCallback || errorCallback) {
                this.assignLoadEvents(readyCallback, errorCallback, imageTransformObject.uri);
            }

            imageAttributes = this.getImageAttributes(imageTransformObject, filterId, altText);
            imageComp = React.createElement('img', imageAttributes);

            if (effectName) {
                filterOverrides = {staticMediaUrl: this.props.staticMediaUrl};
                svgStyle = this.getSvgStyle(imageAttributes);
                svgAttributes = this.getSvgAttributes(svgStyle, filterId);
                defsAttributes = this.getSvgDefsAttributes(effectName, filterId, filterOverrides);
                filterComp = React.createElement('svg', svgAttributes, React.createElement('defs', defsAttributes));
                return [imageComp, filterComp];
            }

            return imageComp;
        }
    };
});
