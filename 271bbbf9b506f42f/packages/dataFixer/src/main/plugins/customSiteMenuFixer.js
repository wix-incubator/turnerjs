define(['lodash'], function (_) {
    'use strict';

    var bmiCnt = 0;
    var pglkCnt = 0;

    var BMI = "bmi";
    var PGLK = "pglk";

    function convertOldMenuToNewMenu(rawData, siteData) {
        return _.map(rawData, function (data) {
            return saveMenuItem(siteData, data);
        });
    }

    function saveMenuItem(siteData, data) {
        var id = BMI + (bmiCnt++);
        var pageData = siteData[data.refId.replace('#', '')];
        siteData[id] = {
            id: id,
            label: pageData.title,
            isVisible: !pageData.hidePage,
            isVisibleMobile: pageData.mobileHidePage !== undefined ? !pageData.mobileHidePage : !pageData.hidePage,
            items: convertOldMenuToNewMenu(data.items, siteData),
            link: saveLinkItem(siteData, data.refId),
            type: 'BasicMenuItem',
            metaData: {}
        };

        return '#' + id;
    }

    function saveLinkItem(siteData, refId) {
        var id = PGLK + (pglkCnt++);

        siteData[id] = {
            id: id,
            type: 'PageLink',
            pageId: refId,
            metaData: {}
        };


        return '#' + id;
    }

    function getDataItem(documentData, id) {
        return id && documentData[id.replace('#', '')];
    }

    function setHeaderLink(basicMenuItemId, basicMenuItem) {
        basicMenuItem.link = '#CUSTOM_MENU_HEADER';
    }

    function isInvalidPageLink(documentData, basicMenuItem) {
        var linkItem = getDataItem(documentData, basicMenuItem.link);
        return linkItem && linkItem.type === 'PageLink' && !getDataItem(documentData, linkItem.pageId);
    }

    function convertMenuItemsOfNonExistingPagesToHeaders(documentData, dataItem) {
        _.forEach(dataItem.items, function (basicMenuItemId) {
            var basicMenuItem = getDataItem(documentData, basicMenuItemId);
            if (!basicMenuItem.link || isInvalidPageLink(documentData, basicMenuItem)) {
                setHeaderLink(basicMenuItemId, basicMenuItem);
            }
            convertMenuItemsOfNonExistingPagesToHeaders(documentData, basicMenuItem);
        });
    }

    function removeMenuDataItems(pageJson) {
        _(pageJson.data.document_data)
            .where({type: "Menu"})
            .pluck('id')
            .forEach(function (pageId) {
                delete pageJson.data.document_data[pageId];
            })
            .value();
    }

    function isJsonForPage(pageJson) {
        return pageJson && pageJson.structure && pageJson.structure.type === 'Page';
    }

    function sanitizeId(str) {
        return str.replace('#', '');
    }

    function addMissingPageIdsToMenu(docData, pageIdsInSite) {
        var customMenuItems = docData.CUSTOM_MAIN_MENU.items;
        var pageIdsInMenu = _(docData)
            .filter({type: 'BasicMenuItem'})
            .map('link')
            .compact()
            .map(sanitizeId)
            .map(function(linkItemId){return docData[linkItemId];})
            .map('pageId')
            .compact()
            .map(sanitizeId)
            .value();

        var pagesMissingFromMenu = _.difference(pageIdsInSite, pageIdsInMenu);
        _.forEach(pagesMissingFromMenu, function (missingPageId) {
            if (docData[missingPageId].isPopup) {
                return;
            }
            customMenuItems.push(createMenuItem(docData, missingPageId));
        });
    }

    function createMenuItem(siteData, pageId) {
        var id = BMI + (bmiCnt++);
        var pageData = siteData[pageId];
        siteData[id] = {
            id: id,
            label: pageData.title,
            isVisible: !pageData.hidePage,
            isVisibleMobile: pageData.mobileHidePage !== undefined ? !pageData.mobileHidePage : !pageData.hidePage,
            items: [],
            link: saveLinkItem(siteData, "#" + pageId),
            type: 'BasicMenuItem',
            metaData: {}
        };

        return '#' + id;
    }

    function getInitDataIndexCounts(siteData, countId) {
        var indexedDataItems = _.filter(siteData, function (item) {
            return item.id && item.id.indexOf(countId) === 0;
        });
        var maxBmiId = -1;
        _.forEach(indexedDataItems, function (item) {
            var currentIndex = Number(item.id.replace(countId, ''));
            if (currentIndex > maxBmiId) {
                maxBmiId = currentIndex;
            }
        });
        return ++maxBmiId;
    }

    /**
     * @exports utils/dataFixer/plugins/customSiteMenuFixer
     * @type {{exec: exec}}
     */
    var exports = {
        exec: function (pageJson, pageIdsArray) {
            if (isJsonForPage(pageJson)) {
                removeMenuDataItems(pageJson);
                return;
            }

            var docData = pageJson.data.document_data;
            bmiCnt = getInitDataIndexCounts(docData, BMI);
            pglkCnt = getInitDataIndexCounts(docData, PGLK);

            if (!pageJson.data.document_data.CUSTOM_MAIN_MENU) {
                pageJson.data.document_data.CUSTOM_MAIN_MENU = {
                    id: 'CUSTOM_MAIN_MENU',
                    items: convertOldMenuToNewMenu(pageJson.data.document_data.MAIN_MENU.items, pageJson.data.document_data),
                    name: 'Custom Main Menu',
                    type: 'CustomMenu',
                    metaData: {}
                };
            }

            if (!pageJson.data.document_data.CUSTOM_MENUS) {
                pageJson.data.document_data.CUSTOM_MENUS = {
                    id: 'CUSTOM_MENUS',
                    menus: ['#CUSTOM_MAIN_MENU'],
                    type: 'CustomMenusCollection',
                    metaData: {}
                };
            } else if (!_.includes(pageJson.data.document_data.CUSTOM_MENUS.menus, '#CUSTOM_MAIN_MENU')) {
                pageJson.data.document_data.CUSTOM_MENUS.menus.push('#CUSTOM_MAIN_MENU');
            }
            addMissingPageIdsToMenu(docData, pageIdsArray);

            convertMenuItemsOfNonExistingPagesToHeaders(docData, docData.CUSTOM_MAIN_MENU);

            if (pageJson.data.document_data.MAIN_MENU.items.length > 0) {
                pageJson.data.document_data.MAIN_MENU.items = [];
            }
        }
    };

    return exports;
});
