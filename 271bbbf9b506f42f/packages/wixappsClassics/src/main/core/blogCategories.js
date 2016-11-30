define([
    'lodash',
    'utils',
    'wixappsCore',
    'wixappsClassics/core/data/converters/mediaPostConverter',
    'wixappsClassics/core/timeout',
    'wixappsClassics/core/transformAndSetMetaData'
], function (
    _,
    utils,
    wixappsCore,
    mediaPostConverter,
    TIMEOUT,
    transformAndSetMetaData
) {
    'use strict';

    var urlUtils = utils.urlUtils;
    var wixappsDataHandler = wixappsCore.wixappsDataHandler;

    function queryBlogCategories(siteData, compData, appService) {
        if (appService.packageName !== 'blog') {
            return [];
        }

        var PATH = ['wixapps', 'blog', 'hasCategoriesRequested'];

        if (_.get(siteData, PATH)) {
            return [];
        }

        _.set(siteData, PATH, true);

        var url = urlUtils.baseUrl(siteData.getExternalBaseUrl()) + '/apps/lists/1/Query?consistentRead=false';

        var data = {
            collectionId: 'Settings',
            filter: {_iid: 'categories'},
            storeId: appService.datastoreId
        };

        var transformFunc = function (responseData, currentValue) {
            var categories = _.get(responseData.payload, 'items[0].categories');
            if (categories) {
                var orderedCategories = [];
                var categoryById = {};
                _.forEach(categories, function (category) {
                    orderedCategories.push(category);
                    categoryById[category.id] = category;
                    _.forEach(category.subcategories, function (subcategory) {
                        orderedCategories.push(subcategory);
                        categoryById[subcategory.id] = subcategory;
                    });
                });

                currentValue.categories = {
                    categories: categories,
                    orderedCategories: orderedCategories,
                    categoryById: categoryById
                };
            } else {
                currentValue.categories = {};
            }
            mediaPostConverter.resolveCategories(currentValue);
            return currentValue;
        };

        return [{
            force: true,
            destination: wixappsDataHandler.getSiteDataDestination(appService.packageName),
            url: url,
            data: data,
            transformFunc: transformAndSetMetaData.bind(this, transformFunc, siteData, appService.packageName, compData.id),
            timeout: TIMEOUT
        }];
    }

    function getCategoryIds(category) {
        var subcategoryIds = _.map(category.subcategories, 'id');
        return [category.id].concat(subcategoryIds);
    }

    function extendParamsWithBlogCategoryFilter(siteData, params) {
        var categoryNames = params.categoryNames && JSON.parse(params.categoryNames);
        if (categoryNames) {
            var areCategoriesReady = wixappsDataHandler.getBlogCategories(siteData);
            if (!areCategoriesReady) {
                return false;
            }

            var categoryIds = [];
            _.forEach(categoryNames, function (name) {
                var category = wixappsDataHandler.getBlogCategoryByName(siteData, name);
                if (category) {
                    categoryIds = categoryIds.concat(getCategoryIds(category));
                }
            });

            if (!params.filter) {
                params.filter = {};
            }
            params.filter.categoryIds = {$in: categoryIds};
        }

        return true;
    }

    function queryBlogCategoryPostCounts(siteData, compData, appService) {
        var categoryStore = wixappsDataHandler.getBlogCategories(siteData);

        if (!categoryStore) { // Are categories unready?
            return [];
        }

        if (!categoryStore.categoriesWithUnresolvedPostCounts) { // Is post counting unstarted?
            categoryStore.categoriesWithUnresolvedPostCounts =
                categoryStore.orderedCategories ? _.cloneDeep(categoryStore.orderedCategories) : [];
            categoryStore.postCountById = {};
        } else if (categoryStore.isPostCountingInProgress) {
            return [];
        }

        var packageName = appService.packageName; // Actually it's always "blog".

        var packageData = wixappsDataHandler.getPackageData(siteData, packageName);

        var compId = compData.id;

        if (categoryStore.categoriesWithUnresolvedPostCounts.length === 0) { // Is post counting complete?
            var DATA_PATH_FRAGMENT = 'categoriesWithPostCounts';

            // Ensure that categories with post counts are created.
            var DATA_PATH = ['items', DATA_PATH_FRAGMENT];
            if (!_.get(packageData, DATA_PATH)) {
                var categoriesWithPostCounts = _.cloneDeep(categoryStore.categories) || [];

                var resolvePostCount = function (category) {
                    category.postCount = categoryStore.postCountById[category.id];
                };

                _.forEach(categoriesWithPostCounts, function (category) {
                    resolvePostCount(category);
                    _.forEach(category.subcategories, resolvePostCount);
                });

                _.set(packageData, DATA_PATH, categoriesWithPostCounts);
            }

            // Use the categories with post counts as data for the component.
            packageData[compId] = [DATA_PATH_FRAGMENT];

            return [];
        }

        categoryStore.isPostCountingInProgress = true;

        var MAX_OPERATIONS_PER_BATCH = 24;
        var categoriesToBeResolved = categoryStore.categoriesWithUnresolvedPostCounts.splice(0, MAX_OPERATIONS_PER_BATCH);
        // Batch request may be quite heavy so that a limit for number of operations is used to minimize chance of
        // catching timeout.

        // Query post count for each category.
        var batchOperations = _.map(categoriesToBeResolved, function (category) {
            return {
                name: 'Query',
                params: {
                    collectionId: 'Posts',
                    fields: [''], // Avoid returning post data - the response will contain only meta fields (like _iid).
                    filter: {
                        categoryIds: {$in: getCategoryIds(category)},
                        'date.iso': {$lte: '$now'}, // Don't count scheduled posts.
                        deleted: {$ne: true}, // Don't count deleted posts.
                        draft: {$ne: true} // Don't count draft posts.
                    },
                    getTotalCount: true,
                    limit: 1, // A smaller number has no effect.
                    storeId: appService.datastoreId
                }
            };
        });

        function transformResponse(responseData, currentValue) {
            // The category store from above can be obsolete if page JSON revision changes.
            var currentCategoryStore = wixappsDataHandler.getBlogCategoriesFromPackageData(currentValue);
            if (_.get(currentCategoryStore, 'isPostCountingInProgress')) {
                delete currentCategoryStore.isPostCountingInProgress;
                _.forEach(responseData.payload.results, function (result, index) {
                    var category = categoriesToBeResolved[index];
                    currentCategoryStore.postCountById[category.id] = result.payload.totalCount;
                });
            }

            return currentValue;
        }

        return [{
            force: true,
            destination: wixappsDataHandler.getSiteDataDestination(packageName),
            url: urlUtils.baseUrl(siteData.getExternalBaseUrl()) + '/apps/lists/1/Batch?consistentRead=false',
            data: {operations: batchOperations},
            transformFunc: transformAndSetMetaData.bind(this, transformResponse, siteData, packageName, compId),
            timeout: TIMEOUT
        }];
    }

    return {
        queryBlogCategories: queryBlogCategories,
        extendParamsWithBlogCategoryFilter: extendParamsWithBlogCategoryFilter,
        queryBlogCategoryPostCounts: queryBlogCategoryPostCounts
    };
});
