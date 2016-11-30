
define(['lodash', 'coreUtils', 'experiment'], function (_, coreUtils, experiment) {
    'use strict';

    function translateSEOIdToPageId(id, siteData) {
        if (id === '#') {
            return siteData.getPrimaryPageId();
        }
        var pageData = siteData.findDataOnMasterPageByPredicate(function (dataItem) {
            return dataItem.pageUriSEO === id.replace('#', '');
        });
        return _.get(pageData, 'id', id);
    }

    function getDynamicPageLink(id, siteData) {
        var urlParts = _.compact(id.replace(/^#/, '').split('/'));
        var routerId = _.findKey(siteData.getRouters(), {prefix: urlParts[0]});
        if (routerId) {
            return {
                type: 'DynamicPageLink',
                routerId: routerId,
                innerRoute: urlParts.slice(1).join('/')
            };
        }
    }

    function getLinksInDataRecursively(data) {
        var result = [];

        var link = _.get(data, 'link');
        if (link) {
            result.push(link);
        }
        var linkList = _.get(data, 'linkList');
        if (linkList) {
            result = result.concat(linkList);
        }

        _.forEach(data, function(propertyVal) {
            if (_.isObject(propertyVal)) {
                result = result.concat(getLinksInDataRecursively(propertyVal));
            }
        });

        return result;
    }

    function getGridLinks(data, props) {
        var linkPaths = _.reduce(props.columns, function(paths, columnDef) {
            if (columnDef.linkPath) {
                paths.push(columnDef.linkPath);
            }
            return paths;
        }, []);
        var linkObjects = [];
        if (linkPaths.length > 0) {
            _.forEach(data.rows, function (row) {
                _.forEach(linkPaths, function (linkPath) {
                    var linkObjPath = linkPath + '_linkObj';
                    var linkObj = _.get(row, linkObjPath);
                    if (!_.isUndefined(linkObj)) {
                        linkObjects.push(linkObj);
                    }
                });
            });
        }
        return linkObjects;
    }

    function resolve(data, siteAPI, compProps) {
        var siteData = siteAPI.getSiteData();
        var linksData;
        if (data.type === 'Grid') {
            linksData = getGridLinks(data, compProps);
        } else {
            linksData = getLinksInDataRecursively(data);
        }
        _.forEach(linksData, function (link) {
            var originalLinkType = link.type;
            var originalPageId = link.pageId;
            if (originalLinkType === 'PageLink' || originalLinkType === 'AnchorLink') {
                if (_.isString(originalPageId)) {
                    if (experiment.isOpen('sv_dpages')) {
                        var dynamicLink = getDynamicPageLink(link.pageId, siteData);
                        if (dynamicLink) {
                            _.assign(link, dynamicLink);
                            delete link.pageId;
                        } else {
                            link.pageId = translateSEOIdToPageId(originalPageId, siteData);
                        }
                    } else {
                        link.pageId = translateSEOIdToPageId(originalPageId, siteData);
                    }
                }
                var anchorNickname = link.anchorDataId;
                if (_.isString(anchorNickname) && !_.includes(coreUtils.siteConstants.SAME_PAGE_SCROLL_ANCHORS, anchorNickname) && !_.startsWith(anchorNickname, 'dataItem')) {
                    originalPageId = _.isString(link.pageId) ? link.pageId : link.pageId.id;
                    var anchorComp = coreUtils.scrollAnchors.getAnchor(anchorNickname, originalPageId, siteData);
                    link.anchorDataId = anchorComp.dataQuery;
                }
            }
        });

        return data;
    }

    return {
        resolve: resolve
    };
});
