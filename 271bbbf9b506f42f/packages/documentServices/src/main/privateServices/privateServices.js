define(['lodash', 'documentServices/dataAccessLayer/DataAccessLayer',
    'documentServices/siteAccessLayer/DocumentServicesSiteAPI',
    'documentServices/siteAccessLayer/DocumentServicesSiteAPINoSite',
    'documentServices/siteAccessLayer/DocumentServicesSiteAPIForTests',
    'documentServices/siteAccessLayer/SetOperationsQueue',
    'documentServices/siteAccessLayer/SetOperationsQueueNoSite',
    'documentServices/privateServices/GeneralSuperDal',
    'documentServices/privateServices/FullJsonUpdater',
    'documentServices/aspects/DocumentServicesAspect',
    'documentServices/hooks/hooksRegistrarLoader',
    'documentServices/dataAccessLayer/metaDataPointers'], function
    (_, DAL, DocumentServicesSiteAPI, DocumentServicesSiteAPINoSite,
     DocumentServicesSiteAPIForTests, SetOperationsQueue,
     SetOperationsQueueNoSite,
     GeneralSuperDal,
     FullJsonUpdater) {
    'use strict';

    /**
     * @ignore
     * @param config
     * @param data
     * @constructor
     */
    function PrivateDocumentServices(config, data) {
        var siteData = data.siteData;
        var siteDataAPI = data.siteDataAPI;
        if (!config.shouldRender) {
            this.siteAPI = config.isTest ? new DocumentServicesSiteAPIForTests(siteData, siteDataAPI) : new DocumentServicesSiteAPINoSite(siteData, siteDataAPI);
            this.setOperationsQueue = new SetOperationsQueueNoSite();
        }
        this.config = _(config).omit('modules').cloneDeep();
        this.runtimeConfig = {
            shouldThrowOnDeprecation: false
        };
        var dalConfig = _.pick(config, ['pathsInJsonData', 'isReadOnly', 'origin']);
        var cache = data.cache;
        var fullJsonCache = cache.getBoundCacheInstance(true);
        this.pointers = data.pointers;
        var fullJsonDal = new DAL({
            siteData: siteData,
            fullJson: data.fullPagesData
        }, data.dataLoadedRegistrar, fullJsonCache, dalConfig);
        var fullJsonUpdater = new FullJsonUpdater(fullJsonDal, this.pointers, data.displayedDal);
        this.dal = new GeneralSuperDal(fullJsonDal, data.displayedDal, fullJsonUpdater, data.displayedJsonUpdater, data.pointers);
        this.siteDataAPI = data.siteDataAPI;

    }

    PrivateDocumentServices.prototype.initiateSiteAPI = function (renderedWixSite) {
        this.siteAPI = new DocumentServicesSiteAPI(renderedWixSite);
        this.setOperationsQueue = new SetOperationsQueue(this);
    };

    /**
     * @ignore
     * @typedef {Object} PrivateDocumentServices
     * */
    return PrivateDocumentServices;
});
