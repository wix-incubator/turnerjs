define(['zepto', 'lodash', 'react', 'utils',
        'components/components/verticalAnchorsMenu/svgShapesData'], function ($, _, React, utils, svgShapesData) {
        'use strict';

        var linkRenderer = utils.linkRenderer;
        var ELEMENT_CLASSES = {
            item: 'item',
            line: 'line',
            link: 'link',
            symbol: 'symbol',
            textWrapper: 'text-wrapper',
            label: 'label'
        };

        return React.createClass({
            displayName: 'VerticalAnchorsMenuItem',

            getInitialState: function () {
                this.elementClasses = {};
                return {
                    hovered: null
                };
            },

            updateElementClasses: function () {
                var styleId = this.props.styleId;
                _.forEach(ELEMENT_CLASSES, function (value, key) {
                    this.elementClasses[key] = styleId + '_' + value;
                }, this);
            },

            handleOnMouseEnter: function () {
                if (!this.props.isTablet) {
                    this.setState({hovered: true});
                }
            },

            handleOnMouseLeave: function () {
                if (!this.props.isTablet) {
                    this.setState({hovered: false});
                }
            },

            disableClickOnTextWrapper: function (e) {
                var $textWrapper = $(e.target).find('[class=' + this.elementClasses.textWrapper + ']');
                if ($textWrapper && $textWrapper.css('visibility') === 'hidden') {
                    e.preventDefault();
                    e.stopPropagation();
                }
            },

            generateAnchorLink: function () {
                var anchorLinkData = _.clone(this.props.anchorData);
                var siteData = this.props.siteData;
                var page = siteData.getDataByQuery(siteData.getPrimaryPageId()); // will not work if we enable Anchors in popups.
                anchorLinkData.type = 'AnchorLink';
                anchorLinkData.anchorDataId = anchorLinkData;
                anchorLinkData.pageId = page;
                return linkRenderer.renderLink(anchorLinkData, siteData, this.props.rootNavigationInfo);
            },

            getLabelProps: function () {
                return {
                    className: this.elementClasses.label
                };
            },

            getTextWrapperProps: function () {
                return {
                    className: this.elementClasses.textWrapper,
                    key: 'textWrapper'
                };
            },

            getSvgProps: function () {
                var svgShape = svgShapesData[this.props.svgShapeName];
                var svgClass = this.elementClasses.symbol;
                var svgProps = _.clone(svgShape.svg);

                _.assign(svgProps, {
                        key: 'img-' + svgClass + this.props.svgShapeName,
                        className: svgClass,
                        dangerouslySetInnerHTML: {__html: svgShape.content}
                    }
                );

                return svgProps;
            },

            getLinkProps: function () {
                var skinExports = this.props.skinExports;
                var linkProps = {
                    className: this.elementClasses.link
                };

                // Workaround for IE10 (Pointer Events are not supported) - http://caniuse.com/#feat=pointer-events
                var isIE10 = this.props.siteData.browser.ie && this.props.siteData.browser.version <= 10;
                if (skinExports.disableClickOnHiddenElement && isIE10) {
                    linkProps.onClick = this.disableClickOnTextWrapper;
                }

                _.assign(linkProps, this.generateAnchorLink());

                return linkProps;
            },

            getItemProps: function (key) {
                var styleId = this.props.styleId;
                var itemClass = this.elementClasses.item;

                if (this.props.isActive) {
                    itemClass += ' ' + styleId + '_active';
                }
                if (!this.props.isTablet && this.state.hovered) {
                    itemClass += ' ' + styleId + '_hover';
                }

                var BRIGHTNESS_MID = 50;
                var colorBrightness = this.state.hovered ? this.props.hoveredOrSelectedColorBrightness : this.props.colorBrightness;
                var backgroundBrightness = this.props.backgroundBrightness;
                var areBrightnessValuesNubmers = _.isFinite(colorBrightness) && _.isFinite(backgroundBrightness);
                var isBrightnessDiffSmallerThanThreshold = Math.abs(colorBrightness - backgroundBrightness) < utils.siteConstants.BRIGHTNESS_DIFF_THRESHOLD;

                if (areBrightnessValuesNubmers && isBrightnessDiffSmallerThanThreshold) {
                    if (backgroundBrightness >= BRIGHTNESS_MID) {
                        itemClass += ' ' + styleId + '_dark';
                    } else {
                        itemClass += ' ' + styleId + '_light';
                    }
                }

                return {
                    key: key,
                    className: itemClass,
                    onMouseLeave: this.handleOnMouseLeave
                };
            },

            addMouseEnterEventToSkinExportedClass: function (elementProps) {
                var skinExports = this.props.skinExports;

                _.some(elementProps, function (props) {
                    if (props.className && !this.props.isTablet && _.includes(props.className, skinExports.hoverElementClass)) {
                        props.onMouseEnter = this.handleOnMouseEnter;
                        return true;
                    }
                }, this);
            },

            render: function () {
                this.updateElementClasses();

                var keyId = this.props.anchorData.id;
                var label = this.props.anchorData.name;

                var elementProps = {
                    itemProps: this.getItemProps(keyId),
                    linkProps: this.getLinkProps(),
                    svgProps: this.getSvgProps(),
                    textWrapperProps: this.getTextWrapperProps(),
                    labelProps: this.getLabelProps()
                };

                this.addMouseEnterEventToSkinExportedClass(elementProps);

                return React.DOM.li(elementProps.itemProps,
                    React.DOM.a(elementProps.linkProps, [
                        React.DOM.svg(elementProps.svgProps),
                        React.DOM.span(elementProps.textWrapperProps, React.DOM.span(elementProps.labelProps, label))
                    ]));
            }
        });
    }
);
