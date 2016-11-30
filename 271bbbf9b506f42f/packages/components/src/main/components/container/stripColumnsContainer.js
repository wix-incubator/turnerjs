/**
 * Created by avim on 12/27/15.
 */
define(['react',
        'lodash',
        'core',
        'balataCommon',
        'backgroundCommon'],
    function (React,
              _,
              core,
              balataCommon,
              backgroundCommon) {
    'use strict';
    var mixins = core.compMixins;

    function getColumnsWeights() {
        var columnsTotalWidth = _.sum(React.Children.map(this.props.children, function (child) {
            return child.props.structure.layout.width;
        }));

        var widths = React.Children.map(this.props.children, function (child) {
            // Math.round to stabilize weights and prevent flickering of pixels between renders.
            return Math.round(child.props.structure.layout.width / columnsTotalWidth * 100) / 100.0;
        });

        var sum = _.sum(widths);
        widths[0] += 1 - sum;

        return widths;
    }

    function getMobileSkinProperties() {
        var accumY = this.props.compProp.rowMargin;
        var children = React.Children.map(this.props.children, function (child) {
            var rootStyle = {
                position: 'absolute',
                top: accumY,
                height: child.props.style.height,
                left: 0,
                width: 320
            };

            accumY += (rootStyle.height + this.props.compProp.columnsMargin);

            var bgStyle = {
                position: 'absolute',
                overflow: 'hidden',
                width: 320,
                left: 0,
                top: 0,
                bottom: 0
            };

            child = React.cloneElement(child, {
                rootStyle: rootStyle,
                bgStyle: bgStyle
            });
            return child;
        }, this);

        var stripContainerHeight = accumY - this.props.compProp.columnsMargin + this.props.compProp.rowMargin;

        return {
            '': {
                style: {
                    height: stripContainerHeight
                }
            },
            background: balataCommon.mubalat.createChildBalata(this),
            inlineContent: {
                children: children
            }
        };
    }

    /**
     * @class components.StripColumnsContainer
     * @extends {core.skinBasedComp}
     */
    return {
        displayName: "StripColumnsContainer",
        mixins: [mixins.skinBasedComp, backgroundCommon.mixins.backgroundDetectionMixin],
        componentDidLayout: function () {
            var scrollBarWidth = this.getScrollBarWidth();
            var screenWidth = this.getScreenWidth();
            var scrollBarChanged = this.lastScrollBarWidth !== scrollBarWidth;
            var screenWidthChanged = this.lastScreenWidth !== screenWidth;
            var isMobile = this.props.siteData.isMobileView();
            if (!isMobile && (scrollBarChanged || screenWidthChanged)) {
                this.lastScrollBarWidth = scrollBarWidth;
                this.lastScreenWidth = screenWidth;
                this.registerReLayout();
                this.forceUpdate();
            }
        },

        getDefaultSkinName: function () {
            return 'wysiwyg.viewer.skins.stripContainer.DefaultStripContainer';
        },
        getDesktopBackground: function (columnsContainerWidth, pageWidth) {
            return balataCommon.mubalat.createChildBalata(this, {style: {
                top: 0,
                bottom: 0,
                left: 'calc(' + parseInt(pageWidth / 2, 10) + 'px - (' + columnsContainerWidth + ' / 2))',
                right: 'calc(' + parseInt(pageWidth / 2, 10) + 'px + (' + columnsContainerWidth + ' / 2))',
                width: 'calc(' + columnsContainerWidth + ')'
            }});
        },
        getScrollBarWidth: function () {
            var siteData = this.props.siteData;
            var measureMap = siteData.measureMap;
            var isFirefox = siteData.browser.firefox; // https://developer.mozilla.org/en-US/docs/Web/CSS/length#Viewport-percentage_lengths
            return isFirefox ? 0 : _.get(measureMap, 'innerWidth.screen', 0) - _.get(measureMap, 'clientWidth', 0);
        },
        getPageWidth: function () {
            return this.props.siteData.getSiteWidth();
        },
        getScreenWidth: function () {
            return this.props.siteData.getScreenWidth();
        },
        getSkinProperties: function () {
            if (this.props.siteData.isMobileView()) {
                return getMobileSkinProperties.call(this);
            }

            var pageWidth = this.getPageWidth();
            var screenWidth = this.getScreenWidth();
            this.lastScreenWidth = screenWidth;

            var weights = getColumnsWeights.call(this);
            var columnsCount = weights.length;
            var compProp = this.props.compProp;
            var inlineContentWidth = pageWidth -
                compProp.columnsMargin * (columnsCount - 1) -
                compProp.frameMargin * 2;

            var columnsContentWidths = _.map(weights, function (weight) {
                return Math.floor(inlineContentWidth * weight);
            });
            var prevSums = _.reduce(weights, function (acc, weight) {
                acc.push(acc[acc.length - 1] + weight);
                return acc;
            }, [0]);

            var containerWidth, columnsContainerWidth, childStart;

            var scrollBarWidth = this.getScrollBarWidth();
            this.lastScrollBarWidth = scrollBarWidth;

            var screenThinnerPage = screenWidth && screenWidth <= pageWidth;

            if (compProp.fullWidth && !screenThinnerPage) {
                columnsContainerWidth = '(100vw - ' + scrollBarWidth + 'px - ' + compProp.siteMargin * 2 + 'px)';
                containerWidth = '(100vw - ' + scrollBarWidth + 'px - ' + (compProp.columnsMargin *
                    (columnsCount - 1) + (compProp.siteMargin + compProp.frameMargin) * 2) + 'px)';
                childStart = '(' + pageWidth + 'px - ' + columnsContainerWidth + ') / 2 + ' + compProp.frameMargin + 'px + ';
            } else {
                columnsContainerWidth = pageWidth + 'px';
                containerWidth = '(' + (pageWidth - (compProp.columnsMargin *
                    (columnsCount - 1) + compProp.frameMargin * 2)) + 'px)';
                childStart = compProp.frameMargin + 'px + ';
            }

            var children = React.Children.map(this.props.children, function (child, index) {
                var weight = weights[index];
                var childAlignment = child.props.compProp.alignment / 100;
                var rootStyle = {
                    position: 'absolute',
                    left: 'calc(' + containerWidth + ' * ' + (prevSums[index] +
                    (weight * childAlignment)) + ' + ' +
                    childStart +
                    (index * compProp.columnsMargin - columnsContentWidths[index] * childAlignment) + 'px)',
                    width: columnsContentWidths[index],
                    top: compProp.rowMargin,
                    height: child.props.style.height
                };
                var bgStyle = {
                    position: 'absolute',
                    width: 'calc(' + containerWidth + ' * ' + weight + ' + 1px)',
                    left: 'calc((' + containerWidth + ' * ' + weight + ' - ' + columnsContentWidths[index] + 'px) * ' + -childAlignment + ' - 1px)',
                    top: 0,
                    bottom: 0
                };
                var inlineStyle = {
                    position: 'absolute',
                    width: columnsContentWidths[index],
                    top: 0,
                    bottom: 0,
                    left: 'calc((100% - ' + columnsContentWidths[index] + 'px) * ' + childAlignment + ')'
                };
                child = React.cloneElement(child, {
                    rootStyle: rootStyle,
                    bgStyle: bgStyle,
                    inlineStyle: inlineStyle
                });
                return child;
            }, this);

            var refData = {
                background: this.getDesktopBackground(columnsContainerWidth, pageWidth),
                inlineContent: {
                    children: children
                }
            };
            refData[''] = {};
            return refData;
        }
    };
});
