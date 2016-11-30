define([
    'utils',
    'wixappsClassics/util/appPartCommonDataManager',
    'wixappsClassics/util/numberOfPostsPerPageGetter',
    'wixappsCore'
], function (
    utils,
    appPartCommonDataManager,
    numberOfPostsPerPageGetter,
    wixappsCore
) {
    'use strict';

    function CustomFeedLogic(partApi) {
        this.partApi = partApi;
    }

    CustomFeedLogic.prototype.getViewVars = function () {
        return {
            currentPageNumber: getCurrentPageNumber.call(this),
            numberOfPostsPerPage: getNumberOfPostsPerPage.call(this),
            totalNumberOfPages: getTotalNumberOfPages.call(this)
        };
    };

    CustomFeedLogic.prototype.handlePageNavigationRequest = function (request) {
        setCurrentPageNumber.call(this, request.params.pageNumber);
        refetchData.call(this, this.partApi.refreshPart);
    };

    wixappsCore.logicFactory.register(utils.blogAppPartNames.CUSTOM_FEED, CustomFeedLogic);

    function getTotalNumberOfPages() {
        return Math.ceil(getTotalNumberOfPosts.call(this) / getNumberOfPostsPerPage.call(this));
    }

    function getTotalNumberOfPosts() {
        return getExtraData.call(this).totalCount;
    }

    function getExtraData() {
        return this.partApi.getDataAspect().getExtraDataByCompId(this.partApi.getPackageName(), getCompId.call(this));
    }

    function getNumberOfPostsPerPage() {
        return numberOfPostsPerPageGetter.getNumberOfPostsPerPage(this.partApi.getPartData());
    }

    function getCurrentPageNumber() {
        return appPartCommonDataManager.getAppPartCommonDataItem(getCompId.call(this), 'currentPageNumber', 1);
    }

    function setCurrentPageNumber(pageNumber) {
        appPartCommonDataManager.setAppPartCommonDataItem(getCompId.call(this), 'currentPageNumber', pageNumber);
    }

    function getCompId() {
        return this.partApi.getPartData().id;
    }

    function refetchData(callback) {
        this.partApi.getSiteDataApi().refreshRenderedRootsData(callback);
    }
});
