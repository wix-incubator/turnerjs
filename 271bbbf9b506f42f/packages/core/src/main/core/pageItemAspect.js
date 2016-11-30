define(['lodash', 'santaProps', 'core/core/pageItemRegistry', 'siteUtils', 'core/core/siteAspectsRegistry'],
    function (_, santaProps, /** core.pageItemRegistry */ pageItemRegistry, siteUtils, /** core.siteAspectsRegistry */ siteAspectsRegistry) {
        "use strict";

        function tryToParsePageItemAdditionalData(rawAdditionalData) {
            var statementsSeparator = ' ';
            var keyValuesSeparator = ':';
            var parsedPageItemAdditionalData = {};
            if (!rawAdditionalData) {
                return;
            }

            var statements = rawAdditionalData.split(statementsSeparator);
            _.forEach(statements, function (statement) {
                var keyValueArr = statement.split(keyValuesSeparator);
                if (keyValueArr[0] && keyValueArr[1]) {
                    parsedPageItemAdditionalData[keyValueArr[0]] = keyValueArr[1];
                }
            });

            return (_.isEmpty(parsedPageItemAdditionalData)) ? rawAdditionalData : parsedPageItemAdditionalData;
        }

        function getPageItemComp(siteData, structure, siteAPI, loadedStyles) {
            var pageId = siteData.getFocusedRootId();
            var pageItemInfo = siteData.getExistingRootNavigationInfo(pageId);
            var parsedPageItemAdditionalData = tryToParsePageItemAdditionalData(pageItemInfo.pageItemAdditionalData);
            var props = santaProps.componentPropsBuilder.getCompProps(structure, siteAPI, pageId, loadedStyles);

            if (_.isPlainObject(parsedPageItemAdditionalData)) {
                var galleryData = siteData.getDataByQuery(parsedPageItemAdditionalData.galleryId) || parsedPageItemAdditionalData.galleryId;

                if (galleryData) {
                    props.pageItemAdditionalData = galleryData;
                }
            } else {
                props.pageItemAdditionalData = parsedPageItemAdditionalData;
            }

            var compConstructor = siteUtils.compFactory.getCompClass(structure.componentType);
            return compConstructor(props);
        }

        function getPageItemStructure(pageItemInfo, siteData) {
            var dataItem = siteData.getDataByQuery(pageItemInfo.pageItemId);
            if (!dataItem) {
                return null;
            }

            var parsedPageItemAdditionalData = tryToParsePageItemAdditionalData(pageItemInfo.pageItemAdditionalData);
            var propertyQuery = parsedPageItemAdditionalData && parsedPageItemAdditionalData.propertyQuery;
            var structure = pageItemRegistry.getCompStructure(dataItem.type, dataItem, propertyQuery, siteData);
            if (!structure) {
                return null;
            }
            return structure;
        }

        /**
         *
         * @param {core.SiteAspectsSiteAPI} aspectSiteAPI
         * @implements {core.SiteAspectInterface}
         * @constructor
         */
        function PageItemAspect(aspectSiteAPI) {
            /** @type {core.SiteAspectsSiteAPI} */
            this._aspectSiteAPI = aspectSiteAPI;
        }

        PageItemAspect.prototype = {
            getReactComponents: function (loadedStyles) {
                var siteData = this._aspectSiteAPI.getSiteData();
                var pageItemInfo = siteData.getExistingRootNavigationInfo(siteData.getFocusedRootId());

                var structure = getPageItemStructure(pageItemInfo, siteData);
                if (!structure) {
                    return null;
                }
                return [getPageItemComp(siteData, structure, this._aspectSiteAPI.getSiteAPI(), loadedStyles)];
            },

            getComponentStructures: function () {
                var siteData = this._aspectSiteAPI.getSiteData();
                var pageItemInfo = siteData.getExistingRootNavigationInfo(siteData.getFocusedRootId());
                var structure = getPageItemStructure(pageItemInfo, siteData);
                return structure ? [structure] : null;
            }
        };

        siteAspectsRegistry.registerSiteAspect('pageItem', PageItemAspect);
    });
