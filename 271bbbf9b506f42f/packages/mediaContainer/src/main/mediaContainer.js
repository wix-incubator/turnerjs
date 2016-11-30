/**
 * Created by avim on 12/27/15.
 */
define(['react',
    'lodash',
    'core',
    'backgroundCommon',
    'mediaContainer/utils/compDesignUtils',
    'santaProps',
    'balataCommon',
    'experiment'
], function (React,
             _,
             core,
             backgroundCommon,
             compDesignUtils,
             santaProps,
             balataCommon,
             experiment) {
    'use strict';

    function getRootStyle() {
        return this.props.rootStyle || this.props.style;
    }

    /**
     * @class components.MediaContainer
     * @extends {core.skinBasedComp}
     */
    return {
        displayName: 'MediaContainer',
        mixins: [core.compMixins.skinBasedComp, backgroundCommon.mixins.backgroundDetectionMixin],
        getDefaultSkinName: function () {
            return 'wysiwyg.viewer.skins.mediaContainer.DefaultMediaContainer';
        },
        propTypes: _.assign({
            rootStyle: React.PropTypes.object,
            bgStyle: React.PropTypes.object,
            inlineStyle: React.PropTypes.object,
            style: santaProps.Types.Component.style.isRequired,
            compDesign: santaProps.Types.Component.compDesign,
            id: santaProps.Types.Component.id,
            compData: santaProps.Types.Component.compData,
            compActions: santaProps.Types.Component.compActions,
            compStaticBehaviors: santaProps.Types.Component.compStaticBehaviors,
            styleId: santaProps.Types.Component.styleId.isRequired
        }, santaProps.santaTypesUtils.getSantaTypesByDefinition(balataCommon.balata)),
        statics: {
            useSantaTypes: true
        },
        getBackground: function (bgStyle) {
            var skinData = balataCommon.balataDataUtils.createChildBalataSkinData(this.props.styleId);
            var extraProps = balataCommon.balataDataUtils.createChildBalataProps(this.props.id, this.props.compStaticBehaviors, this.props.compDesign, this.props.compActions);

            _.merge(extraProps, {style: bgStyle});

            return this.createChildComponent(
                this.props.compData,
                'wysiwyg.viewer.components.background.Balata',
                skinData,
                extraProps
            );
        },
        getSkinProperties: function () {
            var rootStyle = getRootStyle.call(this);

            var containerStyle = {};
            if (experiment.isOpen('sv_cssDesignData')) {
                var hasCssStyle = _.isObject(_.get(this.props, 'compDesign.cssStyle'));
                if (hasCssStyle){
                    containerStyle = _.assign(
                        compDesignUtils.renderDesign(this.props.compDesign.cssStyle),
                        {
                            overflow: 'hidden',
                            // force a new stacking context to fix a Chrome rendering issue
                            // translateZ(0) should work but sometimes gets removed by the browser(?)
                            // in a very weird fashion :(
                            WebkitFilter: 'blur()'
                        }
                    );
                }
            }

            var bgStyle = this.props.bgStyle || {
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    top: 0,
                    bottom: 0
                };
            var inlineStyle = this.props.inlineStyle || {
                    width: rootStyle.width,
                    position: 'absolute',
                    top: 0,
                    bottom: 0
                };
            var refData = {
                background: this.getBackground(bgStyle),

                container: {
                    style: containerStyle
                },

                inlineContentParent: {
                    style: bgStyle
                },

                inlineContent: {
                    style: inlineStyle,
                    children: this.props.children
                }
            };
            refData[''] = {
                style: rootStyle
            };

            return refData;
        }
    };
});
