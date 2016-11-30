define(['lodash', 'core', 'utils',
    'tpa/mixins/tpaUrlBuilderMixin',
    'tpa/mixins/tpaCompApiMixin',
    'tpa/mixins/tpaRuntimeCompMixin',
    'tpa/mixins/tpaResizeWindowMixin'
], function(_, core, utils, tpaUrlBuilderMixin, tpaCompApiMixin, tpaRuntimeCompMixin, tpaResizeWindowMixin) {

    'use strict';

    var compRegistrar = core.compRegistrar;
    var mixins = core.compMixins;

    var windowOrigin = {
        FIXED: 'FIXED',
        ABSOLUTE: 'ABSOLUTE',
        RELATIVE: 'RELATIVE',
        DEFAULT: 'DEFAULT'
    };

    var windowPlacement = {
        bottomCenter: "BOTTOM_CENTER",
        bottomLeft: "BOTTOM_LEFT",
        bottomRight: "BOTTOM_RIGHT",
        center: "CENTER",
        centerLeft: "CENTER_LEFT",
        centerRight: "CENTER_RIGHT",
        topCenter: "TOP_CENTER",
        topLeft: "TOP_LEFT",
        topRight: "TOP_RIGHT"
    };

    var getRelativeCenterLeft = function (originalCompLeft, originalCompWidth, popupWidth) {
        return originalCompLeft + (originalCompWidth / 2) - (popupWidth / 2);
    };

    var getRelativeBottomHeight = function (windowHeight, originalCompTop, originalCompHeight) {
        return windowHeight - (originalCompTop + originalCompHeight);
    };

    var getRelativeRightWidth = function (windowWidth, originalCompWidth, originalCompLeft) {
        return windowWidth - (originalCompWidth + originalCompLeft);
    };

    var getRelativeCenterTop = function (originalCompTop, originalCompHeight, popupHeight) {
        return originalCompTop + (originalCompHeight / 2) - (popupHeight / 2);
    };

    var parseCssSize = function(requestedSize){
        function getSizeUnit(reqSize){
            return /(%)$/.exec(reqSize);
        }

        function getSizeNumber(reqSize){
            return /^([0-9]+)/.exec(reqSize);
        }

        var size = 0, unit = '';

        if (_.isNumber(requestedSize)) {
            size = requestedSize;
        } else if (_.isString(requestedSize)) {
            var splitUnit = getSizeUnit(requestedSize);
            var splitSize = getSizeNumber(requestedSize);
            size = splitSize && splitSize[1] ? parseInt(splitSize[1], 10) : 0;

            if (splitUnit && splitUnit[1]) {
                unit = splitUnit[1];
            }
        }

        return {size: size, unit: unit};
    };

    var handleFixedPosition = function (position, windowSize, width, height) {
        var style = {
            position: 'fixed',
            display: 'block',
            width: width,
            height: height
        };

        height = parseCssSize(height);
        height.size = height.unit === '%' ? _.min([height.size, 100]) : _.min([height.size, windowSize.height]);
        width = parseCssSize(width);
        width.size = width.unit === '%' ? _.min([width.size, 100]) : _.min([width.size, windowSize.width]);

        if (position.placement === windowPlacement.center) {
            return _.assign(style, {
                height: height.size + height.unit,
                width: width.size + width.unit,
                marginLeft: width.size / -2 + width.unit,
                marginTop: height.unit === '%' ? 0 : height.size / -2 + height.unit,
                left: '50%',
                top: height.unit === '%' ? 0 : '50%'
            });
        } else if (position.placement === windowPlacement.topLeft) {
            return _.assign(style, {
                height: height.size + height.unit,
                width: width.size + width.unit,
                left: '0px',
                top: '0px'
            });
        } else if (position.placement === windowPlacement.topRight) {
            return _.assign(style, {
                height: height.size + height.unit,
                width: width.size + width.unit,
                right: '0px',
                top: '0px'
            });
        } else if (position.placement === windowPlacement.topCenter) {
            return _.assign(style, {
                height: height.size + height.unit,
                width: width.size + width.unit,
                marginLeft: width.size / -2 + width.unit,
                top: '0px',
                left: '50%'
            });
        } else if (position.placement === windowPlacement.centerRight) {
            return _.assign(style, {
                height: height.size + height.unit,
                width: width.size + width.unit,
                marginTop: height.unit === '%' ? 0 : height.size / -2 + height.unit,
                top:  height.unit === '%' ? 0 : '50%',
                right: '0px'
            });
        } else if (position.placement === windowPlacement.centerLeft) {
            return _.assign(style, {
                height: height.size + height.unit,
                width: width.size + width.unit,
                marginTop: height.unit === '%' ? 0 : height.size / -2 + height.unit,
                top:  height.unit === '%' ? 0 : '50%',
                left: '0px'
            });
        } else if (position.placement === windowPlacement.bottomLeft) {
            return _.assign(style, {
                height: height.size + height.unit,
                width: width.size + width.unit,
                bottom: '0px',
                left: '0px'
            });
        } else if (position.placement === windowPlacement.bottomRight) {
            return _.assign(style, {
                height: height.size + height.unit,
                width: width.size + width.unit,
                bottom: '0px',
                right: '0px'
            });
        } else if (position.placement === windowPlacement.bottomCenter) {
            return _.assign(style, {
                height: height.size + height.unit,
                width: width.size + width.unit,
                marginLeft: width.size / -2 + width.unit,
                left: '50%',
                bottom: '0px'
            });
        }

        return style;
    };

    var handleRelativePosition = function (position, originalCompStyle, windowSize, height, width) {
        var style = {
            position: 'absolute',
            display: 'block'
        };
        var top, left;

        if (position.placement === windowPlacement.center) {

            height = _.min([height, windowSize.height]);
            width = _.min([width, windowSize.width]);
            top = getRelativeCenterTop(originalCompStyle.top, originalCompStyle.height, height);
            left = getRelativeCenterLeft(originalCompStyle.left, originalCompStyle.width, width);

        } else if (position.placement === windowPlacement.topLeft) {

            height = _.min([height, originalCompStyle.top]);
            width = _.min([width, originalCompStyle.left]);
            top = originalCompStyle.top - height;
            left = originalCompStyle.left - width;

        } else if (position.placement === windowPlacement.topRight) {

            height = _.min([height, originalCompStyle.top]);
            width = _.min([width, getRelativeRightWidth(windowSize.width, originalCompStyle.width, originalCompStyle.left)]);
            top = originalCompStyle.top - height;
            left = originalCompStyle.width + originalCompStyle.left;

        } else if (position.placement === windowPlacement.topCenter) {

            height = _.min([height, originalCompStyle.top]);
            width = _.min([width, windowSize.width]);
            top = originalCompStyle.top - height;
            left = getRelativeCenterLeft(originalCompStyle.left, originalCompStyle.width, width);

        } else if (position.placement === windowPlacement.centerRight) {

            height = _.min([height, windowSize.height]);
            width = _.min([width, getRelativeRightWidth(windowSize.width, originalCompStyle.width, originalCompStyle.left)]);
            top = getRelativeCenterTop(originalCompStyle.top, originalCompStyle.height, height);
            left = originalCompStyle.width + originalCompStyle.left;

        } else if (position.placement === windowPlacement.centerLeft) {

            height = _.min([height, windowSize.height]);
            width = _.min([width, originalCompStyle.left]);
            top = getRelativeCenterTop(originalCompStyle.top, originalCompStyle.height, height);
            left = originalCompStyle.left - width;

        } else if (position.placement === windowPlacement.bottomLeft) {

            height = _.min([height, getRelativeBottomHeight(windowSize.height, originalCompStyle.top, originalCompStyle.height)]);
            width = _.min([width, originalCompStyle.left]);
            top = originalCompStyle.top + originalCompStyle.height;
            left = originalCompStyle.left - width;

        } else if (position.placement === windowPlacement.bottomRight) {

            height = _.min([height, getRelativeBottomHeight(windowSize.height, originalCompStyle.top, originalCompStyle.height)]);
            width = _.min([width, getRelativeRightWidth(windowSize.width, originalCompStyle.width, originalCompStyle.left)]);
            top = originalCompStyle.top + originalCompStyle.height;
            left = originalCompStyle.width + originalCompStyle.left;

        } else if (position.placement === windowPlacement.bottomCenter) {

            height = _.min([height, getRelativeBottomHeight(windowSize.height, originalCompStyle.top, originalCompStyle.height)]);
            width = _.min([width, windowSize.width]);
            top = originalCompStyle.top + originalCompStyle.height;
            left = getRelativeCenterLeft(originalCompStyle.left, originalCompStyle.width, width);
        }

        top = _.max([0, top]);
        left = _.max([0, left]);

        return _.assign(style, {
            top: top,
            left: left,
            width: width,
            height: height
        });
    };

    var handleAbsolutePosition = function (position, originalCompStyle, windowSize, height, width) {
        var style = {
            position: 'absolute',
            display: 'block'
        };
        var top, left, smallestHeight, smallestWidth;

        if (position.placement === windowPlacement.center) {

            smallestHeight = _.min([originalCompStyle.actualTop + position.y, windowSize.height - (originalCompStyle.actualTop + position.y)]);
            height = _.min([height, 2 * smallestHeight]);
            smallestWidth = _.min([originalCompStyle.actualLeft + position.x, windowSize.width - (originalCompStyle.actualLeft + position.x)]);
            width = _.min([width, 2 * smallestWidth]);
            top = originalCompStyle.top + position.y - height / 2;
            left = originalCompStyle.left + position.x - width / 2;

        } else if (position.placement === windowPlacement.topLeft) {

            height = _.min([height, originalCompStyle.actualTop + position.y]);
            width = _.min([width, originalCompStyle.actualLeft + position.x]);
            top = originalCompStyle.top + position.y - height;
            left = originalCompStyle.left + position.x - width;

        } else if (position.placement === windowPlacement.topRight) {

            height = _.min([height, originalCompStyle.actualTop + position.y]);
            width = _.min([width, windowSize.width - (originalCompStyle.actualLeft + position.x)]);
            top = originalCompStyle.top + position.y - height;
            left = originalCompStyle.left + position.x;

        } else if (position.placement === windowPlacement.topCenter) {

            height = _.min([height, originalCompStyle.actualTop + position.y]);
            smallestWidth = _.min([originalCompStyle.actualLeft + position.x, windowSize.width - (originalCompStyle.actualLeft + position.x)]);
            width = _.min([width, 2 * smallestWidth]);
            top = originalCompStyle.top + position.y - height;
            left = originalCompStyle.left + position.x - width / 2;

        } else if (position.placement === windowPlacement.centerRight) {

            smallestHeight = _.min([originalCompStyle.actualTop + position.y, windowSize.height - (originalCompStyle.actualTop + position.y)]);
            height = _.min([height, 2 * smallestHeight]);
            width = _.min([width, windowSize.width - (originalCompStyle.actualLeft + position.x)]);
            top = originalCompStyle.top + position.y - height / 2;
            left = originalCompStyle.left + position.x;

        } else if (position.placement === windowPlacement.centerLeft) {

            smallestHeight = _.min([originalCompStyle.actualTop + position.y, windowSize.height - (originalCompStyle.actualTop + position.y)]);
            height = _.min([height, 2 * smallestHeight]);
            width = _.min([width, originalCompStyle.actualLeft + position.x]);
            top = originalCompStyle.top + position.y - height / 2;
            left = originalCompStyle.left + position.x - width;

        } else if (position.placement === windowPlacement.bottomLeft) {

            height = _.min([height, windowSize.height - (originalCompStyle.actulaTop + position.y)]);
            width = _.min([width, originalCompStyle.actualLeft + position.x]);
            top = originalCompStyle.top + position.y;
            left = originalCompStyle.left + position.x - width;

        } else if (position.placement === windowPlacement.bottomRight) {

            height = _.min([height, windowSize.height - (originalCompStyle.actualTop + position.y)]);
            width = _.min([width, windowSize.width - (originalCompStyle.actualLeft + position.x)]);
            top = originalCompStyle.top + position.y;
            left = originalCompStyle.left + position.x;

        } else if (position.placement === windowPlacement.bottomCenter) {

            height = _.min([height, windowSize.height - (originalCompStyle.actualTop + position.y)]);
            smallestWidth = _.min([originalCompStyle.actualLeft + position.x, windowSize.width - (originalCompStyle.actualLeft + position.x)]);
            width = _.min([width, 2 * smallestWidth]);
            top = originalCompStyle.top + position.y;
            left = originalCompStyle.left + position.x - width / 2;
        }

        top = _.max([0, top]);
        left = _.max([0, left]);

        return _.assign(style, {
            top: top,
            left: left,
            width: width,
            height: height
        });
    };

    var fallbackToCenterIfNeeded = function(windowSize, origPopupWidth, origPopupHeight, style) {
        var MIN_EDGE_SIZE = 10;

        if (style.width < MIN_EDGE_SIZE || style.height < MIN_EDGE_SIZE){
            var height = parseCssSize(origPopupHeight);
            height.size = height.unit === '%' ? _.min([height.size, 100]) : _.min([height.size, windowSize.height]);
            var width = parseCssSize(origPopupWidth);
            width.size = width.unit === '%' ? _.min([width.size, 100]) : _.min([width.size, windowSize.width]);

            return {
                position: 'fixed',
                display: 'block',
                width: width.size + height.unit,
                height: height.size + width.unit,
                marginLeft: width.size / -2 + height.unit,
                marginTop: height.size / -2 + width.unit,
                left: '50%',
                top: '50%'
            };
        }

        return style;
    };

    var getStyleFor = function(position, originalCompStyle, windowSize, width, height) {
        var style = {};

        if (position.origin === windowOrigin.DEFAULT || position.origin === windowOrigin.FIXED) {
            style = handleFixedPosition(position, windowSize, width, height);
        }

        if (position.origin === windowOrigin.RELATIVE) {
            style = handleRelativePosition(position, originalCompStyle, windowSize, height, width);
        }

        if (position.origin === windowOrigin.ABSOLUTE) {
            style = handleAbsolutePosition(position, originalCompStyle, windowSize, height, width);
        }

        style = fallbackToCenterIfNeeded(windowSize, width, height, style);

        return style;
    };

    var getPopupZIndexValue = function (siteAPI) {
        var modalAspectComps = siteAPI.getSiteAspect('tpaModalAspect').getReactComponents();
        var isModalOpened = modalAspectComps && modalAspectComps.length > 0;

        return isModalOpened ? 1001 : null;
    };

    /**
     * @class components.TPAPopup
     * @extends {core.skinBasedComp}
     * @extends {ReactCompositeComponent}
     * @extends {tpa.mixins.tpaUrlBuilder}
     * @extends {tpa.mixins.tpaCompAPI}
     * @property {comp.properties} props
     */
    var TPAPopup = {
        displayName: "TPAPopup",
        mixins: [mixins.skinBasedComp, tpaUrlBuilderMixin, tpaCompApiMixin, tpaRuntimeCompMixin, tpaResizeWindowMixin],

        getInitialState: function() {
            return {
                showComponent: true,
                registeredEvents: [],
                $displayDevice: this.getDeviceType()
            };
        },

        getSkinProperties: function() {
            var selfStyle = this.state.showComponent ? this.getSelfStyle() : {display: 'none'};
            var showCloseButton = this.isBareTheme() ? "none" : "block";

            if (this.state.showComponent) {
                return {
                    "": {
                        style: selfStyle
                    },
                    closeButton: {
                        onClick: this.hide,
                        style: {display: showCloseButton}
                    },
                    'iframe': {
                        src: this.buildUrl(this.props.compData.url),
                        scrolling: "no",
                        frameBorder: "0",
                        allowTransparency: true,
                        allowFullScreen: true,
                        name: this.props.id
                    }
                };
            }
            return {
                "": {
                    style: selfStyle
                }
            };
        },

        mutateIframeUrlQueryParam: function (queryParamsObj) {
            queryParamsObj.origCompId = this.props.compData.origCompId;

            return queryParamsObj;
        },

        getSelfStyle: function () {
            var position = _.defaults(this.props.compData.position, {x: 0, y: 0});
            var originalCompStyle = this.props.compData.origCompStyle;
            var windowSize = this.props.compData.windowSize;
            var width = _.isUndefined(this.state.width) ? this.props.compData.width : this.state.width;
            var height = _.isUndefined(this.state.height) ? this.props.compData.height : this.state.height;
            var style = getStyleFor(position, originalCompStyle, windowSize, width, height);
            style.zIndex = getPopupZIndexValue(this.props.siteAPI);

            return this.getThemeStyle(style);
        },

        getThemeStyle: function(style){
            if (this.isBareTheme()){
                return _.merge(style, {
                    background: "none",
                    boxShadow: "none",
                    borderRadius: 0
                });
            }

            return style;
        },

        hide: function (data, callback) {
            var self = this;

            utils.compFactory.invalidate('wysiwyg.viewer.components.tpapps.TPAPopup');

            this.setState({showComponent: false}, function() {
                var callBackData = data && data.message ? data : undefined;
                if (self.props.onCloseCallback) {
                    self.props.onCloseCallback(callBackData);
                }

                this.props.siteAPI.getSiteAspect('tpaPopupAspect').removePopup(self);
                if ( _.isFunction(callback) ){
                    callback();
                }
            });
        },

        isBareTheme: function(){
            return this.props.compData.theme === "BARE";
        }
    };

    compRegistrar.register("wysiwyg.viewer.components.tpapps.TPAPopup", TPAPopup);
    return TPAPopup;
});
