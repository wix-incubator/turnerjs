/**
 * @author andreys (Andrew Shustariov)
 */
define(['lodash', 'santaProps', 'react', 'core', 'utils', 'image'], function (_, santaProps, React, /** core */core, utils, image) {
    'use strict';

    var mixins = core.compMixins;
    var linkRenderer = utils.linkRenderer;

    /**
     * @class components.DocumentMedia
     * @extends {core.skinBasedComp}
     * @property {comp.properties} props
     */
    return {
        displayName: 'DocumentMedia',
        mixins: [mixins.skinBasedComp, mixins.skinInfo],
        propTypes: _.assign({
            compData: santaProps.Types.Component.compData.isRequired,
            compProp: santaProps.Types.Component.compProp.isRequired,
            style: santaProps.Types.Component.style.isRequired,
            linkRenderInfo: santaProps.Types.Link.linkRenderInfo.isRequired,
            rootNavigationInfo: santaProps.Types.Component.rootNavigationInfo.isRequired
        }, santaProps.santaTypesUtils.getSantaTypesByDefinition(image)),
        statics: {
            useSantaTypes: true
        },
        getSkinProperties: function () {
            var compData = this.props.compData;
            var compProp = this.props.compProp;
            var linkData = compData.link ? linkRenderer.renderLink(compData.link, this.props.linkRenderInfo, this.props.rootNavigationInfo) : {};
            var skinParams = this.getParams(['contentPaddingLeft', 'contentPaddingRight', 'contentPaddingTop']);

            var wrapperProps = {title: compData.title};
            // adding content-padding to node, so that it'll be accessible from layout
            wrapperProps['data-content-padding-left'] = parseInt(skinParams.contentPaddingLeft.value, 10);
            wrapperProps['data-content-padding-right'] = parseInt(skinParams.contentPaddingRight.value, 10);
            wrapperProps['data-content-padding-top'] = parseInt(skinParams.contentPaddingTop.value, 10);
            wrapperProps['data-content-image-height'] = parseInt(this.props.style.height, 10);

            return {
                '': wrapperProps,
                'img': this.createChildComponent(
                    compData,
                    'core.components.Image',
                    'img',
                    {
                        displayName: 'Image',
                        id: this.props.id + 'img',
                        ref: 'img',
                        imageData: compData,
                        containerWidth: this.props.style.width,
                        containerHeight: this.props.style.height,
                        displayMode: 'full',
                        usePreloader: true
                    }),
                'link': _.assign(linkData, {
                    target: '_blank'
                }),
                'label': {
                    parentConst: React.DOM.span,
                    children: compData.title,
                    className: this.classSet({hidden: !compProp.showTitle || _.isEmpty(compData.title)})
                }
            };
        }
    };
});
