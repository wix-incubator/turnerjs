define(['lodash', 'react', 'core', 'utils'], function (_, React, /** core */ core, utils) {
    'use strict';
    var mixins = core.compMixins;

    /**
     * @class components.bgImage
     * @extends {core.skinBasedComp}
     */
    return {
        displayName: "bgImage",
        mixins: [mixins.skinBasedComp],
        propTypes: {
            compData: React.PropTypes.object.isRequired,
            'data-type': React.PropTypes.string.isRequired
        },
        statics: {
            useSantaTypes: true
        },
        getSkinProperties: function () {
            var outerStyle = {
                width: '100%'
            };

            var innerStyle = {
                position: 'absolute',
                width: '100%'
            };

            if (_.isNumber(this.props.compData.opacity)) {
                innerStyle.opacity = this.props.compData.opacity;
            }

            var style = {
                '': {
                    'style': outerStyle
                }
            };

            style[utils.balataConsts.IMAGE] = {
                'style': innerStyle,
                'data-type': this.props['data-type']
            };

            return style;
        }
    };
});
