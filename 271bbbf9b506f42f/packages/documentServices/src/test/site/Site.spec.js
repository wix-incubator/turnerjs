define(['lodash', 'utils', 'testUtils',
    'core',
    'documentServices/site/Site',
    'documentServices',
    'dataFixer',
    'experiment'], function
    (_, utils, testUtils, core, Site, documentServices, dataFixer, experiment) {
    'use strict';

    describe('document services Site', function () {
        describe('constructor', function () {
            beforeEach(function () {
                this.jsonConfig = documentServices.configs.test.getConfig();
                this.siteData = testUtils.mockFactory.mockSiteData({
                    documentServicesModel: {
                        metaSiteData: {
                            indexable: {}
                        },
                        permissionsInfo: {
                            permissions: {}
                        }
                    }
                });
                this.siteDataWrapper = core.SiteDataAPI.createSiteDataAPIAndDal(this.siteData, {});
            });

            it('should send the post message if should not render site', function (done) {
                window.parent = {
                    postMessage: function (name) {
                        expect(name).toBe('documentServicesLoaded');
                        done();
                    }
                };

                var dataFixers = function (pagesData) {
                    return pagesData;
                };

                expect(this.jsonConfig.shouldRender).toBe(false);
                var dsSite = new Site(this.jsonConfig,
                    this.siteDataWrapper,
                    dataFixers,
                    _.noop);

                expect(dsSite).toBeDefined();
            });

            it('should run data fixers and set the result to the JSON', function () {
                var dataFixers = function (pagesData) {
                    pagesData.masterPage.structure.someProp = 'someValue';

                    return pagesData;
                };

                var dsSite = new Site(this.jsonConfig,
                    this.siteDataWrapper,
                    dataFixers,
                    _.noop);

                var masterPagePointer = dsSite.ps.pointers.components.getMasterPage(this.siteData.getViewMode());
                var masterPageStructure = dsSite.ps.dal.get(masterPagePointer);

                expect(masterPageStructure.someProp).toEqual('someValue');
            });

            it('should add SITE_STRUCTURE to deleted data ids if it was deleted by data fixers', function () {
                _.set(this.siteData.pagesData, 'masterPage.data.document_data.SITE_STRUCTURE', _.get(this.siteData.pagesData, 'masterPage.data.document_data.masterPage'));
                delete this.siteData.pagesData.masterPage.data.document_data.masterPage;

                var dataFixers = function (pagesData) {
                    return _.mapValues(pagesData, function (page) {
                        return dataFixer.fix(page);
                    });
                };

                var dsSite = new Site(this.jsonConfig,
                    this.siteDataWrapper,
                    dataFixers,
                    _.noop);

                var orphanDataNodesPointer = dsSite.ps.pointers.general.getOrphanPermanentDataNodes();
                var orphanDataNodes = dsSite.ps.dal.get(orphanDataNodesPointer);

                expect(orphanDataNodes).toEqual(['SITE_STRUCTURE']);
            });

            describe('Document Services Public Functions Deprecation', function(){
                it('should warn for functions that will be deprecated ', function () {
                    spyOn(utils.log, 'warnDeprecation');

                    var deprecatedFnConfig = _.clone(this.jsonConfig);
                    deprecatedFnConfig.modules = [
                        {
                            methods: {
                                someAPI: {
                                    someFn: {deprecated: true, deprecationMessage: 'use another API', methodDef: _.noop}
                                }
                            }
                        }
                    ];

                    var dsSite = new Site(deprecatedFnConfig, this.siteDataWrapper);

                    dsSite.someAPI.someFn();
                    expect(utils.log.warnDeprecation).toHaveBeenCalledWith('use another API|someFn');
                });
            });

            describe('openRemoveJsonAnchors', function () {
                describe('when openRemoveJsonAnchors is open ', function () {
                    beforeEach(function(){
                        this.runningExperiments = {};
                        window.rendererModel = this.siteDataWrapper.siteData.rendererModel;

                        this.runningExperiments.openRemoveJsonAnchors = "new";
                        this.runningExperiments.removeJsonAnchors = "old";
                        this.siteDataWrapper.siteData.rendererModel.runningExperiments = this.runningExperiments;
                    });

                    afterEach(function () {
                        delete window.rendererModel;
                    });

                    it('should return true if masterPage children have no anchors', function () {
                        var masterPage = this.siteDataWrapper.fullPagesData.pagesData.masterPage;
                        masterPage.structure.children = _.map(masterPage.structure.children, function (comp) {
                            comp.layout.anchors = undefined;
                            return comp;
                        });

                        /*eslint no-new:0*/
                        new Site(this.jsonConfig,
                            this.siteDataWrapper,
                            null,
                            _.noop);

                        expect(experiment.isOpen('removeJsonAnchors')).toBeTruthy();
                    });

                    it('should return false if masterPage children have anchors, and no landing pages', function () {
                        var masterPage = this.siteDataWrapper.fullPagesData.pagesData.masterPage;
                        masterPage.structure.children = _.map(masterPage.structure.children, function (comp) {
                            comp.layout.anchors = [];
                            return comp;
                        });

                        /*eslint no-new:0*/
                        new Site(this.jsonConfig,
                            this.siteDataWrapper,
                            null,
                            _.noop);

                        expect(experiment.isOpen('removeJsonAnchors')).toBeFalsy();
                    });

                    it('should return true if removeJsonAnchors is open, even if masterPage children still have anchors', function () {
                        this.runningExperiments.removeJsonAnchors = "new";
                        var masterPage = this.siteDataWrapper.fullPagesData.pagesData.masterPage;
                        masterPage.structure.children = _.map(masterPage.structure.children, function (comp) {
                            comp.layout.anchors = [];
                            return comp;
                        });

                        /*eslint no-new:0*/
                        new Site(this.jsonConfig,
                            this.siteDataWrapper,
                            null,
                            _.noop);

                        expect(experiment.isOpen('removeJsonAnchors')).toBeTruthy();
                    });
                });


            });
        });

    });

});
