define(['core', 'lodash', 'wixappsCore'], function (/** core */ core, _, /** wixappsCore */ wixapps) {
    "use strict";

    /**
     * @class components.AppPartZoom
     * @extends {core.mediaZoomWrapperMixin}
     */
    return {
        displayName: 'AppPartZoom',
        mixins: [core.compMixins.mediaZoomWrapperMixin],

        getInitialState: function () {
            this.itemId = wixapps.wixappsUrlParser.getPageSubItemId(this.props.siteData);
            this.enableInnerScrolling = true;
            return null;
        },

        componentDidMount: function () {
            var dataAspect = this.props.siteAPI.getSiteAspect("wixappsDataAspect");//eslint-disable-line react/no-did-mount-callbacks-from-props
            var packageMetadata = dataAspect.getMetadata(this.getPartPackageName());
            if (packageMetadata.removed) {
                this.closeMediaZoom();
            }
        },

        getPartData: function(){
            var partData = this.props.compData;
            if (!partData.appPartName){
                partData = this.props.compData.dataItemRef;
            }
            return partData;
        },

        getPartPackageName: function () {
            var partData = this.getPartData();
            var app = this.props.siteData.getClientSpecMapEntry(partData.appInnerID);
            return app && app.packageName;
        },

        getPrevAndNextState: function () {
            var items = this.props.pageItemAdditionalData;
            if (_.isString(this.props.pageItemAdditionalData)) {
                var path = this.props.pageItemAdditionalData.split('.');
                var packageName = this.getPartPackageName();
                items = this.props.siteAPI.getSiteAspect("wixappsDataAspect").getDataByPath(packageName, path);
            }
            var ids = {
                prev: null,
                next: null
            };
            if (items && items.length > 1) {
                var myIndex = _.findIndex(items, function (item) {
                    // id - for inline items
                    // itemId - for refs
                    return item.id === this.itemId || item.itemId === this.itemId;
                }, this);
                ids.next = items[myIndex < (items.length - 1) ? (myIndex + 1) : 0];
                ids.prev = items[myIndex > 0 ? (myIndex - 1) : (items.length - 1)];
            }
            return ids;
        },

        isDataChanged: function () {
            var itemId = wixapps.wixappsUrlParser.getPageSubItemId(this.props.siteData);
            var changed = this.itemId !== itemId;
            this.itemId = itemId;
            return changed;
        },

        getChildComp: function(additionalProps){
            var partData = this.getPartData();

            additionalProps.key = this.itemId;
            //other wise the id in the dom is different from the ref path
            additionalProps.id = this.props.id + this.props.compData.id + partData.id;

            return this.createChildComponent(partData, 'wixapps.integration.components.AppPart', 'appPart', additionalProps);
        },

        getBoxDimensions: function () {
            //this is for the ecom migration, we might try to render the zoom when the app doesn't exist anymore
            //if someone got to the product page from the outside
            if (!this.getPartPackageName()){
                return {
                    imageContainerWidth: 0,
                    dialogBoxHeight: 0,
                    dialogBoxWidth: 0,
                    marginTop: 0,
                    padding: 0
                };
            }
            var partDataId = this.getPartData().id;
            var appPart = this.refs[this.props.compData.id].refs[partDataId];

            var displayerSize = this.props.siteData.measureMap.custom[this.props.id];
            var layoutRootProxy = appPart.getLayoutRootProxy();
            var imageContainerWidth = layoutRootProxy ? layoutRootProxy.getProxyStyle().width : 200;

            return {
                imageContainerWidth: imageContainerWidth,
                dialogBoxHeight: displayerSize.height,
                dialogBoxWidth: imageContainerWidth,
                marginTop: displayerSize.marginTop,
                padding: 0
            };
        },

        actualNavigateToItem: function (itemRef) {
            var navigationInfo = _.clone(this.props.rootNavigationInfo);

            var dataAspect = this.props.siteAPI.getSiteAspect("wixappsDataAspect");
            var title = null;
            var itemId = null;
            if (itemRef.collectionId){
                var pathToTitle = [itemRef.collectionId, itemRef.itemId, "title"];
                title = dataAspect.getDataByPath(this.getPartPackageName(), pathToTitle);
                itemId = itemRef.itemId;
            } else {
                navigationInfo.title = navigationInfo.title || "product";
                title = itemRef.title;
                itemId = itemRef.id;
            }
            navigationInfo.pageAdditionalData = wixapps.wixappsUrlParser.getAppPartZoomAdditionalDataPart(this.props.siteData, itemId, title, navigationInfo.title);

            this.props.siteAPI.navigateToPage(navigationInfo);
        },

        getChildZoomComponentType: function(){
            if (this.props.siteData.isMobileView()){
                return 'wysiwyg.viewer.components.MobileMediaZoom'; //mobile view only!
            }
            return 'wysiwyg.viewer.components.MediaZoom'; //desktop, mobile non optimized or tablet
        }
    };
});
