define(['lodash', 'core', 'utils', 'santaProps', 'react', 'image'],
    function (_, /** core */ core, utils, santaProps, React, image) {
    'use strict';

    var mixins = core.compMixins;
    var linkRenderer = utils.linkRenderer;

    /**
     * @class components.LinkBarItem
     * @extends {core.skinBasedComp}
     * @extends {utils.linkRenderer}
     */
    return {
        displayName: "LinkBarItem",
        mixins: [mixins.skinBasedComp],

        propTypes: _.assign({
            linkRenderInfo: santaProps.Types.Link.linkRenderInfo.isRequired,
            rootNavigationInfo: santaProps.Types.Component.rootNavigationInfo.isRequired,
            compData: santaProps.Types.Component.compData.isRequired,
            compProp: santaProps.Types.Component.compProp.isRequired,
            style:  React.PropTypes.object,
            id: santaProps.Types.Component.id.isRequired,
            itemStyle: React.PropTypes.object
        }, santaProps.santaTypesUtils.getSantaTypesByDefinition(image)),

        statics: {
            useSantaTypes: true
        },

        getSkinProperties: function () {
            var compData = this.props.compData;
            var compProps = this.props.compProp;
            var refData = {
                link: compData.link ? linkRenderer.renderLink(compData.link, this.props.linkRenderInfo, this.props.rootNavigationInfo) : {style: {cursor: 'default'}},
                image: this.createChildComponent(
                    compData,
                    'core.components.Image',
                    'image', {
                        id: this.props.id + 'image',
                        ref: 'image',
                        imageData: compData,
                        containerWidth: compProps.iconSize,
                        containerHeight: compProps.iconSize,
                        displayMode: "fill",
                        style: _.assign({}, this.props.style, {position: 'absolute'})
                    })
            };
            refData[""] = {
                style: {
                    width: compProps.iconSize,
                    height: compProps.iconSize,
                    marginBottom: this.props.itemStyle.marginBottom,
                    marginRight: this.props.itemStyle.marginRight,
                    display: this.props.itemStyle.display
                }
            };

            return refData;
        }
    };
});
