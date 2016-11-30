define(['core', 'utils', 'lodash'], function(/** core */ core, utils, _){
    "use strict";

    function isNonOptimizedView(siteData){
        return (siteData.isMobileDevice() && !siteData.isMobileView()) || siteData.isTabletDevice();
    }

    /**
     * @class components.ImageZoom
     * @extends {core.skinBasedComp}
     */
    return {
        displayName: "ImageZoom",
        mixins: [core.compMixins.mediaZoomWrapperMixin],

        getInitialState: function() {
            var siteData = this.props.siteData;
            if (isNonOptimizedView(siteData)) {
                this.enableInnerScrolling = true;
            }
            return {};
        },

        getPrevAndNextState: function(){
            var items, currIndex;
            var galleryData = this.props.pageItemAdditionalData;
            var ids = {
                next: null,
                prev: null
            };

            if (galleryData) {
                items = _.map(galleryData.items, 'id');
                if (items.length > 1) {
                    currIndex = items.indexOf(this.props.compData.id);
                    ids.next = items[(currIndex + 1) % items.length];
                    ids.prev = items[(currIndex - 1 + items.length) % items.length];
                }
            }

            return ids;
        },

        isDataChanged: function(prevProps, nextProps){
            return prevProps.compData !== nextProps.compData;
        },

        getChildComp: function(additionalProps, spacers){
            var siteData = this.props.siteData;
            var isMobileView = siteData.isMobileView();
            var getDimensionsFunc;
            if (isNonOptimizedView(siteData)) {
                getDimensionsFunc = utils.mediaZoomCalculations.getNonOptimizedViewDimensions;
            } else {
                getDimensionsFunc = isMobileView ? utils.mediaZoomCalculations.getMobileViewDimensions : utils.mediaZoomCalculations.getDesktopViewDimensions;
            }
            var componentType = isMobileView ? 'wysiwyg.components.MobileImageZoomDisplayer' : 'wysiwyg.components.ImageZoomDisplayer';
            var props = {
                zoomDimensions: getDimensionsFunc(this.props.compData, siteData, siteData.measureMap, spacers.width, spacers.height),
                quality: {quality:90} // force jpeg compression to 90
            };
            _.assign(props, additionalProps);
            return this.createChildComponent(this.props.compData, componentType, 'imageItem', props);
        },

        getBoxDimensions: function(){
            return this.props.siteData.measureMap && this.props.siteData.measureMap.custom[this.props.id + this.props.compData.id] || null;
        },

        actualNavigateToItem: function(itemId){
            if (utils.nonPageItemZoom.getZoomedImageData() === undefined) {
                var navigationInfo = _.clone(this.props.rootNavigationInfo);
                navigationInfo.pageItemId = itemId;
                this.props.siteAPI.navigateToPage(navigationInfo);
            } else if (itemId) {
                utils.nonPageItemZoom.zoom(utils.nonPageItemZoom.getImageDataFromGalleryByQuery(itemId));
            } else {
                utils.nonPageItemZoom.unzoom();
            }
        },

        getChildZoomComponentType: function(){
            if (this.props.siteData.isMobileView()){
                return 'wysiwyg.viewer.components.MobileMediaZoom'; //mobile view only!
            }
            return 'wysiwyg.viewer.components.MediaZoom'; //desktop
        }
    };
});
