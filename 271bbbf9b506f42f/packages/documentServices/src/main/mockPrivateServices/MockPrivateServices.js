define(['lodash', 'core', 'testUtils', 'documentServices/mockPrivateServices/MockDocumentServicesSiteAPI',
    'documentServices/siteAccessLayer/SetOperationsQueueNoSite',
    'documentServices/dataAccessLayer/DataAccessLayer',
    'fake!documentServices/dataAccessLayer/DataAccessLayer',
    'documentServices/privateServices/FullJsonUpdater',
    'documentServices/privateServices/GeneralSuperDal',
    'documentServices/dataAccessLayer/metaDataPointers',
    'documentServices/hooks/hooksRegistrarLoader',
    'documentServices/aspects/DocumentServicesAspect',
    'documentServices/dataAccessLayer/metaDataPointers'], function
    (_, core, testUtils, MockDocumentServicesSiteAPI, SetOperationsQueueNoSite, DAL, DALFake, FullJsonUpdater, GeneralSuperDal) {
    'use strict';

    function MockPrivateServices(config, data, isRealDAL, jsonPaths) {
        this.config = _(config).omit('modules').cloneDeep();

        var siteData = data.siteData;
        siteData.setStore = siteData.setStore || _.noop;
        var siteDataWrapper = core.SiteDataAPI.createSiteDataAPIAndDal(siteData, _.noop);
        this.siteDataAPI = siteDataWrapper.siteDataAPI;
        this.siteAPI = new MockDocumentServicesSiteAPI(siteData, siteDataWrapper.siteDataAPI);

        initMockOperationsQueue.call(this);

        var fullJsonCache = siteDataWrapper.cache.getBoundCacheInstance(true);
        this.pointers = siteDataWrapper.pointers;
        this.viewerPrivateServices = { //FOR TESTS ONLY
            siteDataAPI: siteDataWrapper.siteDataAPI,
            pointers: siteDataWrapper.pointers,
            displayedDAL: siteDataWrapper.displayedDal
        };
        if (isRealDAL) {
            initRealDAL.call(this, siteDataWrapper, fullJsonCache, data, config, jsonPaths);
        } else {
            initMockDAL.call(this, siteData, fullJsonCache);
        }
    }

    function initMockOperationsQueue() {
        this.setOperationsQueue = new SetOperationsQueueNoSite(this);
        this.setOperationsQueue.isRunningSetOperation = function () {
            return true;
        };
        this.setOperationsQueue.executeAfterCurrentOperationDone = function (callback) {
            callback();
        };
    }

    function initRealDAL(siteDataWrapper, fullJsonCache, data, config, jsonPaths) {
        var dalConfig = _.pick(config, ['pathsInJsonData', 'isReadOnly', 'origin']);
        if (jsonPaths) {
            dalConfig.pathsInJsonData = jsonPaths;
        }
        var fullJsonDal = new DAL({
            siteData: siteDataWrapper.siteData,
            fullJson: siteDataWrapper.fullPagesData
        }, data.dataLoadedRegistrar, fullJsonCache, dalConfig);

        var fullJsonUpdater = new FullJsonUpdater(fullJsonDal, this.pointers, siteDataWrapper.displayedDal);
        this.dal = new GeneralSuperDal(fullJsonDal, siteDataWrapper.displayedDal, fullJsonUpdater, siteDataWrapper.displayedJsonUpdater, siteDataWrapper.pointers);
    }

    function initMockDAL(siteData, fullJsonCache) {
        this.dal = new DALFake();
        var getValue = function (path) {
            var object = siteData;
            _.forEach(path, function (part) {
                object = object && object[part];
            });
            return object;
        };

        this.dal.getByPath = getValue;
        this.dal.setByPath = _.partial(_.set, siteData);
        this.dal.get = function (pointer) {
            var path;
            path = fullJsonCache.getPath(pointer);
            return getValue(path);
        };

        this.dal.isExist = function (pointer) {
            return pointer && !!fullJsonCache.getPath(pointer);
        };
        this.dal.full = _.clone(this.dal);
    }

    MockPrivateServices.prototype = {
        /**
         * Clones and sets the the Displayed JSON into to the Full JSON (Structure & Data).
         *
         * Use this function, after using the Mock Site Data API which changes the (displayed) JSON, after you
         * initialized PrivateServices with "privateServicesHelper.mockPrivateServicesWithRealDAL(mockSiteData)".
         */
        syncDisplayedJsonToFull: function() {
            var pagesData = this.dal.getByPath(['pagesData']);
            this.dal.full.setByPath(['pagesData'], pagesData);
        }
    };

    return MockPrivateServices;

});
