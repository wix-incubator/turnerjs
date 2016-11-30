define([
    'lodash',
    'core',
    'utils',
    'documentServices/dataModel/dataModel',
    'documentServices/page/pageUtils',
    'documentServices/page/popupUtils',
    'documentServices/dataModel/DataSchemas.json',
    'documentServices/constants/constants'
], function (
    _,
    core,
    utils,
    dataModel,
    pageUtils,
    popupUtils,
    dataSchemas,
    constants) {
    'use strict';

    var DEVICES = ['desktop', 'mobile'];

    function getFilteredPagesList(ps, includeMasterPage, getOnlyPopups){
        var allPagesPointers = ps.pointers.page.getNonDeletedPagesPointers(includeMasterPage);

        var whatIsPage = function(pageId){
            var isPopup = popupUtils.isPopup(ps, pageId);
            return getOnlyPopups ? isPopup : !isPopup;
        };

        return _(allPagesPointers).map('id').filter(whatIsPage).value();
    }

    function getPagesAndPopupsList(ps, includeMasterPage) {
        var allPagesPointers = ps.pointers.page.getNonDeletedPagesPointers(includeMasterPage);
        return _.map(allPagesPointers, 'id');
    }

    function updatePageBackgrounds(ps, pageId, data){
        var pageDataInMasterPagePointer = ps.pointers.data.getDataItemFromMaster(pageId);
        var currDataItem = dataModel.serializeDataItem(ps, dataSchemas, pageDataInMasterPagePointer, false);

        if (data.pageBackgrounds) {
            _.forEach(DEVICES, function (device) {
                var deviceBackground = data.pageBackgrounds[device];
                if (deviceBackground && deviceBackground.ref){

                    var refId;
                    var currentRefId;
                    var newRefId;

                    if (currDataItem){
                        currentRefId = currDataItem.pageBackgrounds && currDataItem.pageBackgrounds[device] && currDataItem.pageBackgrounds[device].ref;
                        newRefId = data.pageBackgrounds[device] && data.pageBackgrounds[device].ref && data.pageBackgrounds[device].ref.id;

                        // Saving homepage data has quirks, it has a duplicated data item on both page and masterPage structures.
                        // Basically - We need to trick the server to save the data on both page and masterPage structures
                        // or we get data divergence between to dataItems with the same id but different contents.
                        // see https://jira.wixpress.com/browse/SE-6816
                        refId = newRefId ? newRefId : currentRefId && currDataItem.pageBackgrounds[device].ref.replace('#', '');
                    } else {
                        refId = pageId + '_' + device + '_bg';
                    }

                    deviceBackground.ref = '#' + dataModel.addSerializedDataItemToPage(ps, 'masterPage', deviceBackground.ref, refId);
                }
            });
            data.pageBackgrounds = _.assign((currDataItem && currDataItem.pageBackgrounds) || {}, data.pageBackgrounds);
        }
        return data;
    }

    function getPageDataById(ps, pageId, deleteIds) {
        var pageDataItemPointer = ps.pointers.data.getDataItemFromMaster(pageId);
        var dataItem = dataModel.serializeDataItem(ps, dataSchemas, pageDataItemPointer, deleteIds);

        if (dataItem && dataItem.pageBackgrounds) {
            _.forEach(DEVICES, function(device){
                var deviceBackground = dataItem.pageBackgrounds[device];
                if (deviceBackground && deviceBackground.ref){
                    var devicePointer = ps.pointers.data.getDataItemFromMaster(deviceBackground.ref.replace('#', ''));
                    deviceBackground.ref = dataModel.serializeDataItem(ps, dataSchemas, devicePointer, deleteIds);
                }
            });
        }

        return dataItem;
    }

    function isDuplicatePageUriSeo(ps, excludePageId, pageUriSEO) {
        var pageIds = pageDataModule.getPagesList(ps, false);

        return _(pageIds).pull(excludePageId).some(function (pageId) {
            return pageDataModule.getPageUriSEO(ps, pageId) === pageUriSEO;
        });
    }

    function isForbiddenPageUriSeo(ps, pageId, pageUriSEO) {
        var forbiddenWords = pageDataModule.getForbiddenPageUriSEOs(ps);
        var currentPageUriSEO = pageDataModule.getPageUriSEO(ps, pageId);

        delete forbiddenWords[currentPageUriSEO];

        return forbiddenWords.hasOwnProperty(pageUriSEO.toLowerCase());
    }

    function isPageUriSeoTooLong(pageUriSEO, marginForError) {
        marginForError = marginForError || 0;
        return _.size(pageUriSEO) > (constants.URLS.MAX_LENGTH - marginForError);
    }

    function hasUppercaseLetters(pageUriSEO) {
        return /[A-Z]/.test(pageUriSEO);
    }

    function hasIllegalChars(pageUriSEO) {
        return !/^[a-z0-9\-]+$/.test(pageUriSEO);
    }

    function getPairsCheckValue(pairs, pageUriSEO) {
        return _.chain(pairs)
            .find(function(pair) {
                return pair[0](pageUriSEO);
            })
            .get(1, '')
            .value();
    }

    function getPageUriSeoContentErrorMessage(ps, pageId, pageUriSEO) {
        return getPairsCheckValue([
            [isDuplicatePageUriSeo.bind(null, ps, pageId), 'pageUriSEO is invalid: not unique across site'],
            [isForbiddenPageUriSeo.bind(null, ps, pageId), 'pageUriSEO is invalid: reserved word']
        ], pageUriSEO);
    }

    function getPageUriSeoFormatErrorMessage(pageUriSEO) {
        return getPairsCheckValue([
            [isPageUriSeoTooLong, 'pageUriSEO is invalid: over ' + constants.URLS.MAX_LENGTH + ' chars'],
            [hasUppercaseLetters, 'pageUriSEO is invalid: all letters must be lowercase'],
            [hasIllegalChars, 'pageUriSEO is invalid: must only be alphanumeric or hyphen']
        ], pageUriSEO);
    }

    function getPageUriSeoErrorMessage(ps, pageId, pageUriSEO){
        var urlFormatPointer = ps.pointers.general.getUrlFormat();
        var urlFormat = ps.dal.get(urlFormatPointer);

        if (urlFormat === utils.siteConstants.URL_FORMATS.HASH_BANG) {
            return '';
        }

        return getPageUriSeoContentErrorMessage(ps, pageId, pageUriSEO) || getPageUriSeoFormatErrorMessage(pageUriSEO);
    }

    function validatePageUriSeoAllowed(ps, pageId, pageUriSEO) {
        var error = getPageUriSeoErrorMessage(ps, pageId, pageUriSEO);

        if (!_.isEmpty(error)) {
            throw new Error(error);
        }
    }

    var SAFE_PADDING_FOR_URI_LENGTH = 5;
    function getValidPageUriSEO(ps, pageId, initialPageUriSEO) {
        initialPageUriSEO = pageUtils.convertPageNameToUrl(ps, initialPageUriSEO);
        if (isPageUriSeoTooLong(initialPageUriSEO, SAFE_PADDING_FOR_URI_LENGTH)) {
            initialPageUriSEO = initialPageUriSEO.slice(0, constants.URLS.MAX_LENGTH - SAFE_PADDING_FOR_URI_LENGTH); //allow extra space for duplicates so we can append an index
        }
        var pageUriSEO = initialPageUriSEO;
        for (var index = 1; getPageUriSeoContentErrorMessage(ps, pageId, pageUriSEO); index++) {
            pageUriSEO = initialPageUriSEO + '-' + index;
        }
        return pageUriSEO;
    }

    /** @class documentServices.pages*/

    var pageDataModule = {
        getPagesDataItems: function(ps){
            var pageIds = pageDataModule.getPagesList(ps, false);

            return _.map(pageIds, function (pageId) {
                return pageDataModule.getPageData(ps, pageId);
            });
        },

        getPopupsDataItems: function(ps){
            var getDataItems = function(popupId){
                return pageDataModule.getPageData(ps, popupId);
            };

            return pageDataModule.getPopupsList(ps).map(getDataItems);
        },

        getNumberOfPages: function(ps){
            return pageDataModule.getPagesList(ps, false).length;
        },

        getPagesList: function(ps, includeMasterPage, includingPopups){
            if (includingPopups) {
                return getPagesAndPopupsList(ps, includeMasterPage);
            }
            return getFilteredPagesList(ps, includeMasterPage, false);
        },

        getPopupsList: function(ps){
            return getFilteredPagesList(ps, false, true);
        },

        doesPageExist: function(ps, pageId){
            var pagePointer = ps.pointers.page.getPagePointer(pageId);

            return Boolean(pagePointer);
        },

        setPageData: function(ps, pageId, data){
            if (_.isString(data.pageUriSEO) && _.isEmpty(data.pageUriSEO)){
                data.pageUriSEO = getValidPageUriSEO(ps, pageId, data.title); //convertPageNameToUrl handles blank titles
            }
            if (data.pageUriSEO) {
                validatePageUriSeoAllowed(ps, pageId, data.pageUriSEO);
                if (!_.get(data, ['translationData', 'uriSEOTranslated'])) {
                    data.translationData = {
                        uriSEOTranslated: false
                    };
                }
            }
            data = updatePageBackgrounds(ps, pageId, data);
            dataModel.addSerializedDataItemToPage(ps, 'masterPage', data, pageId);
            pageUtils.executePageDataChangedCallback(ps, pageId, data);
        },

        getPageData: function(ps, pageId){
            return getPageDataById(ps, pageId, false);
        },

        getPageDataWithoutIds: function(ps, pageId){
            return getPageDataById(ps, pageId, true);
        },

        getBgDataItem: function(ps, pageId, device){
            if (!_.includes(DEVICES, device)) {
                throw new Error("unknown device for background");
            }
            var pageData = pageDataModule.getPageData(ps, pageId);
            return pageData.pageBackgrounds[device];
        },

        updateBgDataItem: function(ps, pageId, bgData, device){
            if (!_.includes(DEVICES, device)) {
                throw new Error("unknown device for background");
            }
            var data = {pageBackgrounds: {}};
            data.pageBackgrounds[device] = _.cloneDeep(bgData);
            pageDataModule.setPageData(ps, pageId, data);
        },

        removePageData: function(ps, dataPointer){
            var pageDataItem = ps.dal.get(dataPointer);
            var pageId = ps.pointers.data.getPageIdOfData(dataPointer);
            if (pageDataItem.pageBackgrounds) {
                _.forEach(DEVICES, function(device){
                    var deviceBackground = pageDataItem.pageBackgrounds[device];
                    if (deviceBackground && deviceBackground.ref){
                        var innerDataPointer = ps.pointers.data.getDataItem(deviceBackground.ref.replace('#', ''), pageId);
                        dataModel.removeDataItemRecursively(ps, innerDataPointer);
                    }
                });
            }
            dataModel.removeDataItemRecursively(ps, dataPointer);
        },

        getPageUriSEO: function (ps, pageId) {
            var pageDataItemPointer = ps.pointers.data.getDataItemFromMaster(pageId);
            var pageUriSEOPointer = ps.pointers.getInnerPointer(pageDataItemPointer, 'pageUriSEO');

            return ps.dal.get(pageUriSEOPointer);
        },

        getForbiddenPageUriSEOs: function(ps){
            var forbiddenWordsPointer = ps.pointers.general.getForbiddenPageUriSEOs();
            return ps.dal.get(forbiddenWordsPointer) || {};
        },

        isDuplicatePageUriSeo: isDuplicatePageUriSeo,
        isForbiddenPageUriSeo: isForbiddenPageUriSeo,
        getValidPageUriSEO: getValidPageUriSEO,
        isPageUriSeoTooLong: isPageUriSeoTooLong,
        convertPageNameToUrl: pageUtils.convertPageNameToUrl
    };

    return pageDataModule;
});
