define(['lodash', 'core', 'linkBar/linkBarItem/linkBarItem', 'santaProps'], function (_, /** core */ core, linkBarItem, santaProps) {
    'use strict';

    var mixins = core.compMixins;
    var ORIENTATION = {
        'HORIZ': 'HORIZ',
        'VERTICAL': 'VERTICAL'
    };

    function calculateMobileDimensions(numOfItems, iconSize, spacing, isHorizontal, totalItemSize) {
        if (numOfItems === 0) {
            return {
                width: 5,
                height: iconSize
            };
        }
        var width, height, itemsInLine;

        var itemSize = iconSize + spacing;
        if (isHorizontal) {
            width = Math.min(totalItemSize, 300);
            itemsInLine = Math.floor((width + spacing) / itemSize);
            height = Math.ceil(numOfItems / itemsInLine) * iconSize;
        } else {
            width = iconSize;
            height = totalItemSize;
        }

        return {
            width: width,
            height: height
        };
    }

    function getChildStyle(props) {
        var spacing = props.compProp.spacing;
        var isHorizontal = props.compProp.orientation === ORIENTATION.HORIZ;
        var marginRight = 0;
        var marginBottom = 0;
        var display = 'block';

        if (isHorizontal) {
            marginRight = spacing;
            display = 'inline-block';
        } else {
            marginBottom = spacing;
        }

        return {
            display: display,
            marginRight: marginRight,
            marginBottom: marginBottom
        };
    }

    function getLinkBarSize(props) {
        var numOfItems = props.compData.items.length;
        var iconSize = props.compProp.iconSize;
        var spacing = props.compProp.spacing;
        var totalItemSize = numOfItems * (iconSize + spacing) - spacing;
        var isHorizontal = props.compProp.orientation === ORIENTATION.HORIZ;

        if (props.isMobileView) {
            return calculateMobileDimensions(numOfItems, iconSize, spacing, isHorizontal, totalItemSize);
        }

        if (numOfItems === 0) { return undefined; }

        return {
            width: isHorizontal ? totalItemSize : iconSize,
            height: isHorizontal ? iconSize : totalItemSize
        };
    }

    /**
     * @class components.LinkBar
     * @extends {core.skinBasedComp}
     */
    return {
        displayName: 'LinkBar',
        mixins: [mixins.skinBasedComp],

        propTypes: _.assign({
            compData: santaProps.Types.Component.compData.isRequired,
            isMobileView: santaProps.Types.isMobileView,
            compProp: santaProps.Types.Component.compProp.isRequired
        }, santaProps.santaTypesUtils.getSantaTypesByDefinition(linkBarItem)),

        statics: {
            useSantaTypes: true
        },

        getInitialState: function () {
            var state = {};
            if (this.props.isMobileView) {
                state.$mobile = 'mobileView';
            }
            return state;
        },

        getSkinProperties: function () {
            var compData = this.props.compData;

            var childComps = _.map(compData.items, function (item) {
                return this.createChildComponent(item, 'wysiwyg.viewer.components.LinkBarItem', 'imageItem', {
                    itemStyle: getChildStyle(this.props)
                });
            }, this);

            return {
                itemsContainer: {
                    children: childComps
                },
                '': {
                    style: getLinkBarSize(this.props)
                }
            };
        }
    };
});
