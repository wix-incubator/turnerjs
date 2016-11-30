define(["utils", "wixappsCore", "wixappsClassics/util/numberOfPostsPerPageGetter"], function (utils, /** wixappsCore */ wixapps, numberOfPostsPerPageGetter) {
    "use strict";

    var logicFactory = wixapps.logicFactory;
    var DEFAULT_PAGE_SIZE = 10,
        MOBILE_PAGE_SIZE = 3;

    var blogAppPartNames = utils.blogAppPartNames;

    /**
     * @class wixappsClassics.ListFromPageLogic
     * @param {wixappsClassics.appPartApi} partApi
     * @constructor
     */
    function ListFromPageLogic (partApi) {
        this.partApi = partApi;
    }

    ListFromPageLogic.prototype = {
        getViewVars: function () {
            var dataAspect = this.partApi.getDataAspect();
            var packageName = this.partApi.getPackageName();
            var compData = this.partApi.getPartData();

            var partExtraData = dataAspect.getExtraDataByCompId(packageName, compData.id);
            var format = this.partApi.getSiteData().isMobileView() ? 'Mobile' : '';
            var defaultPageSize = this.partApi.getSiteData().isMobileView() ? MOBILE_PAGE_SIZE : DEFAULT_PAGE_SIZE;

            var pageSize = numberOfPostsPerPageGetter.getNumberOfPostsPerPage(this.partApi.getPartData(), format, defaultPageSize) || DEFAULT_PAGE_SIZE;

            var pageCount = Math.ceil(partExtraData.totalCount / pageSize);
            var appPageParams = wixapps.wixappsUrlParser.getAppPageParams(this.partApi.getSiteData());
            var currentPage = (appPageParams && Number(appPageParams.page)) || 0;

            return {
                'pageCount': pageCount,
                'pageNum': currentPage,
                'hasPrev': currentPage > 0,
                'hasNext': currentPage < pageCount - 1
            };
        }
    };

    logicFactory.register(blogAppPartNames.FEED, ListFromPageLogic);
});
