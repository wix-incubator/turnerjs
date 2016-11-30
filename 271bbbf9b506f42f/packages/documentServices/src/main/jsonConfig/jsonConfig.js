define(['lodash',
    'documentServices/siteMetadata/siteMetadata',
    'documentServices/wixapps/utils/pathUtils',
    'documentServices/wixapps/utils/classicsPathUtils',
    'documentServices/constants/constants'], function
    (_, siteMetaData, wixappsPathUtils, classicsPathUtils, constants) {
    'use strict';

    var whiteList = ['pagesData', 'wixapps', 'editorData', 'mobileDeletedCompsMap', 'committedMobilePages',
        'textRuntimeLayout', 'deletedPagesMap', 'orphanPermanentDataNodes', 'dockedRuntimeLayout',
        'mobileStructures', 'contactforms_metadata', 'saveInvalidationCount', 'pagesPlatformApplications', 'routers'];

    var fullJsonPaths = ['pagesData'];
    var wixappsApplicationInstanceVersion = {
        path: wixappsPathUtils.getApplicationInstanceVersionPath(),
        optional: true
    };
    var wixappsMetaData = _.map(['blog', 'ecommerce', 'faq', 'menu'], function (packageName) {
        return {
            path: classicsPathUtils.getPackageMetaDataPath(packageName),
            optional: true
        };
    });
    var wixappsApplicationMetaData = {
        path: wixappsPathUtils.getPackageMetaDataPath(),
        optional: true
    };
    var documentServicesOrigin = {
        path: ['origin'],
        optional: true
    };

    var platform = {
        path: ['platform'],
        optional: true
    };

    var pagesWixCodeApplication = {
        path: ['pagesPlatformApplications', 'wixCode'],
        optional: true
    };

    var nonUndoableList = ['documentServicesModel', 'rendererModel', 'serviceTopology', 'urlFormatModel', 'runtime',
                            'compsToUpdateAnchors', 'svgShapes', 'renderFlags', 'renderRealtimeConfig', 'rootsRenderedInMobileEditor',
                            wixappsApplicationInstanceVersion, wixappsApplicationMetaData, documentServicesOrigin,
                            'wixCode', platform, pagesWixCodeApplication].concat(wixappsMetaData);

    // concatenate MetaData paths
    whiteList = whiteList.concat(siteMetaData.getRevertibleMetaDataInfo());
    nonUndoableList = nonUndoableList.concat(siteMetaData.getNonRevertibleMetaDataInfo());

    function getPath(item) {
        if (_.isString(item)) {
            return [item];
        } else if (_.isPlainObject(item)) {
            return item.path;
        }
        return item;
    }

    function convertToPathsArray(list) {
        return _.map(list, getPath);
    }

    function isOptional(item) {
        return !!item.optional;
    }

    return {
        getWhiteList: function () {
            return convertToPathsArray(whiteList);
        },
        getNonUndoableList: function () {
            return convertToPathsArray(nonUndoableList);
        },
        getPathsInJsonData: function () {
            var pathsConfig = {};
            var allPaths = whiteList.concat(nonUndoableList);
            var displayedJsonPaths = _.without(allPaths, fullJsonPaths);
            pathsConfig[constants.JSON_TYPES.DISPLAYED] = _.map(displayedJsonPaths, function (item) {
                return {
                    path: getPath(item),
                    optional: isOptional(item)
                };
            });
            pathsConfig[constants.JSON_TYPES.FULL] = [{
                path: fullJsonPaths,
                optional: false
            }];
            return pathsConfig;
        },
        getAutosavePaths: function () {
            return [
                'rendererModel.pageToHashedPassword',
                'rendererModel.siteMetaData',
                'pagesData',
                'orphanPermanentDataNodes',
                'documentServicesModel.metaSiteData',
                'documentServicesModel.customHeadTags'
            ];
        }
    };
});
