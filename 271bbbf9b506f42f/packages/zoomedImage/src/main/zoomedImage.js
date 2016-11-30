define(['lodash', 'react', 'reactDOM', 'utils', 'core', 'santaProps', 'imageCommon'], function (_, React, ReactDOM, utils, core, santaProps, imageCommon) {
    'use strict';

    var mixins = core.compMixins;
    var imageElementFactoryMixin = imageCommon.imageElementFactoryMixin;
    var DURATION = 0.2;

    return {
        mixins: [mixins.skinBasedComp, mixins.animationsMixin, imageElementFactoryMixin],
        displayName: 'ZoomedImage',
        propTypes: {
            browser: santaProps.Types.Browser.browser,
            currentUrl: santaProps.Types.currentUrl,
            getMediaFullStaticUrl: santaProps.Types.ServiceTopology.getMediaFullStaticUrl,
            devicePixelRatio: santaProps.Types.Device.devicePixelRatio,
            containerWidth: React.PropTypes.number.isRequired,
            containerHeight: React.PropTypes.number.isRequired,
            imageData: React.PropTypes.object.isRequired,
            displayMode: React.PropTypes.string,
            effectName: React.PropTypes.string,
            initialClickPosition: React.PropTypes.object,
            style: React.PropTypes.object
        },

        statics: {
            useSantaTypes: true
        },

        shouldZoom: true,
        shouldDrag: false,
        sequenceId: '',
        animatableElement: 'image',

        getInitialState: function () {
            var browser = this.props.browser;
            this.cssFiltersSupported = !(browser.ie || browser.edge);
            return {};
        },

        hasEffect: function(){
            return (this.props.effectName && this.props.effectName !== 'none');
        },

        getTargetPosition: function (event) {
            this.clientRect = this.clientRect || utils.domMeasurements.getBoundingRect(ReactDOM.findDOMNode(this));

            var containerSize = {height: this.props.containerHeight, width: this.props.containerWidth};
            var mouseX = event.clientX - this.clientRect.left;
            var mouseY = event.clientY - this.clientRect.top;
            return {
                x: -(this.props.imageData.width - containerSize.width) * (mouseX / containerSize.width),
                y: -(this.props.imageData.height - containerSize.height) * (mouseY / containerSize.height)
            };
        },

        zoomOut: function (callback) {
            this.stopSequence(this.sequenceId);
            callback();
        },

        zoomIn: function () {
            this.shouldDrag = this.shouldZoom;
            var targetPosition = this.getTargetPosition(this.props.initialClickPosition);
            this.animate(this.animatableElement, 'BasePosition', 0, 0, {to: {
                x: -(this.props.imageData.width / 2 - this.props.containerWidth / 2),
                y: -(this.props.imageData.height / 2 - this.props.containerHeight / 2)
            }});
            this.sequenceId = this.animate(this.animatableElement, 'BasePosition', DURATION, 0, {to: targetPosition});
        },

        drag: function (event) {
            if (this.shouldDrag) {
                var targetPosition = this.getTargetPosition(event);
                this.animate(this.animatableElement, 'BasePosition', 0.5, 0, {to: targetPosition});
            }
        },

        getDefaultSkinName: function () {
            return 'skins.core.ImageNewSkinZoomable';
        },

        getSkinProperties: function () {
            var imageComponents, imageComputedProperties;
            var imageInfo = {
                containerWidth: this.props.imageData.width,
                containerHeight: this.props.imageData.height,
                imageData: this.props.imageData,
                displayMode: this.props.displayMode
            };

            // For IE/Edge
            if (this.hasEffect() && !this.cssFiltersSupported) {
                this.animatableElement = 'svg';
                imageComputedProperties = utils.imageUtils.getImageComputedProperties(imageInfo, this.props.getMediaFullStaticUrl, this.props.currentUrl, this.props.devicePixelRatio, 'svg');
                imageComponents = this.getSvgOnlyImageComponent(imageComputedProperties, this.zoomIn);

            } else {
                imageComputedProperties = utils.imageUtils.getImageComputedProperties(imageInfo, this.props.getMediaFullStaticUrl, this.props.currentUrl, this.props.devicePixelRatio, 'img');

                // Override a Webkit bug where filter not applied on image in 3d context
                // TODO: open a bug in webkit
                _.set(imageComputedProperties, 'css.img.outline', '1px solid transparent');

                imageComponents = this.getImageComponents(imageComputedProperties, this.zoomIn);
            }

            var containerStyle = _.assign({
                width: this.props.containerWidth,
                height: this.props.containerHeight,
                WebkitTransform: 'translateZ(0)',
                transform: 'translateZ(0)'
            }, imageComputedProperties.css.container);

            return {
                '': {
                    style: containerStyle,
                    onMouseMove: this.drag,
                    addChildren: imageComponents,
                    'data-image-zoomed': true
                }
            };
        }
    };
});
