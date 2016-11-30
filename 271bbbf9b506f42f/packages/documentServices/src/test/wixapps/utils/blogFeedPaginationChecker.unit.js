define([
    'documentServices/component/component',
    'documentServices/dataModel/dataModel',
    'documentServices/mockPrivateServices/privateServicesHelper',
    'documentServices/page/page',
    'documentServices/page/pageUtils',
    'documentServices/wixapps/utils/blogFeedAndCustomFeedPaginationChecker',
    'documentServices/wixapps/utils/classicsPathUtils',
    'lodash',
    'testUtils',
    'packages/documentServices/src/test/wixapps/utils/blogFeedPaginationCheckerData.json.js'
], function (
    component,
    dataModel,
    privateServicesHelper,
    page,
    pageUtils,
    blogFeedAndCustomFeedPaginationChecker,
    classicsPathUtils,
    _,
    testUtils,
    blogFeedPaginationCheckerData
) {
    'use strict';

    describe('blogFeedAndCustomFeedPaginationChecker', function () {
        describe('for feed', function () {
            it('should return false if total number of posts is less than or equal to 10', function () {
                this.expectFeedToHavePagination({totalNumberOfPosts: 9}, false);
                this.expectFeedToHavePagination({totalNumberOfPosts: 10}, false);
            });

            it('should return true if total number of posts is greater than 10', function () {
                this.expectFeedToHavePagination({totalNumberOfPosts: 11}, true);
                this.expectFeedToHavePagination({totalNumberOfPosts: 12}, true);
            });

            it('should return false if total number of posts is undefined', function () {
                this.expectFeedToHavePagination({}, false);
            });
        });

        describe('for custom feed', function () {
            describe('if number of posts per page is undefined', function () {
                it('should return false if total number of posts is less than or equal to 10', function () {
                    this.expectCustomFeedToHavePagination({totalNumberOfPosts: 9}, false);
                    this.expectCustomFeedToHavePagination({totalNumberOfPosts: 10}, false);
                });

                it('should return true if total number of posts is greater than 10', function () {
                    this.expectCustomFeedToHavePagination({totalNumberOfPosts: 11}, true);
                    this.expectCustomFeedToHavePagination({totalNumberOfPosts: 12}, true);
                });
            });

            describe('if number of posts per page is defined', function () {
                it('should return false if total number of posts is less than or equal to the number of posts per page', function () {
                    this.expectCustomFeedToHavePagination({numberOfPostsPerPage: 15, totalNumberOfPosts: 14}, false);
                    this.expectCustomFeedToHavePagination({numberOfPostsPerPage: 15, totalNumberOfPosts: 15}, false);
                });

                it('should return true if total number of posts is greater than the number of posts per page', function () {
                    this.expectCustomFeedToHavePagination({numberOfPostsPerPage: 15, totalNumberOfPosts: 16}, true);
                    this.expectCustomFeedToHavePagination({numberOfPostsPerPage: 15, totalNumberOfPosts: 17}, true);
                });
            });

            it('should return false if total number of posts is undefined', function () {
                this.expectCustomFeedToHavePagination({}, false);
            });
        });

        beforeEach(function () {
            this.expectFeedToHavePagination = function (options, expected) {
                var ps = getPrivateServices();
                var compRef = addComponent(ps, getFeedDefinition());

                if (options.totalNumberOfPosts) {
                    setFeedTotalNumberOfPosts(ps, compRef, options.totalNumberOfPosts);
                }

                var actual = blogFeedAndCustomFeedPaginationChecker.blogFeedOrCustomFeedHasPagination(ps, compRef);
                expect(actual).toBe(expected);
            };

            function getFeedDefinition() {
                return blogFeedPaginationCheckerData.d1;
            }

            function setFeedTotalNumberOfPosts(ps, compRef, totalNumberOfPosts) {
                var compData = dataModel.getDataItem(ps, compRef);
                var extraDataPath = classicsPathUtils.getAppPartExtraDataPath(getBlogPackageName(), compData.id);
                var extraData = {totalCount: totalNumberOfPosts};
                ps.dal.full.setByPath(extraDataPath, extraData);
            }

            this.expectCustomFeedToHavePagination = function (options, expected) {
                var ps = getPrivateServices();
                var compRef = addComponent(ps, getCustomFeedDefinition());

                if (options.totalNumberOfPosts) {
                    setCustomFeedTotalNumberOfPosts(ps, compRef, options.totalNumberOfPosts);
                }

                if (options.numberOfPostsPerPage) {
                    setCustomFeedNumberOfPostsPerPage(ps, compRef, options.numberOfPostsPerPage);
                }

                var actual = blogFeedAndCustomFeedPaginationChecker.blogFeedOrCustomFeedHasPagination(ps, compRef);
                expect(actual).toBe(expected);
            };

            function getPrivateServices() {
                return privateServicesHelper.mockPrivateServicesWithRealDAL(getSiteData());
            }

            function getSiteData() {
                var isDocumentServices = true;
                return testUtils.mockFactory.mockSiteData(getSiteModel(), isDocumentServices);
            }

            function getSiteModel() {
                var siteModel = {};
                var blogPackagePath = classicsPathUtils.getPackagePath(getBlogPackageName());
                return _.set(siteModel, blogPackagePath, {});
            }

            function addComponent(ps, definition) {
                var compRef = component.getComponentToAddRef(ps, getContainerRef(ps), definition);
                component.add(ps, compRef, getContainerRef(ps), definition);
                return compRef;
            }

            function getContainerRef(ps) {
                return page.getPage(ps, pageUtils.getHomepageId(ps));
            }

            function getCustomFeedDefinition() {
                return blogFeedPaginationCheckerData.d2;
            }

            function setCustomFeedTotalNumberOfPosts(ps, compRef, totalNumberOfPosts) {
                var compData = dataModel.getDataItem(ps, compRef);
                var dataPath = classicsPathUtils.getAppPartDataPath(getBlogPackageName(), compData.id);
                var data = _.fill(Array(totalNumberOfPosts), []);
                ps.dal.full.setByPath(dataPath, data);
            }

            function getBlogPackageName() {
                return 'blog';
            }

            function setCustomFeedNumberOfPostsPerPage(ps, compRef, numberOfPostsPerPage) {
                var compData = dataModel.getDataItem(ps, compRef);
                compData.appLogicCustomizations = _(compData.appLogicCustomizations)
                    .push({
                        fieldId: 'vars',
                        key: 'itemsPerPage',
                        view: compData.viewName,
                        value: numberOfPostsPerPage
                    })
                    .shuffle()
                    .value();
                dataModel.updateDataItem(ps, compRef, compData);
            }
        });
    });
});
