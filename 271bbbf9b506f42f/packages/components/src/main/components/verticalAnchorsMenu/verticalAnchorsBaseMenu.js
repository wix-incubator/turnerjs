define(['lodash',
    'react',
    'core',
    'components/components/verticalAnchorsMenu/verticalAnchorsMenuItem'], function (_, React, /** core */ core, verticalAnchorsMenuItem) {
    'use strict';

    var mixins = core.compMixins;

    /**
     * @class components.VerticalAnchorsBaseMenu
     * @extends {core.skinBasedComp}
     */
    return {
        displayName: 'VerticalAnchorsBaseMenu',
        mixins: [mixins.skinBasedComp, mixins.skinInfo],

        getDefaultProps: function () {
            return {
                svgShapeName: 'circle'
            };
        },

        getMenuButtons: function (menuItems) { //eslint-disable-line react/display-name

            return _.map(menuItems, function (anchorData) {
                var isActive = this.props.isSelectedFn(anchorData.id);

                var buttonProps = {
                    key: anchorData.id,
                    isTablet: this.props.isTablet,
                    styleId: this.props.styleId,
                    svgShapeName: this.props.svgShapeName,
                    anchorData: anchorData,
                    isActive: isActive,
                    siteData: this.props.siteData,
                    rootNavigationInfo: this.props.rootNavigationInfo,
                    skinExports: this.getSkinExports()
                };

                if (this.props.compProp.autoColor && _.get(this, 'props.structure.layout.fixedPosition')) {
                    var backgroundBrightness = _.get(this, 'props.overlappingBackgroundElementInfo.brightness');
                    var skinParams = this.getParams(['symbolAndTextColor', 'selectedColor']);
                    var mainColor = skinParams.symbolAndTextColor.value;
                    var selectedColor = skinParams.selectedColor.value;
                    var mainColorBrightness = mainColor.values.hsv[2];
                    var selectedColorBrightness = selectedColor.values.hsv[2];

                    buttonProps.colorBrightness = isActive ? selectedColorBrightness : mainColorBrightness;
                    buttonProps.hoveredOrSelectedColorBrightness = selectedColorBrightness;
                    buttonProps.backgroundBrightness = backgroundBrightness;
                }

                return React.createElement(verticalAnchorsMenuItem, buttonProps);
            }, this);
        },

        addConnectingLinesIfNeeded: function(menuItems) {
            if (!this.getSkinExports() || this.getSkinExports().hasConnectingLines !== true) {
                return menuItems;
            }
            var itemsAndLines = [];
            _.forEach(menuItems, function(item) {
                itemsAndLines.push(React.DOM.div({className: this.props.styleId + '_line'}));
                itemsAndLines.push(item);
            }, this);
            return _.rest(itemsAndLines);
        },

        getMenuClasses: function () {
            var styleId = this.props.styleId;
            var menuClasses = [];
            menuClasses.push(styleId + '_orientation-' + this.props.compProp.orientation);
            menuClasses.push(styleId + '_text-align-' + this.props.compProp.itemsAlignment);

            return menuClasses.join(' ');
        },

        getSkinProperties: function () {
            var menuItems = this.getMenuButtons(this.props.menuItems);
            menuItems = this.addConnectingLinesIfNeeded(menuItems);

            return {
                menuContainer: {
                    className: this.getMenuClasses(),
                    children: menuItems
                }
            };
        }
    };
});
