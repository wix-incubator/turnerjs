/**
 روح بلط البحر
 */

define([
    'react',
    'lodash',
    'santaProps',
    'core',
    'utils',
    'backgroundCommon'
], function (React, _, santaProps, /** core */ core, utils, backgroundCommon) {
    'use strict';

    var mixins = core.compMixins;
    var containerUtils = utils.containerBackgroundUtils;
    var balataConsts = utils.balataConsts;

    var MEDIA_PARAMS = {
        comp: 'wysiwyg.viewer.components.background.bgMedia',
        skin: 'skins.viewer.bgMedia.bgMediaSkin',
        style: 'bgMedia',
        ref: balataConsts.MEDIA
    };
    var OVERLAY_PARAMS = {
        comp: 'wysiwyg.viewer.components.background.bgOverlay',
        skin: 'skins.viewer.bgOverlay.bgOverlaySkin',
        style: 'bgOverlay',
        ref: balataConsts.OVERLAY
    };
    var COLOR_BG_PARAMS = {
        comp: 'wysiwyg.viewer.components.background.bgOverlay',
        skin: 'skins.viewer.bgOverlay.bgOverlaySkin',
        style: 'bgColor',
        ref: balataConsts.BG_COLOR
    };


    /**
     * Create extra style info based on component transformations object
     * @param {'overlay'|'media'|'underlay'} layerName balata layer
     * @param {object} data BackgroundMedia item
     * @param {object} state this.state
     * @returns {{}}
     */
    function getLayerCssTransforms(layerName, data, state) {
        var transformsData = data[balataConsts[layerName]] || {};
        var transformsState = _.get(state, ['transforms', layerName], {});
        var transforms = _.merge({}, transformsData, transformsState);

        var style = {};
        if (transforms.opacity) {
            style.opacity = transforms.opacity;
            transforms = _.omit(transforms, 'opacity');
        }
        if (!_.isEmpty(transforms)) {
            style.transform = _.reduce(transforms, function (transform, value, key) {
                transform += key + '(' + value + ') ';
                return transform;
            }, '');
        }

        return style;
    }

    /**
     * Create a bgMedia component with current data
     * @param {object} props this.props
     * @param {object} state this.state
     * @param {string?} effectName an optional scroll effect name
     * @returns {ReactCompositeComponent}
     */
    function getMediaComponent(props, state, data, effectName) {
        var compDescriptor = {
            id: props.id + MEDIA_PARAMS.ref,
            componentType: MEDIA_PARAMS.comp,
            skinPartData: {
                skin: MEDIA_PARAMS.skin,
                styleId: MEDIA_PARAMS.style
            }
        };

        var extraProps = {
            style: getLayerCssTransforms(balataConsts.MEDIA, data, state)
        };

        if (props.compDesign) {
            extraProps.compDesign = props.compDesign;
        } else {
            extraProps.compData = props.compData;
        }

        _.assign(extraProps, {
            id: compDescriptor.id,
            structureComponentId: props.structureComponentId,
            ref: MEDIA_PARAMS.ref,
            compProp: {effectName: effectName}
        });

        return this.createChildComponent(null, compDescriptor.componentType, compDescriptor.skinPartData, extraProps);
    }

    /**
     * Create a bgOverlay component type overlay
     * @param {object} props this.props
     * @param {object} state this.state
     * @param {object} data BackgroundMedia data item
     * @param {string?} effectName an optional scroll effect name
     * @returns {ReactCompositeComponent}
     */
    function getOverlayComponent(props, state, data, effectName) {
        var compDescriptor = {
            id: props.id + OVERLAY_PARAMS.ref,
            componentType: OVERLAY_PARAMS.comp,
            skinPartData: {
                skin: OVERLAY_PARAMS.skin,
                styleId: OVERLAY_PARAMS.style
            }
        };

        var extraProps = {
            style: getLayerCssTransforms(balataConsts.OVERLAY, data, state),
            compProp: {
                colorOverlay: data.colorOverlay,
                colorOverlayOpacity: data.colorOverlayOpacity,
                imageOverlay: data.imageOverlay,
                effectName: effectName

            },
            id: compDescriptor.id,
            ref: OVERLAY_PARAMS.ref
        };

        return this.createChildComponent(null, compDescriptor.componentType, compDescriptor.skinPartData, extraProps);
    }

    /**
     * Create a bgOverlay component type underlay
     * @param {object} props this.props
     * @param {object} state this.state
     * @param {object} data BackgroundMedia data item
     * @param {string?} effectName an optional scroll effect name
     * @returns {ReactCompositeComponent}
     */
    function getUnderlayComponent(props, state, data, effectName) {
        var compDescriptor = {
            id: props.id + COLOR_BG_PARAMS.ref,
            componentType: COLOR_BG_PARAMS.comp,
            skinPartData: {
                skin: COLOR_BG_PARAMS.skin,
                styleId: COLOR_BG_PARAMS.style
            }
        };

        var extraProps = {
            style: getLayerCssTransforms(balataConsts.UNDERLAY, data, state),
            compProp: {
                colorOverlay: data.color,
                colorOverlayOpacity: data.colorOpacity,
                effectName: effectName
            },
            id: compDescriptor.id,
            ref: COLOR_BG_PARAMS.ref
        };

        return this.createChildComponent(null, compDescriptor.componentType, compDescriptor.skinPartData, extraProps);
    }

    /**
     * TODO: "showOverlayForMediaType" is a temp solution for old garbage overlay data on images, till we have a new bg overlay product
     * TODO: See https://jira.wixpress.com/browse/CLNT-7518
     * @param data
     * @returns {boolean}
     */
    function shouldRenderOverlay(data){
        var media = data.mediaRef;
        var hasOverlay = data.imageOverlay || data.colorOverlay;
        var showOverlayForMediaType = data.showOverlayForMediaType || 'WixVideo';
        var shouldRender = media && (showOverlayForMediaType === 'all' || showOverlayForMediaType === media.type);

        return !!(hasOverlay && shouldRender);
    }

    function getBgData(props){
        return containerUtils.getBgData(props.compDesign, props.compData);
    }
    /**
     * Get the internal components
     * @param {object} props this.props
     * @param {object} state this.state
     * @returns {Array<ReactCompositeComponent>}
     */
    function getBalataLayers(props, state) {
        var data = getBgData(props);

        if (_.isEmpty(data)) {
            return null;
        }

        var effectName = containerUtils.getBgEffectName(props.behaviors, props.isDesktopDevice, props.isMobileView);

        var backgroundStructure = [];

        backgroundStructure.push(getUnderlayComponent.call(this, props, state, data, effectName));

        if (!_.isEmpty(data.mediaRef)){
            backgroundStructure.push(getMediaComponent.call(this, props, state, data, effectName));
        }

        if (shouldRenderOverlay(data)) {
            backgroundStructure.push(getOverlayComponent.call(this, props, state, data, effectName));
        }

        return backgroundStructure;
    }

    /**
     * ---------------------------------------------------------------------------------------
     */

    return {
        displayName: 'Balata',
        mixins: [mixins.skinBasedComp, backgroundCommon.mixins.backgroundDetectionMixin],
        propTypes: _.assign({
            id: React.PropTypes.string.isRequired,
            rootId: React.PropTypes.string.isRequired,
            structureComponentId: React.PropTypes.string.isRequired,
            compData: React.PropTypes.object,
            compDesign: React.PropTypes.object,
            style: React.PropTypes.object,
            behaviors: React.PropTypes.array,
            onClick: React.PropTypes.func,
            isDesktopDevice: santaProps.Types.Device.isDesktopDevice.isRequired,
            isMobileView: santaProps.Types.isMobileView.isRequired,
            designDataChangeAspect: santaProps.Types.SiteAspects.designDataChangeAspect.isRequired
        }, santaProps.santaTypesUtils.getSantaTypesByDefinition(backgroundCommon.components.bgMedia), santaProps.santaTypesUtils.getSantaTypesByDefinition(backgroundCommon.components.bgOverlay)),
        statics: {
            useSantaTypes: true
        },
        getInitialState: function () {
            return {
                transforms: {}
            };
        },
        componentWillReceiveProps: function (nextProps) {
            var nextBgData = getBgData(nextProps);
            var prevBgData = getBgData(this.props);
            // clear state
            this.setState({
                transforms: {}
            });
            // detect design data change (which will change the state if needed)
            if (prevBgData.id !== nextBgData.id) {
                var bgAspect = this.props.designDataChangeAspect;
                bgAspect.notify(this.props.structureComponentId, this.props.compDesign, nextProps.compDesign);
            }
        },

        getSkinProperties: function () {
            var backgroundChildren = getBalataLayers.call(this, this.props, this.state);
            var style = _.assign({
                position: 'absolute',
                top: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none'
            }, this.props.style);

            return {
                '': {
                    style: style,
                    children: backgroundChildren,
                    onClick: this.props.onClick,
                    key: 'balata_' + containerUtils.getBgEffectName(this.props.behaviors, this.props.isDesktopDevice, this.props.isMobileView)
                }
            };
        },

        getDefaultSkinName: function () {
            return 'skins.viewer.balata.balataBaseSkin';
        }
    };
});
