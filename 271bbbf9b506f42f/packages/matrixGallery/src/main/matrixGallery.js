define(['lodash', 'skins', 'core', 'santaProps', 'utils', 'galleriesCommon', 'displayer'], function (_, skinsPackage, /** core */core, santaProps, utils, galleriesCommon, displayer) {
    'use strict';

    var mixins = core.compMixins;
    var matrixCalculations = galleriesCommon.utils.matrixCalculations;
    var matrixScalingCalculations = galleriesCommon.utils.matrixScalingCalculations;
    var galleriesHelperFunctions = galleriesCommon.utils.galleriesHelperFunctions;
    var galleriesCommonLayout = utils.galleriesCommonLayout;

    var MIN_GALLERY_HEIGHT = 70;
    var displayerSkinParams = ['topPadding', 'imgHeightDiff'];

    function hideShowMoreButton(rowsNumber, numCols, itemsLen) {
        return (itemsLen <= (rowsNumber * numCols)) ? 'fullView' : 'hiddenChildren';
    }

    function enforceMinimalHeightOnGallery(height) {
        return Math.max(MIN_GALLERY_HEIGHT, height);
    }

    /**
     * @class components.MatrixGallery
     * @extends {core.skinBasedComp}
     * @extends {core.skinInfo}
     */
    return {
        displayName: "MatrixGallery",

        propTypes: _.assign({
            shouldResetGalleryToOriginalState: santaProps.Types.RenderFlags.shouldResetGalleryToOriginalState.isRequired,
            compProp: santaProps.Types.Component.compProp.isRequired,
            compData: santaProps.Types.Component.compData.isRequired,
            style: santaProps.Types.Component.style.isRequired,
            skin: santaProps.Types.Component.skin.isRequired,
            compTheme: santaProps.Types.Component.theme.isRequired,
            currentUrlPageId: santaProps.Types.Component.currentUrlPageId.isRequired,
            isMobileView: santaProps.Types.isMobileView,
            isMobileDevice: santaProps.Types.Device.isMobileDevice,
            isTabletDevice: santaProps.Types.Device.isTabletDevice,
            compActions: santaProps.Types.Component.compActions.isRequired
        }, santaProps.santaTypesUtils.getSantaTypesByDefinition(displayer)),

        statics: {
          useSantaTypes: true
        },

        mixins: [mixins.skinBasedComp, mixins.skinInfo],

        getInitialState: function () {
            this.shouldResetGalleryToOriginalState = this.props.shouldResetGalleryToOriginalState;
            var numberOfRows = matrixCalculations.getAvailableRowsNumber(this.props.compProp.maxRows, this.props.compProp.numCols, this.props.compData.items.length);
            var displayDevice = this.props.isMobileView ? "mobileView" : "desktopView";

            this.showMoreClicked = false;

            this.galleryHeight = enforceMinimalHeightOnGallery(this.props.style.height);
            this.itemHeight = matrixCalculations.getItemHeight(this.props.compProp.margin, this.galleryHeight, numberOfRows, galleriesHelperFunctions.getSkinHeightDiff(this.props.skin));
            this.currentStyle = this.props.compTheme;

            var displayerSkinParamsVals = this.getParams(displayerSkinParams, this.getDisplayerSkin());
            this.currentHeightDiff = galleriesHelperFunctions.getDisplayerHeightDiff(skinsPackage.skins[this.getDisplayerSkin()], displayerSkinParamsVals, displayDevice);

            return {
                numberOfRows: numberOfRows,
                $mobile: (this.props.isMobileDevice || this.props.isTabletDevice) ? "mobile" : "notMobile",
                $displayDevice: displayDevice,
                $state: hideShowMoreButton(numberOfRows, this.props.compProp.numCols, this.props.compData.items.length)
            };
        },
        createDisplayer: function (displayerData, index, width, height) {
            var displayerSkin = this.getDisplayerSkin();
            var skin = skinsPackage.skins[this.props.skin];
            var bottomGap = (skin.exports && skin.exports.bottomGap) || 0;
            var displayerSkinParamsVals = this.getParams(displayerSkinParams, displayerSkin);
            var heightDiff = galleriesHelperFunctions.getDisplayerHeightDiff(skinsPackage.skins[displayerSkin], displayerSkinParamsVals, this.state.$displayDevice);
            var widthDiff = galleriesHelperFunctions.getDisplayerWidthDiff(skinsPackage.skins[displayerSkin], this.state.$displayDevice);
            var sizeAfterScaling = matrixScalingCalculations.getSizeAfterScaling({
                itemHeight: height,
                itemWidth: width,
                displayerData: displayerData,
                imageMode: this.props.compProp.imageMode,
                widthDiff: widthDiff,
                heightDiff: heightDiff,
                bottomGap: bottomGap
            });
            var displayerPosition = matrixCalculations.getItemPosition(index, width, height, this.props.compProp.margin, this.props.compProp.numCols);
            return this.createChildComponent(displayerData,
                "wysiwyg.viewer.components.Displayer",
                'imageItem',
                {
                    key: displayerData.id,
                    ref: this.props.id + displayerData.id + index,
                    id: this.props.id + displayerData.id + index,
                    currentUrlPageId: this.props.currentUrlPageId,
                    galleryId: this.props.id,
                    galleryDataId: this.props.compData.id,
                    imageWrapperSize: sizeAfterScaling.imageWrapperSize,
                    imageIndex: index,
                    heightDiff: heightDiff,
                    widthDiff: widthDiff,
                    bottomGap: bottomGap,
                    compActions: this.props.compActions,
                    style: {
                        width: sizeAfterScaling.displayerSize.width,
                        height: sizeAfterScaling.displayerSize.height,
                        position: "absolute",
                        left: displayerPosition.left,
                        top: displayerPosition.top
                    }
                }
            );
        },
        createDisplayers: function () {
            var visibleImages = _.take(this.props.compData.items, this.props.compProp.numCols * this.state.numberOfRows);
            var itemWidth = matrixCalculations.getItemWidth(this.props.compProp.margin, this.props.compProp.numCols, this.props.style.width, galleriesHelperFunctions.getSkinWidthDiff(this.props.skin));
            var itemHeight = this.itemHeight || matrixCalculations.getItemHeight(this.props.compProp.margin, this.galleryHeight, this.state.numberOfRows, galleriesHelperFunctions.getSkinHeightDiff(this.props.skin));
            return _.map(visibleImages, function (item, index) {
                return this.createDisplayer(item, index, itemWidth, itemHeight);
            }, this);
        },

        componentWillReceiveProps: function (nextProps) {
            var numberOfRows = matrixCalculations.getAvailableRowsNumber(nextProps.compProp.maxRows, nextProps.compProp.numCols, nextProps.compData.items.length);
            var newState = {};

            /*cols or rows number changed*/
            if (this.props.compProp.maxRows !== nextProps.compProp.maxRows || this.props.compProp.numCols !== nextProps.compProp.numCols || this.props.compData.items.length !== nextProps.compData.items.length) {
                newState.numberOfRows = numberOfRows;
                this.galleryHeight = enforceMinimalHeightOnGallery(galleriesHelperFunctions.getGalleryHeight(this.state.numberOfRows, numberOfRows, this.props.compProp.margin, this.props.skin, this.galleryHeight));
                newState.$state = hideShowMoreButton(numberOfRows, nextProps.compProp.numCols, nextProps.compData.items.length);
            }

            /*gallery Height changed*/
            if (this.props.style.height !== nextProps.style.height) {
                this.galleryHeight = enforceMinimalHeightOnGallery(nextProps.style.height);
            }
            if (!_.isEmpty(newState)) {
                this.setState(newState);
            }

            if (this.shouldResetGalleryToOriginalState !== nextProps.shouldResetGalleryToOriginalState) {
                if (this.shouldResetGalleryToOriginalState && this.resetGalleryState) {
                    this.resetGalleryState();
                }
                this.shouldResetGalleryToOriginalState = nextProps.shouldResetGalleryToOriginalState;
            }

            /*style props changed*/
            var newStyle = nextProps.compTheme;
            if (newStyle.skin === this.currentStyle.skin && this.shouldRecalculateHeightOnSkinParamChange(this.currentStyle.style.properties, newStyle.style.properties)) {
                var displayerSkin = this.getDisplayerSkin();
                var displayerSkinParamsVals = this.getParams(displayerSkinParams, displayerSkin);
                var newHeightDiff = galleriesHelperFunctions.getDisplayerHeightDiff(skinsPackage.skins[displayerSkin], displayerSkinParamsVals, this.state.$displayDevice);
                var currItemHeight = this.itemHeight || matrixCalculations.getItemHeight(this.props.compProp.margin, this.galleryHeight, this.state.numberOfRows, galleriesHelperFunctions.getSkinHeightDiff(this.props.skin));
                this.itemHeight = currItemHeight - (this.currentHeightDiff - newHeightDiff);
                var galleryHeightDiff = galleriesHelperFunctions.getSkinHeightDiff(this.props.skin);
                this.galleryHeight = ((this.state.numberOfRows * this.itemHeight) + ((this.state.numberOfRows - 1) * this.props.compProp.margin)) + galleryHeightDiff;
                this.currentHeightDiff = newHeightDiff;
                this.currentStyle = newStyle;
            }

            if (!_.isEmpty(newState)) {
                this.setState(newState);
            }
        },
        getSkinProperties: function () {
            var skinProps = {
                "showMore": {
                    children: this.props.compProp.showMoreLabel,
                    onClick: this.showMoreRows
                },
                "itemsContainer": {
                    children: this.createDisplayers(),
                    style: {
                        height: this.galleryHeight
                    }
                },
                "": {
                    'data-height-diff': galleriesHelperFunctions.getSkinHeightDiff(this.props.skin),
                    'data-width-diff': galleriesHelperFunctions.getSkinWidthDiff(this.props.skin),
                    'data-presented-row': this.state.numberOfRows,
                    style: {
                        height: this.galleryHeight
                    }

                }
            };

            if (this.showMoreClicked || this.state.$state === 'fullView') {
                galleriesCommonLayout.updateSkinPropsForFlexibleHeightGallery(skinProps, this.galleryHeight);
            }

            return skinProps;
        },
        showMoreRows: function () {
            var newRowsNumber = matrixCalculations.getAvailableRowsNumber(this.state.numberOfRows + this.props.compProp.incRows, this.props.compProp.numCols, this.props.compData.items.length);
            this.showMoreClicked = true;
            this.galleryHeight = enforceMinimalHeightOnGallery(galleriesHelperFunctions.getGalleryHeight(this.state.numberOfRows, newRowsNumber, this.props.compProp.margin, this.props.skin, this.galleryHeight));
            this.registerReLayout();
            this.setState({
                numberOfRows: newRowsNumber,
                $state: hideShowMoreButton(newRowsNumber, this.props.compProp.numCols, this.props.compData.items.length)
            });
        },
        getDisplayerSkin: function () {
            return this.getSkinExports().imageItem.skin;
        },
        shouldRecalculateHeightOnSkinParamChange: function (currentStyle, newStyle) {
            var currentStyleRelevantProps = _.pick(currentStyle, displayerSkinParams);
            var newStyleRelevantProps = _.pick(newStyle, displayerSkinParams);
            return !_.isEqual(currentStyleRelevantProps, newStyleRelevantProps);

        }

    };
});
