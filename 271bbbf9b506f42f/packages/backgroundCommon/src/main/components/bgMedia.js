define([
    'lodash',
    'react',
    'core',
    'santaProps',
    'imageClientApi',
    'image',
    'backgroundCommon/components/bgImage',
    'backgroundCommon/components/bgVideo',
    'utils'
], function (_, React, /** core */ core, santaProps, imageClientApi, image, bgImage, bgVideo, utils) {
    'use strict';
    var mixins = core.compMixins;
    var containerUtils = utils.containerBackgroundUtils;
    var balataConsts = utils.balataConsts;
    var fittingTypes = imageClientApi.fittingTypes;
    var CSS_BG_FITTING_TYPES = [fittingTypes.TILE];
    var IMAGE_BG_PARAMS = {
        comp: 'wysiwyg.viewer.components.background.bgImage',
        skin: 'skins.viewer.bgImage.bgImageSkin',
        style: 'bgImage',
        ref: balataConsts.IMAGE,
        'data-type': balataConsts.BG_IMAGE
    };
    var IMAGE_PARAMS = {
        comp: 'core.components.Image',
        skin: 'skins.core.ImageNewSkinZoomable',
        style: 'bgImage',
        ref: balataConsts.IMAGE,
        'data-type': balataConsts.IMAGE
    };
    var VIDEO_PARAMS = {
        comp: 'wysiwyg.viewer.components.background.bgVideo',
        skin: 'skins.viewer.bgVideo.bgVideoSkin',
        style: 'bgVideo',
        ref: balataConsts.VIDEO
    };

    function getParamsByFittingType(fittingType) {
        return _.includes(CSS_BG_FITTING_TYPES, fittingType) ? IMAGE_BG_PARAMS : IMAGE_PARAMS;
    }

    function getPropsByMediaType(structureComponentId, data, compType, effectName) {
        var props = {};
        if (compType === IMAGE_BG_PARAMS.comp) {
            props = {
                ref: IMAGE_BG_PARAMS.ref,
                'data-type': IMAGE_BG_PARAMS['data-type']
            };
        } else if (compType === IMAGE_PARAMS.comp) {
            var imageData = (data.mediaRef.type === 'WixVideo') ? data.mediaRef.posterImageRef : data.mediaRef;

            props = {
                ref: IMAGE_PARAMS.ref,
                key: 'img_' + effectName,
                containerWidth: 0,
                containerHeight: 0,
                imageData: imageData,
                displayMode: data.fittingType,
                alignType: data.alignType,
                'data-type': IMAGE_PARAMS['data-type']
            };

        } else if (compType === VIDEO_PARAMS.comp) {
            props = {
                structureComponentId: structureComponentId,
                ref: VIDEO_PARAMS.ref
            };
        }

        return props;
    }

    function getMediaComponentsDescriptors(props, bgData){
        var media = bgData.mediaRef || null;

        var componentsDescriptors = [];

        if (media) {
            var imageParams = getParamsByFittingType(bgData.fittingType);
            var compDescriptor = {
                image: {
                    id: props.id + imageParams.ref,
                    componentType: imageParams.comp,
                    skinPartData: {
                        skin: imageParams.skin,
                        styleId: imageParams.style
                    },
                    compData: bgData.mediaRef
                },
                poster: {
                    id: props.id + imageParams.ref,
                    componentType: imageParams.comp,
                    skinPartData: {
                        skin: imageParams.skin,
                        styleId: imageParams.style
                    },
                    compData: media.posterImageRef
                },
                video: {
                    id: props.id + VIDEO_PARAMS.ref,
                    componentType: VIDEO_PARAMS.comp,
                    skinPartData: {
                        skin: VIDEO_PARAMS.skin,
                        styleId: VIDEO_PARAMS.style
                    },
                    compData: bgData.mediaRef
                }
            };

            if (media.type === 'Image') {
                componentsDescriptors.push(compDescriptor.image);
            } else if (media.type === 'WixVideo') {
                componentsDescriptors.push(compDescriptor.poster);

                if (props.isDesktopDevice && !props.isMobileView) {
                    componentsDescriptors.push(compDescriptor.video);
                }
            }
        }

        return componentsDescriptors;
    }

    function getMediaComponents(props) {
        var bgData = containerUtils.getBgData(props.compDesign, props.compData);

        if (!bgData){
            return null;
        }

        var componentsDescriptors = getMediaComponentsDescriptors(props, bgData);
        var effectName = containerUtils.getBgEffectName(props.behaviors, props.isDesktopDevice, props.isMobileView);

        var mediaComponents = _.map(componentsDescriptors, function (compDescriptor) {
            var extraProps = _.assign({id: compDescriptor.id}, getPropsByMediaType(props.structureComponentId, bgData, compDescriptor.componentType, effectName));
            return this.createChildComponent(compDescriptor.compData, compDescriptor.componentType, compDescriptor.skinPartData, extraProps);
        }, this);

        return (mediaComponents.length === 1) ? _.first(mediaComponents) : mediaComponents;
    }

    /**
     * @class components.bgImage
     * @extends {core.skinBasedComp}
     */
    return {
        displayName: "bgMedia",
        mixins: [mixins.skinBasedComp],
        propTypes: _.assign({
            id: React.PropTypes.string.isRequired,
            rootId: React.PropTypes.string.isRequired,
            structureComponentId: React.PropTypes.string.isRequired,
            compData: React.PropTypes.object,
            compDesign: React.PropTypes.object,
            compProp: React.PropTypes.object.isRequired,
            style: React.PropTypes.object.isRequired,
            renderFixedPositionBackgrounds: santaProps.Types.RenderFlags.renderFixedPositionBackgrounds,
            componentViewMode: santaProps.Types.RenderFlags.componentViewMode.isRequired,
            isDesktopDevice: santaProps.Types.Device.isDesktopDevice.isRequired,
            isMobileView: santaProps.Types.isMobileView.isRequired,
            behaviors: React.PropTypes.array
        },
            santaProps.santaTypesUtils.getSantaTypesByDefinition(image),
            santaProps.santaTypesUtils.getSantaTypesByDefinition(bgImage),
            santaProps.santaTypesUtils.getSantaTypesByDefinition(bgVideo)),
        statics: {
            useSantaTypes: true
        },
        getSkinProperties: function () {
            var effectName = this.props.compProp.effectName;
            var position = containerUtils.getPositionByEffect(effectName, this.props.renderFixedPositionBackgrounds);
            var data = containerUtils.getBgData(this.props.compDesign, this.props.compData);
            var mediaStyle = _.assign({}, this.props.style, {
                position: position,
                pointerEvents: 'none',
                top: 0
            });

            var transformDataAttrs = _.mapKeys(_.get(data, 'mediaTransforms'), function(value, key){
                return 'data-' + key;
            });

            return {
                '': _.assign({
                    //Replace the background div when moving between editor and preview (instead of clearing animations)
                    key: 'media_' + this.props.componentViewMode,
                    children: getMediaComponents.call(this, this.props),
                    style: mediaStyle,

                    /**
                     * For QA Automation
                     * https://jira.wixpress.com/browse/SE-11582
                     * https://jira.wixpress.com/browse/SE-15126
                     * https://jira.wixpress.com/browse/CLNT-6534
                     */
                    'data-effect': effectName || 'none',
                    'data-fitting': data.fittingType,
                    'data-align': data.alignType
                }, transformDataAttrs)
            };
        },


        getDefaultSkinName: function () {
            return 'skins.viewer.balata.bgMediaSkin';
        }
    };
});
