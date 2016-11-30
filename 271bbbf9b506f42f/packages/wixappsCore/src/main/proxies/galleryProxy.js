define(["lodash", "siteUtils", "wixappsCore/proxies/mixins/templateBasedChildrenProxy", "wixappsCore/proxies/mixins/baseCompositeProxy"
], function (_, siteUtils, templateBasedChildrenProxy, baseCompositeProxy) {
    'use strict';

    function transformSkinProperties(refData) {
        refData['']['data-proxy-name'] = "GalleryProxy";
        refData['']['data-total-columns'] = this.getCompProp('columns');
        refData['']['data-total-rows'] = this.getCompProp('rows');
        refData['']['data-gap'] = this.getCompProp('gap');

        // Replace sizes set by the component to 100% if the component couldn't calculate the correct size.
        refData.itemsContainer.style.width = isNaN(refData.itemsContainer.style.width) ? '100%' : refData.itemsContainer.style.width;
        refData.itemsContainer.style.height = isNaN(refData.itemsContainer.style.height) ? '100%' : refData.itemsContainer.style.height;
        return refData;
    }

    function isMeasureMapValid(newCompProps, oldCompProps){
        if (!_.isEqual(newCompProps.compData, oldCompProps.compData)){
            return false;
        }

        var propsToCheck = ['numCols', 'maxRows', 'margin'];
        return _.isEqual(_.pick(newCompProps.compProp, propsToCheck), _.pick(oldCompProps.compProp, propsToCheck));
    }

    /**
     * @class proxies.Gallery
     * @extends proxies.mixins.baseComposite
     */
    return {
        mixins: [baseCompositeProxy, templateBasedChildrenProxy],

        /**
         * @param {object} itemData - the data of the current gallery item
         * @param {int} itemIndex - the index of the the current data item out of items to be displayed in this page
         * @param {int} itemPageIndex - the page index of this item
         * @param {int} itemsPerPage - total items in this page (not necessarily rows*cols) - can be less if it's the last page
         * @param {object} additionalStyle - additional styling per item
         * @param {function(object): string} classSetFunc the component's classSet function that will be used in the item view to set component's css classes.
         * @returns {ReactComponent} builds each item in the gallery according to the item's template definition
         */
        createGalleryItem: function(galleryId, itemData, itemIndex, itemPageIndex, itemsPerPage, additionalStyle, classSetFunc){
            var columns = this.getCompProp('columns');
            var rows = this.getCompProp('rows');
            var gap = this.getCompProp('gap') || 0;
            var style = {
                position: "absolute",
                width: 'calc((100% - ' + ((columns - 1) * gap) + 'px) / ' + columns + ')',
                height: 'calc((100% - ' + ((rows - 1) * gap) + 'px) / ' + rows + ')'
            };

            if (additionalStyle){
                style = _.merge(style, additionalStyle);
            }

            var functionLibrary = {
                getComponentScopedClass: function (className) {
                    var classObj = {};
                    classObj[className] = true;
                    return classSetFunc(classObj);
                }
            };

            var childViewDef = this.getChildTemplateDefinition(itemIndex, itemsPerPage);
            var dataPath = this.getViewDefProp("data") || "this";

            var indexInData = _.indexOf(this.proxyData, itemData);
            var itemRef = this.getItemRef(galleryId, itemPageIndex, itemIndex);
            var props = this.getChildProxyProps(childViewDef, [dataPath, indexInData], {functionLibrary: functionLibrary});

            var displayerProps = {
                className: classSetFunc({galleryDisplayer: true}),
                'data-index': itemIndex
            };
            props = _.assign(props, displayerProps);

            return this.renderChildProxy(childViewDef, itemRef, style, props);
        },

        getItemRef: function(galleryId, itemPageIndex, itemIndex){
            return galleryId + itemPageIndex + "#" + itemIndex;
        },

        registerComponentReLayout: function () {
            this.refs.component.registerReLayout();
        },

        renderProxy: function () {
            var componentType = "wysiwyg.viewer.components.PaginatedGridGallery";
            var props = this.getChildCompProps(componentType, transformSkinProperties.bind(this));
            props.createGalleryItem = this.createGalleryItem;
            props.onAnimationCompleteCallback = this.registerComponentReLayout;
            props.getItemRef = this.getItemRef;

            props.compData = {items: this.proxyData};
            props.compProp = {
                'transition': this.getCompProp('transition'),
                'autoplayInterval': this.getCompProp('autoplayInterval'),
                'transDuration': this.getCompProp('transDuration') || 1,
                'numCols': this.getCompProp('columns'),
                'maxRows': this.getCompProp('rows'),
                'margin': this.getCompProp('gap'),
                'autoplay': this.getCompProp('autoplay'),
                'expandEnabled': this.getCompProp('expandEnabled'),
                'showAutoplay': this.getCompProp('showAutoplay'),
                'showNavigation': this.getCompProp('showNavigation') !== false,
                'showCounter': this.getCompProp('showCounter') !== false
            };
            props.style.position = "relative";
            props.key = this.getViewDefProp('id') + '_' + this.getCompProp('rows') + '_' + this.getCompProp('columns');

            var measureMap = this.props.viewProps.siteData.measureMap;
            if (measureMap && measureMap.height[props.id] && this.refs.component && isMeasureMapValid(props, this.refs.component.props)) {
                props.style.width = measureMap.width[props.id];
                props.style.height = measureMap.height[props.id];
            }

            return siteUtils.compFactory.getCompClass(componentType)(props);
        }
    };
});
