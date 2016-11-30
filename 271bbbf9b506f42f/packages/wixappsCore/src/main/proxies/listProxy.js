define([
    "lodash",
    "siteUtils",
    "wixappsCore/proxies/mixins/templateBasedChildrenProxy",
    "wixappsCore/proxies/mixins/baseCompositeProxy"
], function (
    _,
    siteUtils,
    templateBasedChildrenProxy,
    baseCompositeProxy
) {
    'use strict';

    /**
     * @class proxies.list
     * @extends proxies.baseComposite
     */
    return {
        mixins: [baseCompositeProxy, templateBasedChildrenProxy],

        getDefaultProps: function () {
            return {};
        },

        getInitialState: function () {
            return {
                currentPage: 1
            };
        },

        prevPageClicked: function () {
            setCurrentPage.call(this, getPrevPage.call(this));
        },
        nextPageClicked: function () {
            setCurrentPage.call(this, getNextPage.call(this));
        },

        renderProxy: function () {
            var data = this.proxyData;
            var childrenCount = data.length;
            var templatesVars = this.getCompProp('templates') ? this.getCompProp('templates.vars') : {};

            var pageSize;
            var isHidingPagination = this.getCompProp('hidePagination');
            if (!isHidingPagination){
                pageSize = this.getCompProp("itemsPerPage");
            }
            // no pagination
            var first = 0;
            var last = childrenCount;
            var totalPages = 1;
            var currentPage = this.state.currentPage;

            // yes pagination
            if (!_.isUndefined(pageSize)) {
                first = (currentPage - 1) * pageSize;
                last = Math.min(first + pageSize, childrenCount);
                totalPages = Math.ceil(childrenCount / pageSize);
            }

            var pageData = data.slice(first, last);
            var pageDataLength = pageData.length;
            var children = _.map(pageData, function (child, i) {
                var positionInParent = 'middle';
                if (i === 0 && pageDataLength > 1) {
                    positionInParent = 'first';
                } else if (i === pageDataLength - 1) {
                    positionInParent = 'last';
                }

                var positionInParentVars = {
                    indexInParent: i,
                    indexOneInParent: i + 1,
                    positionInParent: positionInParent,
                    isOddIndexInParent: i % 2 === 1,

                    // pagination vars
                    currentPage: currentPage,
                    maxPage: totalPages,
                    hasNext: currentPage !== totalPages,
                    hasPrev: currentPage !== 1,
                    hidePagination: this.getCompProp("hidePagination")
                };
                positionInParentVars = _.merge({}, templatesVars, positionInParentVars);

                var paginationEventHandlers = {
                    prevPageClicked: this.prevPageClicked,
                    nextPageClicked: this.nextPageClicked,
                    numberedPageClicked: _.bind(numberedPageClicked, this)
                };

                var dataPath = this.getViewDefProp("data") || "this";
                var childViewDef = this.getChildTemplateDefinition(i, pageDataLength);

                var extraContextProps = {
                    vars: {
                        proxy: positionInParentVars
                    },
                    events: paginationEventHandlers
                };
                var indexInData = first + i;
                var childProps = this.getChildProxyProps(childViewDef, [dataPath, indexInData], extraContextProps);

                childProps["data-isfirst"] = i === 0;
                childProps["data-iseven"] = i % 2 === 1;
                childProps["data-islast"] = i === pageDataLength - 1;

                childProps.proxyParentId = this.props.viewDef.id + "_" + indexInData;

                return this.renderChildProxy(childViewDef, indexInData, this.props.childAdditionalStyle, childProps);
            }, this);

            var props = this.getChildCompProps("wysiwyg.viewer.components.VerticalRepeater");
            props.style = _.merge(props.style, this.props.additionalStyle);

            return siteUtils.compFactory.getCompClass("wysiwyg.viewer.components.VerticalRepeater")(props, children);
        }
    };

    function numberedPageClicked(event) {
        setCurrentPage.call(this, event.params.page);
    }

    function setCurrentPage(page) {
        this.setState({currentPage: page});
        this.props.viewProps.siteAPI.registerReLayoutPending();
    }

    function getPrevPage() {
        return this.state.currentPage === 1 ? getTotal.call(this) : this.state.currentPage - 1;
    }

    function getNextPage() {
        return this.state.currentPage === getTotal.call(this) ? 1 : this.state.currentPage + 1;
    }

    function getTotal() {
        var childrenCount = this.proxyData.length;
        var pageSize = this.getCompProp("itemsPerPage");
        return Math.ceil(childrenCount / pageSize);
    }
});
