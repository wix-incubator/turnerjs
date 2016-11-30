define(['lodash', 'react', 'core', 'santaProps', 'buttonCommon', 'coreUtils', 'utils', 'experiment'], function (_, React, /** core */ core, santaProps, buttonCommon, coreUtils, utils, experiment) {
    'use strict';

    var linkRenderer = utils.linkRenderer;
    var anchorTagsGenerator = coreUtils.anchorTagsGenerator;

    /**
     * @class components.siteButton
     * @extends {core.skinBasedComp}
     */

    return {
        displayName: "SiteButton",
        mixins: [core.compMixins.skinBasedComp, buttonCommon.buttonMixin],

        propTypes: {
            compData: santaProps.Types.Component.compData,
            isMobileDevice: santaProps.Types.Device.isMobileDevice,
            isMobileView: santaProps.Types.isMobileView,
            linkRenderInfo: santaProps.Types.Link.linkRenderInfo,
            rootNavigationInfo: santaProps.Types.Component.rootNavigationInfo
        },

        statics: {
            useSantaTypes: true
        },

        getDefaultProps: function() {
            return {
                shouldUseFlex: true
            };
        },

        getInitialState: function () {
            return {
                $mobile: this.props.isMobileDevice ? 'mobile' : 'desktop',
                $shouldUseFlex: this.props.shouldUseFlex ? 'shouldUseFlex' : '',
                $align: this.props.compProp.align
            };
        },

        componentWillReceiveProps: function(nextProps) {
            this.setState({
                $align: nextProps.compProp.align
            });
        },

        getImpliedLink: function () {
            if (this.props.noAutoLinkGeneration){
                return;
            }

            var includedPatterns = anchorTagsGenerator.getIncludedPatterns(experiment, this.props.isMobileView);
            return _.first(anchorTagsGenerator.findDataForAnchors(this.props.compData.label, includedPatterns));
        },

        getLinkSkinPart: function () {
            var compData = this.props.compData;
            var compProps = this.props.compProp;
            var noLink = {parentConst: React.DOM.div};

            if (compProps.isDisabled) {
                return noLink;
            }

            if (compData.link) {
                return linkRenderer.renderLink(compData.link, this.props.linkRenderInfo, this.props.rootNavigationInfo);
            }

            return this.getImpliedLink() || noLink;
        },

        getSkinProperties: function () {
            this.lastScale = _.get(this, 'props.structure.layout.scale') || 1;
            var compData = this.props.compData;
            var compProps = this.props.compProp;
            var isDisabled = !!compProps.isDisabled;

            var linkSkinPart = this.getLinkSkinPart();
            linkSkinPart.style = {};
            if (!this.props.shouldUseFlex) {
                linkSkinPart.style.textAlign = compProps.align;
            }

            var skinProps = {
                "": {
                    id: this.props.id,
                    key: 'f' + (this.getDesktopFontSize(this.props) * this.currentScale),
                    ref: this.props.id,
                    "data-align": compProps.align,
                    "data-disabled": isDisabled,
                    "data-margin": compProps.margin,
                    "data-should-use-flex": this.props.shouldUseFlex
                },
                "label": {
                    children: [compData.label],
                    style: this.getLabelStyle()
                },
                "link": linkSkinPart
            };

            if (this.props.onClick && !isDisabled) {
                skinProps[''].onClick = this.props.onClick;
            }

            this.resetMinHeightIfNeeded(skinProps);
            return skinProps;
        }
    };
});
