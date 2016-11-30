define(['lodash', 'react', 'utils', 'core', 'santaProps', 'imageCommon', 'experiment'], function (_, React, utils, core, santaProps, imageCommon, experiment) {
    'use strict';

    var imageElementFactoryMixin = imageCommon.imageElementFactoryMixin;

    return {
        displayName: 'Image',

        mixins: [core.compMixins.skinBasedComp, imageElementFactoryMixin],

        propTypes: {
            browser: santaProps.Types.Browser.browser.isRequired,
            currentUrl: santaProps.Types.currentUrl,
            onImageUnmount: santaProps.Types.Images.onImageUnmount,
            getMediaFullStaticUrl: santaProps.Types.ServiceTopology.getMediaFullStaticUrl,
            devicePixelRatio: santaProps.Types.Device.devicePixelRatio,
            containerWidth: React.PropTypes.number.isRequired,
            containerHeight: React.PropTypes.number.isRequired,
            imageData: React.PropTypes.object.isRequired,
            style: React.PropTypes.object,
            quality: React.PropTypes.object,
            alignType: React.PropTypes.string,
            opacity: React.PropTypes.number,
            displayMode: React.PropTypes.string,
            effectName: React.PropTypes.string,
            usePreloader: React.PropTypes.bool,
            addItemProp: React.PropTypes.bool,
            imgStyle: React.PropTypes.object,
            'data-gallery-id': React.PropTypes.string,
            'data-page-desc': React.PropTypes.string,
            'data-query': React.PropTypes.string,
            'data-image-index': React.PropTypes.number,
            onMouseEnter: React.PropTypes.func,
            onTouchStart: React.PropTypes.func
        },

        statics: {
            useSantaTypes: true
        },

        getInitialState: function () {
            this.cssFiltersSupported = !(this.props.browser.ie || this.props.browser.edge);
            return {
                showPreloader: false
            };
        },

        componentDidMount: function () {
            this.setInitialPreloaderState();
        },

        componentWillUnmount: function () {
            this.props.onImageUnmount(this.props.id);
        },

        onImageReady: function () {
            if (this.state.showPreloader && this.isMounted()) {
                this.setState({showPreloader: false});
            }
        },

        setInitialPreloaderState: function () {
            var loadComplete = this.imageForLoadEvents && this.imageForLoadEvents.complete; //From imageElementFactoryMixin
            if (this.props.usePreloader && !loadComplete) {
                this.setState({showPreloader: !loadComplete}); //eslint-disable-line react/no-did-mount-set-state
            }
        },

        hasEffect: function(){
            return (this.props.effectName && this.props.effectName !== 'none');
        },

        getDefaultStyles: function (style) {
            return _.pick(style, function (value) {
                return value !== '';
            });
        },

        getContainerStyle: function(imageComputedProperties){
            var styleWithoutDefaults = this.getDefaultStyles(this.props.style);
            var containerCss = imageComputedProperties.css.container;

            var containerStyle = _.assign({
                position: 'absolute',
                width: this.props.containerWidth,
                height: this.props.containerHeight
            }, containerCss, styleWithoutDefaults);

            if (this.hasEffect()){
                containerStyle.WebkitTransform = 'translateZ(0)';
                containerStyle.transform = 'translateZ(0)';
            }
            if (_.isNumber(this.props.imageData.opacity)) {
                containerStyle.opacity = this.props.imageData.opacity;
            }

            return containerStyle;
        },

        onImageMouseEnter: function() {
            if (typeof this.props.onMouseEnter === 'function') {
                this.props.onMouseEnter(this.props.id);
            }
        },

        onImageTouchStart: function () {
            if (typeof this.props.onTouchStart === 'function') {
                this.props.onTouchStart(this.props.id);
            }
        },

        getSkinProperties: function () {
            var imageComponents;
            var imageComputedProperties;

            var imageInfo = _.pick(this.props, ['imageData', 'containerWidth', 'containerHeight', 'fittingType', 'alignType', 'quality', 'displayMode', 'addItemProp']);

            // For IE/Edge
            if (this.hasEffect() && !this.cssFiltersSupported) {
                imageComputedProperties = utils.imageUtils.getImageComputedProperties(imageInfo, this.props.getMediaFullStaticUrl, this.props.currentUrl, this.props.devicePixelRatio, 'svg');
                imageComponents = this.getSvgOnlyImageComponent(imageComputedProperties, this.onImageReady, this.onImageReady);
            } else {
                imageComputedProperties = utils.imageUtils.getImageComputedProperties(imageInfo, this.props.getMediaFullStaticUrl, this.props.currentUrl, this.props.devicePixelRatio, 'img');
                imageComponents = this.getImageComponents(imageComputedProperties, this.onImageReady, this.onImageReady);
            }

            var containerStyle = this.getContainerStyle(imageComputedProperties);
            var preloaderClassName = (this.state.showPreloader && !experiment.isOpen('removeImagePreloader')) ? 'circle-preloader white' : '';

            return {
                '': _.defaults({
                        style: containerStyle,
                        addChildren: imageComponents
                    },
                    {
                        onMouseEnter: this.onImageMouseEnter,
                        onTouchStart: this.onImageTouchStart
                    },
                    this.props
                ),
                preloader: {
                    className: preloaderClassName
                }
            };
        },

        getDefaultSkinName: function () {
            return 'skins.core.ImageNewSkinZoomable';
        }
    };
});
