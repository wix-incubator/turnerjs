define(['lodash', 'react', 'reactDOM', 'core', 'santaProps', 'utils', 'siteUtils', 'imageClientApi', 'skins', 'image', 'experiment'], function (_, React, ReactDOM, /** core */ core, santaProps, /** utils */ utils, siteUtils, imageClientApi, skinsPackage, image, experiment) {
    'use strict';

    var mixins = core.compMixins;
    var linkRenderer = utils.linkRenderer;

    function getTextAlignment(textAlignment) {
        if (textAlignment) {
            switch (textAlignment) {
                case "left":
                    return 'alignLeft';
                case "center":
                    return 'alignCenter';
                case "right":
                    return 'alignRight';
                default:
                    return 'alignLeft';
            }
        }
    }

    function getTextAlignmentProperties(textAlignment) {
        var retVal = {"textAlign" : textAlignment};

        if (experiment.isOpen('sv_fixGridsTextDirection') && textAlignment === "right") {
            retVal.direction = 'rtl';
        }

        return retVal;
    }

    /**
     * @class components.Displayer
     * @extends {core.skinBasedComp}
     * @extends {core.skinInfo}
     */
    return {
        displayName: "Displayer",

        mixins: [mixins.skinBasedComp, mixins.skinInfo],

        propTypes: _.assign({
            browser: santaProps.Types.Browser.browser.isRequired,
            rootNavigationInfo: santaProps.Types.Component.rootNavigationInfo.isRequired,
            linkRenderInfo: santaProps.Types.Link.linkRenderInfo.isRequired,
            isMobileView: santaProps.Types.isMobileView,
            isMobileDevice: santaProps.Types.Device.isMobileDevice,
            isAndroidOldBrowser: santaProps.Types.Browser.isAndroidOldBrowser,

            imageIndex: React.PropTypes.number.isRequired,
            compProp: React.PropTypes.object.isRequired,
            compData: React.PropTypes.object.isRequired,
            imageWrapperSize: React.PropTypes.object.isRequired,

            heightDiff: React.PropTypes.number,
            widthDiff: React.PropTypes.number,
            bottomGap: React.PropTypes.number,
            galleryId: React.PropTypes.string,
            isSelected: React.PropTypes.bool,
            galleryDataId: React.PropTypes.string,
            skin: React.PropTypes.string,
            id: React.PropTypes.string,
            showPanelState: React.PropTypes.string,
            onClick: React.PropTypes.func
        }, santaProps.santaTypesUtils.getSantaTypesByDefinition(image)),

        statics: {
            useSantaTypes: true
        },

        getInitialState: function () {
            return {
                $showPanel: "defaultPanelState",
                $displayDevice: this.props.isMobileView ? "mobileView" : "desktopView",
                $textAlignmentState: getTextAlignment(this.props.compProp.alignText),
                $selected: this.props.isSelected ? 'selected' : 'unselected',
                $scaling: this.props.compProp.imageMode || "clipImage",
                $transitionPhase: "noTransition",
                $general: "normal",
                $linkableComponent: this.props.compData.link ? "link" : "noLink"
            };
        },
        _getImageClickAction: function () {
            var compProp = this.props.compProp;
            var imageClickAction = compProp.galleryImageOnClickAction;
            if (!imageClickAction) {
                imageClickAction = (compProp.expandEnabled === true) ? "zoomMode" : "disabled";
            }
            return imageClickAction;
        },
        componentDidMount: function () {
            setTimeout(function () {
                var classList;
                var ANDROID_FIX_CLASS = 'androidNativeBrowserFix';
                if (this.isMounted()) {
                    this.setState({$showPanel: (this.props.showPanelState || "notShowPanel")}); //eslint-disable-line react/no-did-mount-set-state
                    /* CLNT-1377 | Fix for mobile Android native browser - it doesn't apply existing styles.
                    So we add and remove dummy class to make a browser redraw styles. */
                    if (this.props.isAndroidOldBrowser && this.props.isMobileDevice) {//eslint-disable-line react/no-did-mount-callbacks-from-props
                        classList = ReactDOM.findDOMNode(this).classList;
                        classList.add(ANDROID_FIX_CLASS);
                        classList.remove(ANDROID_FIX_CLASS);
                    }
                }
            }.bind(this), 0);

        },


        componentWillReceiveProps: function (nextProps) {
            this.setState({
                $selected: nextProps.isSelected ? 'selected' : 'unselected'
            });
        },
        getContainerSize: function () {
            var containerWidth = this.props.imageWrapperSize.imageWrapperWidth - this.getDisplayerDefaultParam(this.props.skin, "imageWrapperRight") - this.getDisplayerDefaultParam(this.props.skin, "imageWrapperLeft");
            var containerHeight = this.props.imageWrapperSize.imageWrapperHeight - this.getDisplayerDefaultParam(this.props.skin, "imageWrapperBottom") - this.getDisplayerDefaultParam(this.props.skin, "imageWrapperTop");
            if (this.getFromExports("addMarginToContainer")) {
                containerWidth += this.props.imageWrapperSize.imageWrapperMarginLeft + this.props.imageWrapperSize.imageWrapperMarginRight;
                containerHeight += this.props.imageWrapperSize.imageWrapperMarginTop + this.props.imageWrapperSize.imageWrapperMarginBottom;
            }
            return {
                containerWidth: containerWidth,
                containerHeight: containerHeight
            };
        },

        getSkinProperties: function () {

            var compData = this.props.compData;
            var compProp = this.props.compProp;
            var textAlign = compProp.alignText || "left";
            var imageClassName = 'core.components.Image';
            var containerSize = this.getContainerSize();
            var containerWidth = containerSize.containerWidth;
            var containerHeight = containerSize.containerHeight;
            var imageStyleProps = {position: "relative", overflow: "hidden"};
            if (this.props.browser.ie && this.props.browser.version <= 10) {
                _.merge(imageStyleProps, {"border": "1px solid transparent"});
            }
            return {
                "": {
                    onClick: this.props.onClick,
                    onMouseEnter: this.onMouseEnter,
                    onMouseLeave: this.onMouseLeave,
                    'data-image-index': this.props.imageIndex,
                    //todo: CLNT-5323 , wixapp sildergallery temporary workwaround
                    //todo: remove width/height/uri from dom data when wixapps will add support for structureInfo->dataItem->items
                    'data-displayer-width': compData.width,
                    'data-displayer-height': compData.height,
                    'data-displayer-uri': compData.uri,
                    'data-height-diff': this.props.heightDiff,
                    'data-width-diff': this.props.widthDiff,
                    'data-bottom-gap': this.props.bottomGap,
                    'data-image-wrapper-right':this.getDisplayerDefaultParam(this.props.skin, "imageWrapperRight"),
                    'data-image-wrapper-left':this.getDisplayerDefaultParam(this.props.skin, "imageWrapperLeft"),
                    'data-image-wrapper-top':this.getDisplayerDefaultParam(this.props.skin, "imageWrapperTop"),
                    'data-image-wrapper-bottom':this.getDisplayerDefaultParam(this.props.skin, "imageWrapperBottom"),
                    'data-margin-to-container':this.getFromExports("addMarginToContainer")

                },
                "imageWrapper": {
                    style: {
                        "height": this.props.imageWrapperSize.imageWrapperHeight,
                        "width": this.props.imageWrapperSize.imageWrapperWidth,
                        "marginLeft": this.props.imageWrapperSize.imageWrapperMarginLeft,
                        "marginRight": this.props.imageWrapperSize.imageWrapperMarginRight,
                        "marginTop": this.props.imageWrapperSize.imageWrapperMarginTop,
                        "marginBottom": this.props.imageWrapperSize.imageWrapperMarginBottom
                    }
                },
                "title": {
                    children: compData.title || "",
                    style: getTextAlignmentProperties(textAlign)
                },
                "description": {
                    children: this.parseTextIntoLinesArray(compData.description) || "",
                    style: getTextAlignmentProperties(textAlign)
                },
                "image": this.createChildComponent(
                    compData,
                    imageClassName,
                    'image',
                    {
                        ref: 'image',
                        id: this.props.id + 'image',
                        imageData: compData,
                        containerWidth: (containerWidth > 0) ? Math.round(containerWidth) : 16,
                        containerHeight: (containerHeight > 0) ? Math.round(containerHeight) : 16,
                        displayMode: imageClientApi.fittingTypes.SCALE_TO_FILL,
                        usePreloader: true,
                        style: imageStyleProps
                    }),
                "zoom": {
                    style: {"cursor": this.getCursor()},
                    addChildBefore: [
                        this.generateZoomNode(), "link"
                    ]
                },
                "link": {style: {display: "none"}}
            };
        },

        parseTextIntoLinesArray: function(text){
            if (!_.isString(text)) {
                return undefined;
            }
            var textLinesArray = text.split(/(?:\r\n|\r|\n)/);

            if (textLinesArray.length > 1) {
                var parsedArr = [];
                _.forEach(textLinesArray, function addBrElements(textLine, index){
                    parsedArr.push(textLine);

                    if ( index < textLinesArray.length - 1 ){
                        parsedArr.push(React.createElement('br', null));
                    }
                });
                return parsedArr;
            }
            return text;
        },

        onMouseEnter: function () {
            this.setState({$general: "rollover"});
        },
        onMouseLeave: function () {
            this.setState({$general: "normal"});
        },


        /**
         * @private
         * @returns {string}
         */
        getCursor: function () {
            var compData = this.props.compData;
            var clickAction = this._getImageClickAction();

            if (clickAction === 'zoomMode' || compData.link && clickAction === 'goToLink') {
                return 'pointer';
            }
            return 'default';
        },

        /**
         * @private
         * @returns {*}
         */
        getLinkData: function () {
            return linkRenderer.renderLink(
                this.props.compData.link,
                this.props.linkRenderInfo,
                this.props.rootNavigationInfo);
        },

        /**
         * @private
         * @param skinName
         * @param paramName
         * @returns {number}
         */
        getDisplayerDefaultParam: function (skinName, paramName) {
            var skinExports = this.getSkinExports();
            var skinData = skinsPackage.skins[skinName];
            var val = skinData.paramsDefaults ? skinData.paramsDefaults[paramName] : "";
            if (!val) {
                var exportsVal = skinExports[paramName];
                return (exportsVal ? Math.abs(parseInt(exportsVal, 10) || 0) : 0);
            }
            if (Array.isArray(val)) {
                return _.sum(val, function(item) {
                   return Math.abs(parseInt(this.getParamFromDefaultSkin(item).value, 10));
                }, this);
            }
            return Math.abs(parseInt(val, 10)) || 0;
        },

        /**
         * @private
         * @returns {*}
         */
        generateZoomNode: function () {
            var compData = this.props.compData;
            var clickAction = this._getImageClickAction();
            var params = {
                draggable: false,
                style: _.assign({
                    cursor: this.getCursor(),
                    height: '100%',
                    display: 'block',
                    width: '100%',
                    position: 'absolute',
                    top: '0px',
                    left: '0px',
                    backgroundColor: "#ffffff",
                    filter: "alpha(opacity=0)",
                    opacity: "0"
                }, utils.style.prefix({
                    userSelect: 'none',
                    userDrag: 'none',
                    userModify: 'read-only'
                })),
                'data-page-item-context': this.props.galleryDataId,
                'data-gallery-id': this.props.galleryId,
                onDragStart: function (e) {
                    e.preventDefault();
                    return false;
                }
            };

            var additionalParamsToMerge = {};
            if (clickAction === 'zoomMode') {
                additionalParamsToMerge = linkRenderer.renderImageZoomLink(
                                                            this.props.linkRenderInfo,
                                                            this.props.rootNavigationInfo,
                                                            compData,
                                                            this.props.galleryDataId);
            } else if (compData.link && clickAction === 'goToLink') {
                additionalParamsToMerge = this.getLinkData();
            } else {
                additionalParamsToMerge = {
                    onClick: function (e) {
                        function createEvent(expandedImageId) {
                            return {
                                id: expandedImageId,
                                name: siteUtils.constants.ACTION_TYPES.ITEM_CLICKED,
                                timeStamp: window.performance ? window.performance.now() : window.Date.now()
                            };
                        }
                        this.props.handleAction({
                            "type": "comp",
                            "name": siteUtils.constants.ACTION_TYPES.ITEM_CLICKED,
                            "sourceId": this.props.galleryId,
                            "pageId": this.props.rootId
                        }, createEvent(_.get(this.props, 'compData.id') || this.props.id));
                        e.preventDefault();
                        e.stopPropagation();
                    }.bind(this)
                };
            }

            _.merge(params, additionalParamsToMerge);

            return React.DOM.a(params);
        },
        setPanelState: function (newPanelState) {
            this.setState({
                $showPanel: newPanelState
            });
        },
        getPanelState: function () {
            return this.state.$showPanel;
        },
        setTransitionPhase: function (transPhase) {
            this.setState({
                $transitionPhase: transPhase
            });
        }

    };
});
