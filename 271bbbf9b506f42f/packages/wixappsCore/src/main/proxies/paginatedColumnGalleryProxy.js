define(["lodash", "core", "react", "utils", "wixappsCore/proxies/mixins/templateBasedChildrenProxy", "wixappsCore/proxies/mixins/baseCompositeProxy"], function (_, /** core */core, React, utils, templateBasedChildrenProxy, baseCompositeProxy) {
    'use strict';

    var galleryPagingCalculations = core.componentUtils.galleryPagingCalculations;

    /**
     * @class proxies.ColumnGalleryProxy
     * @extends proxies.mixins.baseComposite
     */
    return {
        mixins: [baseCompositeProxy, templateBasedChildrenProxy],

        componentWillUpdate: function(nextProps){
            var nextMaxPage = Math.ceil(this.proxyData.length / this.getItemsNumberPerPage(nextProps));
            var maxPage = this.getVar("maxPage");
            if (nextMaxPage !== maxPage){
                this.setVar("maxPage", nextMaxPage, true);
            }
        },

        componentWillMount: function(){
            var maxPage = Math.ceil(this.proxyData.length / this.getItemsNumberPerPage(this.props));
            this.setVar("maxPage", maxPage, true);
        },

        getItemsNumberPerPage: function(props){
            var itemsPerPage = parseInt(this.getCompProp('itemsPerPage', props.viewDef), 10);
            if (_.isNaN(itemsPerPage) || (!_.isNaN(itemsPerPage) && itemsPerPage >= this.proxyData.length)){
                itemsPerPage = this.proxyData.length;
            }
            return itemsPerPage;
        },

        createChildProxy: function(indexInData, itemsPerPage, cols){
            var dataPath = this.getViewDefProp("data") || "this";
            var childViewDef = this.getChildTemplateDefinition(indexInData, itemsPerPage);

            var props = this.getChildProxyProps(childViewDef, [dataPath, indexInData], {});

            return React.DOM.div({
                key: indexInData,
                style: _.assign({
                    display: "inline-block",
                    verticalAlign: "top",
                    width: (100 / cols) + "%"
                }, utils.style.prefix({
                    boxSizing: "border-box"
                }))
            }, this.renderChildProxy(childViewDef, indexInData, null, props));
        },

        getCurrentPositionInData: function(itemsPerPage, currentPage){
            if (itemsPerPage === this.proxyData.length){
                return 0;
            }
            return currentPage * itemsPerPage;
        },

        getCurrentPage: function(){
            var currentPage = this.getVar("currentPage") || 1;
            currentPage = parseInt(currentPage, 10) - 1; //convert to zero based pages
            return currentPage;
        },

        renderProxy: function () {
            var itemsPerPage = this.getItemsNumberPerPage(this.props);
            var currentPage = this.getCurrentPage();
            var startIndex = this.getCurrentPositionInData(itemsPerPage, currentPage);
            var cols = this.getCompProp('columns') || 3;

            var children = [];
            var lastIndex = galleryPagingCalculations.getLastItemIndex(this.proxyData, startIndex, itemsPerPage);
            for (var i = startIndex; i <= lastIndex; i++){
                children.push(this.createChildProxy(i, itemsPerPage, cols));
            }

            var props = this.getChildCompProps();
            props['data-proxy-name'] = "PaginatedColumnGalleryProxy";
            props['data-direction'] = this.getVar("partDirection") || "ltr";
            props['data-horizontal-gap'] = this.getCompProp('horizontalGap') || 0;
            props['data-vertical-gap'] = this.getCompProp('verticalGap') || 0;
            props['data-columns'] = cols;

            return React.DOM.div(props, children);
        }
    };
});
