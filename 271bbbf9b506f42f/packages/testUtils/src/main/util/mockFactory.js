define([
    'lodash',
    'react',
    'fake!core',
    'core',
    'utils',
    'experiment',
    'testUtils/util/widgetMocks',
    'testUtils/util/appBuilderExtensions',
    'testUtils/util/mockData',
    'testUtils/util/mockBehavior',
    'testUtils/util/mockClientSpecMap',
    'testUtils/util/mockPlatformData',
    'testUtils/util/mockConnection',
    'testUtils/util/mockRouter',
    'testUtils/util/mockAction',
    'testUtils/util/mockProps',
    'testUtils/util/mockSequence',
    'testUtils/util/mockDefaultJsons'
], function (
    _,
    React,
    fakeCore,
    /** core */ core,
    utils,
    experiment,
    widgetMocks,
    appBuilderExtensions,
    mockData,
    mockBehavior,
    mockClientSpecMap,
    mockPlatformData,
    mockConnection,
    mockRouter,
    mockAction,
    mockProps,
    mockSequence,
    mockDefaultJsons
) {
    'use strict';

    var DEFAULT_COMP_DATA = {
        'platform.components.AppController': {
            applicationId: 'dataBinding',
            controllerType: 'dataset'
        }
    };

    // TODO: init descriptor if not exist on all methods.
    var appbuilderData = {
        wixapps: {
            appbuilder: {
                applicationInstanceVersion: 2,
                items: {},
                descriptor: {
                    types: {},
                    parts: {},
                    dataSelectors: {},
                    views: {},
                    offsetFromServerTime: 15
                }
            }
        }
    };

    function getDefaultPageData(){
        return _.cloneDeep(mockDefaultJsons.defaultPageData);
    }

    function getDefaultPageStructure(){
        return _.cloneDeep(mockDefaultJsons.get.defaultPageStructure());
    }

    function getFakeCoreWithRealBaseMixins() {
        var myFakeCore = _.clone(fakeCore);
        myFakeCore.compMixins = _.clone(fakeCore.compMixins);
        myFakeCore.compMixins.skinBasedComp = core.compMixins.skinBasedComp;
        myFakeCore.compMixins.skinInfo = core.compMixins.skinInfo;
        var animationsMixin = _.clone(myFakeCore.compMixins.animationsMixin);
        animationsMixin.sequance = mockSequence;
        myFakeCore.compMixins.animationsMixin = animationsMixin;

        return myFakeCore;
    }

    var simpleComp = React.createFactory(React.createClass({
        displayName: 'simpleComp',
        render: function () {
            return React.DOM.div(this.props);
        }
    }));

    var getMockComponentDefenition = function() {
        return {
            displayName: 'dummyComponent',
            mixins: [],
            statics: {
                useSantaTypes: true
            },
            render: function () {
                return React.DOM.div({});
            }
        };
    };

    /**
     *
     * @param siteData
     * @constructor
     */
    function SiteDataMockData(siteData) {
        this.siteData = siteData;
    }

    SiteDataMockData.prototype = mockData;

    function addDataItems(siteData, item, pageId, dataType) {
        var dataSource = siteData.pagesData[pageId].data[dataType || 'document_data'];
        if (_.isArray(item)) {
            _.forEach(item, function (i) {
                dataSource[i.id] = i;
            });
        } else {
            dataSource[item.id] = item;
        }
        return siteData;
    }

    function updateDataItem(siteData, itemId, partialUpdates, pageId, dataType) {
        var dataSource = siteData.pagesData[pageId].data[dataType || 'document_data'];
        _.merge(dataSource[itemId], partialUpdates);
        return siteData;
    }

    function _addPageWithDefaults(id, pageComps, mobilePageComps, isPopup) {
        var hasData = _.has(this.pagesData, 'masterPage.data.document_data.' + id);

        if (!hasData) {
            var pageData = _.defaults({
                type: 'Page',
                id: id,
                title: 'title ' + id,
                pageUriSEO: 'pageUriSEO ' + id
            }, getDefaultPageData());

            if (isPopup) {
                pageData.isPopup = true;
            }

            this.addData(pageData, 'masterPage');
        }
        var page = this.getPageWithDefaults(id, pageComps, mobilePageComps);
        var pageComp = this.addPage(page);

        if (isPopup) {
            createCompStructureAndAddToPage('wysiwyg.viewer.components.PopupContainer', this, pageComp.id);
        }

        return pageComp;
    }

    function initPathOnAllPages(path, pagesData) {
        _.forEach(pagesData, function(pageJson) {
            if (!_.has(pageJson, path)) {
                _.set(pageJson, path, {});
            }
        });
    }

    function serializeConnectionsItem(siteData, item, pageId) {
        var connectionItems = _.get(item, 'items');
        var stringifiedItems = _.map(connectionItems, function (connectionItem) {
            var newConnectionItem = _.assign({}, connectionItem);
            if (_.isPlainObject(newConnectionItem.config)) {
                try {
                    newConnectionItem.config = JSON.stringify(newConnectionItem.config);
                } catch (e) {
                    throw new Error('Invalid connection configuration - should be JSON stringifiable');
                }
            }
            if (_.has(newConnectionItem, 'controllerRef')) {
                var controllerId = newConnectionItem.controllerRef.id;
                var controllerStructure = utils.dataUtils.findCompInStructure(siteData.pagesData[pageId].structure, false, function (comp) {
                        return comp.id === controllerId;
                    }) || utils.dataUtils.findCompInStructure(siteData.pagesData.masterPage.structure, false, function (comp) {
                        return comp.id === controllerId;
                    });
                newConnectionItem.controllerId = controllerStructure.dataQuery;
                delete newConnectionItem.controllerRef;
            }
            return newConnectionItem;
        });
        return _.assign({}, item, {items: stringifiedItems});
    }

    function upsertCompBehaviors(comp, pageId, behaviors) {
        if (comp.behaviorQuery) {
            var currentBehaviorsData = _.get(this.pagesData, [pageId, 'data', 'behaviors_data', comp.behaviorQuery]);
            currentBehaviorsData.items = behaviors;
        } else {
            var newBehaviorsItem = buildBehaviorsDataItem(behaviors);
            this.addBehaviors(newBehaviorsItem, pageId);
            comp.behaviorQuery = newBehaviorsItem.id;
        }
    }

    /**
     * @lends test.SiteData
     * @type {{addData: addData, addProperties: addProperties}}
     */
    var siteDataEnhancement = {
        addData: function (item, pageId) {
            addDataItems(this, item, pageId || 'masterPage');
            return this;
        },

        updateData: function(itemId, partialUpdates, pageId) {
            updateDataItem(this, itemId, partialUpdates, pageId, 'document_data');
        },

        getData: function (id, pageId) {
            id = id.replace('#', '');
            return _.get(this.pagesData, [pageId || 'masterPage', 'data', 'document_data', id]);
        },

        getPropertyItem: function(id, pageId) {
            id = id.replace('#', '');
            return _.get(this.pagesData, [pageId || 'masterPage', 'data', 'component_properties', id]);
        },

        getDataResolved: function (query, pageId, dataType) {
            pageId = pageId || 'masterPage';
            dataType = dataType || this.dataTypes.DATA;
            this.dataResolver.setReadingFromCache(false);
            return this.getDataByQuery(query, pageId, dataType);
        },

        addProperties: function (item, pageId) {
            addDataItems(this, item, pageId || 'masterPage', 'component_properties');
            return this;
        },

        addDesign: function(item, pageId) {
            addDataItems(this, item, pageId || 'masterPage', 'design_data');
            return this;
        },

        updateDesign: function(itemId, partialUpdates, pageId) {
            updateDataItem(this, itemId, partialUpdates, pageId, 'design_data');
            return this;
        },

        addBehaviors: function(item, pageId) {
            addDataItems(this, item, pageId || 'masterPage', 'behaviors_data');
            return this;
        },

        addConnections: function(item, pageId) {
            pageId = pageId || 'masterPage';
            var serializedConnectionsItem = serializeConnectionsItem(this, item, pageId);
            addDataItems(this, serializedConnectionsItem, pageId, 'connections_data');
            return this;
        },

        updateProperties: function(itemId, partialUpdates, pageId) {
            updateDataItem(this, itemId, partialUpdates, pageId, 'component_properties');
            return this;
        },

        addState: function (compId, state) {
            this.compStates = this.compStates || {};
            this.compStates[compId] = state;
            return this;
        },

        addCompTheme: function (item) {
            addDataItems(this, item, 'masterPage', 'theme_data');
            return this;
        },

        setComponentBehaviors: function(compId, behaviors, pageId) {
            var childrenAttr = pageId === 'masterPage' ? 'children' : 'components';
            var comp = _.find(this.pagesData[pageId].structure[childrenAttr], {id: compId});
            upsertCompBehaviors.call(this, comp, pageId, behaviors);
            return this;
        },

        setPageBehaviors: function(pageId, behaviors) {
            var pageStructure = _.get(this.pagesData, [pageId, 'structure']);
            upsertCompBehaviors.call(this, pageStructure, pageId, behaviors);
            return this;
        },

        setPageComponents: function(comps, pageId, isMobile){
            var childrenAttr = 'mobileComponents';
            if (!isMobile){
                childrenAttr = pageId === 'masterPage' ? 'children' : 'components';
            }
            this.pagesData[pageId].structure[childrenAttr] = comps;
            return this;
        },

        updatePageComponent: function(compId, partialUpdates, pageId, isMobile) {
            var childrenAttr = 'mobileComponents';
            if (!isMobile){
                childrenAttr = pageId === 'masterPage' ? 'children' : 'components';
            }
            var comp = _.find(this.pagesData[pageId].structure[childrenAttr], {id: compId});
            _.merge(comp, partialUpdates);
        },

        updatePageStructure: function(pageId, partialPageStructure) {
            _.merge(this.pagesData[pageId].structure, partialPageStructure);
            return this;
        },

        addMobileComps: function(comps, pageId){
            var childrenArr = this.pagesData[pageId].structure.mobileComponents;
            childrenArr.push.apply(childrenArr, comps); //doing it this way instead of concat keeps the reference
            return this;
        },
        addDesktopComps: function(comps, pageId){
            var childrenAttr = pageId === 'masterPage' ? 'children' : 'components';
            var childrenArr = this.pagesData[pageId].structure[childrenAttr];
            childrenArr.push.apply(childrenArr, comps); //doing it this way instead of concat keeps the reference
            return this;
        },

        addGeneralTheme: function(colors, fonts){
            addDataItems(this, {
                id: 'THEME_DATA',
                color: colors || [],
                font: fonts || []
            }, 'masterPage', 'theme_data');
            return this;
        },

        getUserId: function () {
            return this.rendererModel.userId;
        },
        useSlashUrl: function() {
            _.set(this.urlFormatModel, ['format'], 'slash');
            return this;
        },
        updateClientSpecMap: function (clientSpecMap) {
            var siteDataClientSpecMap = this.rendererModel.clientSpecMap;
            var application = _.find(siteDataClientSpecMap, {type: clientSpecMap.type});
            var originalApplicationId = _.get(application, 'applicationId');
            if (application) {
                _.merge(application, clientSpecMap);
                siteDataClientSpecMap[application.applicationId] = application;
                if (application.applicationId !== originalApplicationId) {
                    delete siteDataClientSpecMap[originalApplicationId];
                }
            } else {
                siteDataClientSpecMap[clientSpecMap.applicationId || 1000] = clientSpecMap;
            }

            return this;
        },
        updatePublicModel: function(partialPublicModel) {
            _.merge(this.publicModel, partialPublicModel);
            return this;
        },

        updateRendererModel: function(partialRendererModel) {
            _.merge(this.rendererModel, partialRendererModel);
            return this;
        },

        overrideClientSpecMap: function(clientSpecMap) {
            this.rendererModel.clientSpecMap = clientSpecMap;
            return this;
        },
        addPage: function (page) {
            if (page.hasOwnProperty('id')) {
                var pageData = _.get(this.pagesData, ['masterPage', 'data', 'document_data', page.id]);
                this.pagesData[page.id] = page;
                if (this.publicModel) {
                    this.publicModel.pageList.pages = this.publicModel.pageList.pages || [];
                    this.publicModel.pageList.pages.push({
                        pageId: page.id,
                        title: _.get(pageData, 'title'),
                        pageUriSEO: _.get(pageData, 'pageUriSEO'),
                        pageJsonFileName: page.id
                    });
                }
                if (this.mobileDeletedCompsMap) {
                    this.mobileDeletedCompsMap[page.id] = [];
                }
            } else {
                this.pagesData = page;
                if (this.mobileDeletedCompsMap) {
                    this.mobileDeletedCompsMap[page.id] = [];
                }
            }

            return this;
        },
        addPageWithDefaults: function (id, pageComps, mobilePageComps) {
            return _addPageWithDefaults.call(this, id, pageComps, mobilePageComps, false);
        },
        addPopupPageWithDefaults: function (id, pageComps, mobilePageComps) {
            return _addPageWithDefaults.call(this, id, pageComps, mobilePageComps, true);
        },
        addPageWithData: function (id, pageData, pageComps, mobilePageComps) {
            var data = _.defaults(pageData, {id: id}, getDefaultPageData());
            return this.addData(data, 'masterPage').addPageWithDefaults(id, pageComps, mobilePageComps);
        },
        addPopupWithData: function(id, pageData, pageComps, mobilePageComps) {
            var data = _.defaults(pageData, {id: id}, getDefaultPageData(), {isPopup: true});
            return this.addData(data, 'masterPage').addPopupPageWithDefaults(id, pageComps, mobilePageComps);
        },
        getPageWithDefaults: function(pageId, pageComps, mobilePageComps) {
            var pageWithDefaults = _.defaultsDeep({
                id: pageId,
                structure: {
                    id: pageId,
                    skin: 'wysiwyg.viewer.skins.page.BasicPageSkin',
                    components: pageComps || [],
                    mobileComponents: mobilePageComps || []
                }
            }, getDefaultPageStructure());

            if (experiment.isOpen('connectionsData')) {
                pageWithDefaults.data.connections_data = {};
            }
            return pageWithDefaults;
        },
        addMeasureMap: function (measureMap) {
            this.measureMap = _.merge(this.measureMap || createBlankMeasureMap(), measureMap);

            return this;
        },
        setCurrentPage: function(pageId, additionalInfo, shouldOverrideOtherRoots){
            this.pageId = pageId;
            this.setRootNavigationInfo(_.assign({pageId: pageId}, additionalInfo), shouldOverrideOtherRoots);
            return this;
        },
        setUserId: function(userId) {
            this.rendererModel.userId = userId;
            return this;
        },
        setDocumentType: function(documentType) {
            this.rendererModel.siteInfo.documentType = documentType;
            return this;
        },
        setSiteId: function(siteId) {
            _.set(this.rendererModel, 'siteInfo.siteId', siteId);
            return this;
        },
        updateCurrentUrl: function(urlObject) {
            _.assign(this.currentUrl, urlObject);
            return this;
        },
        setExternalBaseUrl: function(baseUrl) {
            this.publicModel.externalBaseUrl = baseUrl;
            return this;
        },
        setAsTemplate: function (isTemplate) {
            this.documentServicesModel.neverSaved = isTemplate;
            return this;
        },
        setAnchorsMap: function(anchorsMap) {
            this.anchorsMap = anchorsMap;
            return this;
        },
        toggleRenderFlag: function(renderFlagName, toggleValue) {
            _.set(this, ['renderFlags', renderFlagName], toggleValue);
            return this;
        },
        setSiteRevision: function(revisionNumber) {
            if (this.publicModel) {
                _.set(this.publicModel, ['siteRevision', revisionNumber]);
            } else if (this.documentServicesModel) {
                _.set(this.documentServicesModel, ['siteRevision', revisionNumber]);
            }
            return this;
        },
        setWixCodeModel: function(wixCodeModel) {
            _.set(this.rendererModel, ['wixCodeModel', wixCodeModel]);
            return this;
        },
        setMainPage: function (pageId) {
            var sitestructure = this.pagesData.masterPage.data.document_data.masterPage;
            sitestructure.mainPage = '#' + pageId;
            sitestructure.mainPageId = pageId;
            this.publicModel.pageList.mainPageId = pageId;
        },
        setCompsToShowWithOpacity: function(compIds, opacity) {
            this.renderRealtimeConfig.compsToShowWithOpacity = {
                opacity: opacity,
                compIds: compIds
            };
        },
        addConnectionsDataMap: function() {
            initPathOnAllPages('data.connections_data', this.pagesData);
            return this;
        },
        setScreenSize: function(width, height){
            this.screenSize = {
                width: width,
                height: height
            };
        },
        setUseSandboxInHTMLComp: function (value) {
            this.rendererModel.useSandboxInHTMLComp = _.isUndefined(value) ? true : !!value;
            return this;
        },
        setActiveModes: function(activeModes) {
            this.activeModes = activeModes;
            return this;
        },
        withRouters: function(routers) {
            this.rendererModel.routers = routers;
            return this;
        },
        addControllerStageData: function (controllerStageData, appId) {
            this.platform = this.platform || {};
            _.set(this.platform, ['appManifest', appId, 'controllersStageData'], controllerStageData);
            return this;
        },
        addControllerToStateMap: function (controllerId, state) {
            this.platform = this.platform || {};
            _.set(this.platform, ['appState', controllerId], state);
            return this;
        },
        addRouterConfig: function(routerConfig, routerId) {
            var configMap = _.get(this.rendererModel, 'routers.configMap', {});
            if (_.has(configMap, routerId)) {
                throw new Error('routerId ' + routerId + ' already exists');
            }
            var newKey = routerId || _.keys(configMap).length + 1;
            configMap[newKey] = routerConfig;
            _.set(this.rendererModel, 'routers.configMap', configMap);
            return this;
        },
        withRootData:function(pageId, rootData){
           this._currentRootInfos[pageId] = rootData;
            return this;
        },
        setReLayoutedCompsMap: function (reLayoutedCompsMap) {
            this.reLayoutedCompsMap = reLayoutedCompsMap;
            return this;
        },
        setPagePlatformApp: function (pageId, appId, value) {
            this.pagesPlatformApplications = this.pagesPlatformApplications || {};
            if (this.pagesPlatformApplications[appId]) {
                delete this.pagesPlatformApplications[appId][pageId];
            }
            if (value) {
                _.set(this.pagesPlatformApplications, [appId, pageId], true);
            }
            return this;
        }
    };

    /**
     * @typedef {core.SiteData} test.SiteData
     * @property {SiteDataMockData} mock
     */

    /**
     *
     * @returns {test.SiteData}
     */
    function mockSiteData(customSiteModel, isDocumentServices) {
        var model = _.defaultsDeep({}, customSiteModel, mockDefaultJsons.get.siteModel());
        _.set(model, 'rendererModel.previewMode', false);
        if (!customSiteModel && isDocumentServices) {
            delete model.publicModel;
            var docModel = _.merge({}, mockDefaultJsons.DSAdditionalSiteModel.documentServicesModel, model.documentServicesModel);
            model.documentServicesModel = docModel;

            _.set(model, 'rendererModel.previewMode', true);
        }
        var siteData = new core.SiteData(_.merge({}, model, appbuilderData));
        _.assign(siteData, siteDataEnhancement);
        _.assign(siteData, appBuilderExtensions);
        siteData.mobileDeletedCompsMap = {
            "masterPage": [],
            "currentPage": []
        };
        siteData.mock = new SiteDataMockData(siteData);
        siteData.mobile = new core.MobileDeviceAnalyzer(siteData.requestModel);

        siteData.setCurrentPage('currentPage');

        var store = new utils.Store(siteData, siteData, _.noop);
        siteData.setStore(store);
        spyOn(siteData.store, 'registerDataLoadedCallback').and.callFake(function (callback) { return callback; });
        spyOn(siteData.store, 'loadBatch').and.callFake(function (descriptors, callback) { callback(); });

        if (siteData.isDebugMode.isSpy) {
            siteData.isDebugMode.isSpy = false;
        }
        siteData.isDebugMode = jasmine.createSpy('isDebugMode').and.returnValue(true);
        siteData.orphanPermanentDataNodes = [];
        siteData.browser = {ie: false};
        siteData.getBodyClientWidth = jasmine.createSpy('getBodyClientWidth').and.returnValue(1000);
        siteData.getBodyClientHeight = jasmine.createSpy('getBodyClientHeight').and.returnValue(800);

        if (isDocumentServices) {
            siteData.addMeasureMap();
        }
        _.set(siteData, 'viewMode', model.rendererModel.previewMode ? 'preview' : 'site');
        siteData.runtime = {};
        siteData.renderRealtimeConfig = {};
        siteData.browserFlags = function () {
            return {};
        };
        if (experiment.isOpen('connectionsData')) {
            siteData.addConnectionsDataMap();
        }
        return siteData;
    }


    function mockViewerPrivateServicesWrapper(fullSiteData) {
        var siteDataApiWrapper = core.SiteDataAPI.createSiteDataAPIAndDal(fullSiteData, _.noop);
        siteDataApiWrapper.siteDataAPI.refreshRenderedRootsData = function (cb) {
            cb();
        };

        return {
            siteDataApiWrapper: siteDataApiWrapper,
            viewerPrivateServices: {
                pointers: siteDataApiWrapper.pointers,
                displayedDAL: siteDataApiWrapper.displayedDal,
                siteDataAPI: siteDataApiWrapper.siteDataAPI
            }
        };
    }

    function mockViewerPrivateServices(fullSiteData) {
        return mockViewerPrivateServicesWrapper(fullSiteData).viewerPrivateServices;
    }

    function mockSiteProps(siteData, viewerPrivateServices, overrideProps) {
        return _.assign({
                rootId: 'masterPage',
                siteData: siteData,
                viewerPrivateServices: viewerPrivateServices || mockViewerPrivateServicesWrapper(siteData).viewerPrivateServices,
                navigateMethod: jasmine.createSpy('navigateMethod'),
                wixCodeAppApi: {
                    init: jasmine.createSpy('init'),
                    sendMessage: jasmine.createSpy('sendMessage'),
                    registerMessageHandler: jasmine.createSpy('registerMessageHandler'),
                    registerMessageModifier: jasmine.createSpy('registerMessageModifier')
                }
            }, overrideProps || {});
    }

    function ReactSiteConstructor(siteData, viewerPrivateServices, props) {
        var self = this;
        this.state = {
            currentUrlPageId: siteData.getCurrentUrlPageId()
        };
        var overrideProps = _.assign({
            getSiteContainer: function () {
                self.siteContainer = self.siteContainer || window.document.createElement('div');
                return self.siteContainer;
            }
        }, props);
        this.props = mockSiteProps(siteData, viewerPrivateServices, overrideProps);
        this.refs = {
            'masterPage': {
                refs: {
                    SITE_PAGES: {
                        refs: {}
                    }
                },
                props: {
                    rootId: 'masterPage'
                }
            },
            siteAspectsContainer: {refs: {}}
        };
        this._siteAspectsEventsRegistry = {};

        this.addRenderedPage = function(pageId, isPrimaryPage, comps){
            this.refs.masterPage.refs.SITE_PAGES.refs[pageId] = {
                refs: comps || {},
                props: {
                    rootId: pageId,
                    pageStub: false
                },
                isStub: function(){
                    return this.props.pageStub;
                }
            };
            if (isPrimaryPage){
                _(this.refs.masterPage.refs.SITE_PAGES.refs)
                    .omit(pageId)
                    .forEach(function(fakePage){
                        fakePage.props.pageStub = true;
                        return fakePage;
                    })
                    .value();
                this.state.currentUrlPageId = pageId;
            }
        };

        this.addRenderedPage(siteData.getPrimaryPageId(), true);

        _.assign(this, {
            reLayoutIfPending: jasmine.createSpy('reLayoutIfPending'),
            pendingReLayoutCompsMap: {},
            reLayout: jasmine.createSpy('reLayout'),
            forceUpdate: jasmine.createSpy('force update site').and.callFake(function(callback) {
                if (callback) {
                    _.defer(callback);
                }
            })
        });

    }

    ReactSiteConstructor.prototype = core.forTests.WixSiteReact.prototype;

    function mockWixSiteReact(siteData, viewerPrivateServices, props) {
        siteData = siteData || mockSiteData();
        var site = new ReactSiteConstructor(siteData, viewerPrivateServices, props);
        site.siteAPI = new core.SiteAPI(site);
        site.siteAPI.getSiteData = function() { return siteData; };
        site._aspectsSiteAPI = new core.SiteAspectsSiteAPI(site);
        site.siteAspects = getSiteAspectsInstances(site._aspectsSiteAPI);
        return site;
    }

    function mockWixSiteReactFromFullJson(fullJson) {
        var viewerPrivateServicesWrapper = mockViewerPrivateServicesWrapper(fullJson);
        var siteDataApiWrapper = viewerPrivateServicesWrapper.siteDataApiWrapper;
        siteDataApiWrapper.siteData.pagesData = _.cloneDeep(siteDataApiWrapper.siteData.pagesData);  // TODO: this is a hack to enforce separation of full & displayed jsons
        return mockWixSiteReact(siteDataApiWrapper.siteData, viewerPrivateServicesWrapper.viewerPrivateServices);
    }

    function createStructureWithDataAndProps(componentType, data, props, id, structureOverrides) {
        var compData, compProps;
        var compStructure = createStructure(componentType, structureOverrides || {}, id);

        if (data) {
            compData = _.defaults({id: _.get(data, 'id', _.uniqueId('mock_data_'))}, data);
            compStructure.dataQuery = compData.id;
        }

        if (props) {
            compProps = _.defaults({id: _.uniqueId('mock_props_')}, props);
            compStructure.propertyQuery = compProps.id;
        }

        return {compStructure: compStructure, compData: compData, compProps: compProps};
    }

    function createStructure(componentType, structure, id) {
        var compStructure = {
            id: id || _.uniqueId('mock_comp_'),
            componentType: componentType,
            layout: {
                rotationInDegrees: 0,
                width: 10,
                height: 10,
                y: 10,
                x: 10,
                fixedPosition: false
            }
        };
        return _.defaultsDeep(structure || {}, compStructure);
    }

    function createAnchorMobileAlgorithm(fromId, targetId, type, distance, isLocked, originalValue){
        var anchor = createAnchor(targetId, type, distance, isLocked, originalValue);
        anchor.fromComp = fromId;
        return anchor;
    }

    function createBlankMeasureMap(overrides) {
        return _.merge({
            collapsed: {},
            absoluteLeft:{},
            absoluteTop: {},
            containerHeightMargin: {},
            height: {},
            innerHeight: {},
            innerWidth: {},
            left: {},
            minHeight: {},
            minWidth: {},
            pageBottomByComponents: {},
            right: {},
            shrinkableContainer: {},
            top: {},
            width: {},
            injectedAnchors: {},
            x: {},
            y: {}
        }, overrides);
    }

    /**
     *
     * @param {string} targetId
     * @param {string} type
     * @param {number?} distance
     * @param {boolean?} isLocked
     * @param {number?} originalValue
     * @returns {{distance: (*|number), locked: *, originalValue: (*|number), targetComponent: *, type: *, topToTop: null}}
     */
    function createAnchor(targetId, type, distance, isLocked, originalValue){
        return {
            "distance": distance || 0,
            //"fromComp": "slide-1",
            "locked": _.isBoolean(isLocked) ? isLocked : true,
            "originalValue": originalValue || 0,
            "targetComponent": targetId,
            "type": type,
            "topToTop": null
        };
    }

    /**
     *
     * @param {string} componentType The type of the component
     * @param {core.SiteData} siteData
     * @param {string} pageId The page id you want to add the component to it.
     * @param {object?} data The data of the component
     * @param {object?} props The properties of the component
     * @returns {object} A component structure
     */
    function buildBehaviorsDataItem(behaviors) {
        return {id: _.uniqueId('mock_behaviors'), type: 'ObsoleteBehaviorsList', items: behaviors};
    }

    function createCompStructureAndAddToPage(componentType, siteData, pageId, compDataObj, isMobile, id, structureOverride, containerId) {
        var compData, compProps, compBehaviors, compConnections;
        var compStructure = createStructure(componentType, structureOverride, id);
        var defaultCompData = DEFAULT_COMP_DATA[componentType];
        var result = {compStructure: compStructure};

        if (_.get(compDataObj, 'data', defaultCompData)) {
            compData = _.defaults({}, _.get(compDataObj, 'data', {}), defaultCompData, {id: _.uniqueId('mock_data_')});
            siteData.addData(compData, pageId);
            compStructure.dataQuery = compData.id;
            result.compData = compData;
        }

        compProps = _.get(compDataObj, 'props') || _.get(compDataObj, 'properties');
        if (compProps) {
            compProps = _.defaults({}, compProps, {id: _.uniqueId('mock_props_')});
            siteData.addProperties(compProps, pageId);
            compStructure.propertyQuery = compProps.id;
            result.compProps = compProps;
        }

        if (_.get(compDataObj, 'behaviors')) {
            compBehaviors = buildBehaviorsDataItem(compDataObj.behaviors);
            siteData.addBehaviors(compBehaviors, pageId);
            compStructure.behaviorQuery = compBehaviors.id;
            result.compBehaviors = compBehaviors;
        }

        if (_.get(compDataObj, 'connections')) {
            compConnections = _.assign(mockConnection.connectionList(compDataObj.connections), {id: _.uniqueId('mock_connections')});
            siteData.addConnections(compConnections, pageId);
            compStructure.connectionQuery = compConnections.id;
            result.compConnections = compConnections;
        }

        if (containerId) {
	        var pageStrcture = siteData.pagesData[pageId].structure;
	        var isParentContainer = function (structure) {
                return structure.id === containerId;
            };

            var container = utils.dataUtils.getAllCompsInStructure(pageStrcture, isMobile, isParentContainer, true);
            container.components = container.components || [];
            container.components = container.components.concat(result.compStructure);
            return result.compStructure;
        }

        return addCompToPage(siteData, pageId, result.compStructure, isMobile);
    }

    function addCompToPage(siteData, pageId, compStructure, isMobile) {
        pageId = pageId || 'masterPage';

        var desktopChildren = (pageId === 'masterPage' ? 'children' : 'components');
        var childrenAttr = isMobile ? 'mobileComponents' : desktopChildren;

        siteData.pagesData[pageId].structure[childrenAttr] = siteData.pagesData[pageId].structure[childrenAttr] || [];
        siteData.pagesData[pageId].structure[childrenAttr].push(compStructure);

        return compStructure;
    }

    function getSiteAspectsInstances(siteAspectSiteAPI) {
        return _.mapValues(core.siteAspectsRegistry.getAllAspectConstructors(), function (AspectConstructor) {
            return new AspectConstructor(siteAspectSiteAPI);
        });
    }

    /**
     *
     * @param [siteData]
     * @param [reactSite]
     * @param [viewerPrivateServices]
     * @returns {*}
     */
    function mockSiteAPI(siteData, reactSite, viewerPrivateServices) {
        var wixSiteReact = reactSite || mockWixSiteReact(siteData, viewerPrivateServices);

        wixSiteReact.siteAPI.setCurrentPage = function(pageId){
            var compsInPage = getPageComps(siteData, pageId);
            wixSiteReact.addRenderedPage(pageId, true, compsInPage);
            wixSiteReact.props.siteData.setCurrentPage(pageId);
        };
        wixSiteReact.siteAPI.toString = function () {
            return '[mockSiteAPI object]';
        };
	    wixSiteReact.siteAPI.getSite = function () {
		    return wixSiteReact.siteAPI._site;
	    };
        wixSiteReact.siteAPI.registerMockSiteAspect = function (mockedAspectName, mockAspect) {
            var origGetSiteAspect = wixSiteReact.siteAPI.getSiteAspect;
            wixSiteReact.siteAPI.getSiteAspect = function(aspectName) {
                if (aspectName === mockedAspectName) {
                    return mockAspect;
                }

                return origGetSiteAspect.call(this, aspectName);
            };

        };
        wixSiteReact.siteAPI.getSiteWidth = _.noop;
        wixSiteReact.siteAPI.getSiteMeasureMap = function () { return {}; };

        return wixSiteReact.siteAPI;
    }

    function getPageComps(siteData, pageId) {
        var pageStructure = _.get(siteData, ['pagesData', pageId, 'structure']);
        if (!pageStructure) {
            return null;
        }
        var res = [pageStructure];
        var pageComps = pageStructure.components;
        while (pageComps.length) {
            res = res.concat(pageComps);
            pageComps = _(pageComps).map('components').flatten().compact().value();
        }

        return _(res).mapKeys('id').mapValues(simpleComp).value();
    }

    function mockSiteAspectSiteAPI(siteData, reactSite, viewerPrivateServices) {
        var wixSiteReact = reactSite || mockWixSiteReact(siteData, viewerPrivateServices);

        return wixSiteReact._aspectsSiteAPI;
    }

    /**
     *
     * @param {test.SiteData=}siteData
     * @param {core.SiteAPI=} siteAPI
     * @returns {test.compProps}
     */
    function mockCompProps(siteData, siteAPI) {
        var mySiteAPI = siteAPI || mockSiteAPI(siteData);
        return mockProps(mySiteAPI);
    }

    function mockPropsWithSiteDataAndFont() {
        var siteData = mockSiteData();
        spyOn(siteData, 'getFont').and.returnValue("normal normal normal 14px/1.4em Arial {color_15}");
        return mockProps(mockSiteAPI(siteData));
    }

    function getRuntimeDal(siteData) {
        return mockSiteAPI(siteData).getRuntimeDal();
    }

    function spyMethods(originalObject){
        return _.transform(originalObject, function(originalObjectMock, property, key){
            if (_.isFunction(property)){
                originalObjectMock[key] = jasmine.createSpy(key);
            }
        }, {});
    }

    function mockSkinBasedCompProps(style) {
        var id = _.uniqueId('compId');
        return {
            isTouchDevice: false,
            isMobileDevice: false,
            isDebugMode: false,
            id: id,
            key: id,
            refInParent: id,
            pageId: 'pageId',
            rootId: 'pageId',
            rootNavigationInfo: {pageId: 'pageId'},
            currentUrlPageId: 'currentPage',
            styleId: _.uniqueId('s'),
            style: _.assign({}, style),
            compActions: {},
            useSantaTypes: true,
            setCompState: jasmine.createSpy('setCompState'),
            registerReLayoutPending: jasmine.createSpy('registerReLayoutPending'),
            reLayoutIfPending: jasmine.createSpy('reLayoutIfPending'),
            handleAction: jasmine.createSpy('handleAction')
        };
    }

    function mockNavInfo(siteData, pageId, anchorDataId) {
        return {
            format: 'slash',
            pageId: pageId,
            title: _.get(siteData.getDataByQuery(pageId), 'title'),
            pageItemAdditionalData: null,
            anchorData: anchorDataId
        };
    }

    /**
     * @class testUtils.mockFactory
     */
    return {
        getFakeCoreWithRealSkinBased: getFakeCoreWithRealBaseMixins,
        mockProps: mockCompProps,
        mockSiteProps: mockSiteProps,
        createStructure: createStructure,
        createAnchor: createAnchorMobileAlgorithm,
        createAnchorMobileAlgorithm: createAnchorMobileAlgorithm,
        addCompToPage: addCompToPage,
        mockComponent: createCompStructureAndAddToPage,
        createCompStructure: createStructureWithDataAndProps,
        createBlankMeasureMap: createBlankMeasureMap,
        mockSiteData: mockSiteData,
        mockSiteModel: function (model, isDocumentServices) {
            model = _.merge({}, mockDefaultJsons.get.siteModel(), model);
            if (isDocumentServices) {
                delete model.publicModel;
            }
            return _.assign(model, siteDataEnhancement);
        },
        mockSiteAPI: mockSiteAPI,
        mockSiteAspectSiteAPI: mockSiteAspectSiteAPI,
        mockWixSiteReact: mockWixSiteReact,
        mockWixSiteReactFromFullJson: mockWixSiteReactFromFullJson,
        mockViewerPrivateServices: mockViewerPrivateServices,
        getRuntimeDal: getRuntimeDal,
        widgetMocks: widgetMocks,
        dataMocks: mockData,
        behaviorMocks: mockBehavior,
        connectionMocks: mockConnection,
        clientSpecMapMocks: mockClientSpecMap,
        platformMocks: mockPlatformData,
        routerMocks: mockRouter,
        actionMocks: mockAction,
        simpleComp: simpleComp,
        getMockComponentDefenition: getMockComponentDefenition,
        mockSkinBasedCompProps: mockSkinBasedCompProps,
        mockNavInfo: mockNavInfo,
        mockPropsWithSiteDataAndFont: mockPropsWithSiteDataAndFont,
        mockSiteAPIClass: function(){
            var SiteAPIMock = function(){
                return core.SiteAPI.apply(this, arguments);
            };

            SiteAPIMock.prototype = spyMethods(core.SiteAPI.prototype);

            return SiteAPIMock;
        }

    };
});


/**
 * @typedef {comp.properties} test.compProps
 */
