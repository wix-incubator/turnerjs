define(['lodash'], function(_) {
    "use strict";

    function createFakePageMasterData(id) {
        return {
            "type": "Page",
            "id": id,
            "metaData": {
                "isPreset": false,
                "schemaVersion": "1.0",
                "isHidden": false
            },
            "title": "not found",
            "hideTitle": false,
            "icon": "",
            "descriptionSEO": "",
            "metaKeywordsSEO": "",
            "pageTitleSEO": "",
            "pageUriSEO": "@_" + id,
            "hidePage": true,
            "underConstruction": false,
            "tpaApplicationId": 0,
            "pageSecurity": {
                "requireLogin": false
            },
            "isPopup": false,
            "indexable": false,
            "isLandingPage": true,
            "pageBackgrounds": {
                "desktop": {
                    "custom": true,
                    "ref": "#customBgImg3vn",
                    "isPreset": true
                },
                "mobile": {
                    "custom": true,
                    "ref": "#customBgImg24ta",
                    "isPreset": true
                }
            },
            "translationData": {
                "uriSEOTranslated": false
            },
            "ignoreBottomBottomAnchors": true
        };
    }

    var errorPages = {
        '__403__dp': {
            json: '/static/errorPages/403.json',
            masterPageData: createFakePageMasterData('__403__dp')
        },
        '__404__dp': {
            json: '/static/errorPages/404.json',
            masterPageData: createFakePageMasterData('__404__dp')
        },
        '__500__dp': {
            json: '/static/errorPages/500.json',
            masterPageData: createFakePageMasterData('__500__dp')
        }
    };

    function isErrorPage(pageId) {
        return _.includes(_.keys(errorPages), pageId);
    }

    function getJSONS(siteData, id) {
        return [siteData.santaBase + errorPages[id].json];
    }

    function setErrorPagesDataItemsIfNeeded(siteData) {
        _.forEach(errorPages, function(errorPage, errorPageId){
            siteData.pagesData.masterPage.data.document_data[errorPageId] = errorPage.masterPageData;
        });
    }

    return {
        setErrorPagesDataItemsIfNeeded: setErrorPagesDataItemsIfNeeded,
        isErrorPage: isErrorPage,
        getJSONS: getJSONS,
        IDS: {
            FORBIDDEN: '__403__dp',
            NOT_FOUND: '__404__dp',
            INTERNAL_ERROR: '__500__dp'
        }
    };
});