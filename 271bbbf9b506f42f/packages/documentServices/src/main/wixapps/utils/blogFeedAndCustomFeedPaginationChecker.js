define([
    'documentServices/dataModel/dataModel',
    'documentServices/wixapps/utils/classicsPathUtils',
    'lodash',
    'utils',
    'wixappsClassics'
], function (
    dataModel,
    classicsPathUtils,
    _,
    utils,
    wixappsClassics
) {
    'use strict';

    var blogAppPartNames = utils.blogAppPartNames;
    var numberOfPostsPerPageGetter = wixappsClassics.numberOfPostsPerPageGetter;

    return {
        blogFeedOrCustomFeedHasPagination: function (ps, compRef) {
            var compData = dataModel.getDataItem(ps, compRef);
            switch (compData.appPartName) {
                case blogAppPartNames.FEED:
                    return feedHasPagination(ps, compData);
                case blogAppPartNames.CUSTOM_FEED:
                    return customFeedHasPagination(ps, compData);
            }
        }
    };

    function feedHasPagination(ps, compData) {
        var extraDataPath = classicsPathUtils.getAppPartExtraDataPath(getBlogPackageName(), compData.id);
        var extraData = ps.dal.getByPath(extraDataPath);
        return _.get(extraData, 'totalCount') > getDefaultNumberOfPostsPerPage();
    }

    function customFeedHasPagination(ps, compData) {
        var dataPath = classicsPathUtils.getAppPartDataPath(getBlogPackageName(), compData.id);
        var data = ps.dal.getByPath(dataPath);
        var numberOfPostsPerPage = numberOfPostsPerPageGetter.getNumberOfPostsPerPage(compData);
        return _.get(data, 'length') > numberOfPostsPerPage;
    }

    function getBlogPackageName() {
        return 'blog';
    }

    function getDefaultNumberOfPostsPerPage() {
        return 10;
    }
});
