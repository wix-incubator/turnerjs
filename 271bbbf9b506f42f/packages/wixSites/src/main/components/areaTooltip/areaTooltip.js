/**
 * Implementation of a functional copy of the existing AreaTooltip viewer component.
 * Represents a tooltip that is shown for a certain area when the mouse enters the area.
 * @see layout/specificComponents/areaTooltipLayout
 * @author yevhenp (Yevhen Pavliuk)
 */
define(['core', 'utils'], function (core, utils) {
    'use strict';
    var privateMethods = {
        showTooltip: function () {
            this.setState({isTooltipShown: true});
            this.registerReLayout();
        },
        hideTooltip: function () {
            this.setState({isTooltipShown: false});
        }
    };

    return {
        displayName: 'AreaTooltip',
        mixins: [core.compMixins.skinBasedComp],
        getSkinProperties: function () {
            var tooltipPositionClassName;
            tooltipPositionClassName = utils.cssUtils.concatenateStyleIdToClassName(
                this.props.styleId, this.props.compProp.tooltipPosition);
            return {
                arrow: {
                    className: tooltipPositionClassName
                },
                content: {
                    className: this.props.compProp.tooltipPosition === 'left' ? tooltipPositionClassName : '',
                    children: this.props.compData.tooltipText
                },
                tooltip: {
                    style: {
                        display: this.state.isTooltipShown ? 'block' : 'none'
                    }
                },
                tooltipArea: {
                    onMouseOver: privateMethods.showTooltip.bind(this),
                    onMouseOut: privateMethods.hideTooltip.bind(this)
                }
            };
        },
        getInitialState: function () {
            return {
                isTooltipShown: false
            };
        }
    };
});
