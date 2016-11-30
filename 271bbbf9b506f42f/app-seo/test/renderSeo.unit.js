define(['app-seo/partials/renderSeo'], function(prepareRenderSeo) {
    'use strict';

    describe('prepareRenderSeo partial', function() {


        it('should prefetch the packages needed by the seo rendering process and expose renderSeo', function() {
            givenPrepareRenderSeoWasCalled.call(this);

            expect(this.window.renderSeo).toBeDefined();
            expect(this.window.renderSeo).toEqual(jasmine.any(Function));
        });

        describe('renderSeo', function() {
            it('should fail if no public model was exposed on window', function() {
                givenPrepareRenderSeoWasCalled.call(this);

                this.window.publicModel = undefined;

                expect(this.window.renderSeo).toThrowError(/Public model/);
            });

            it('should fail if no renderer model was exposed on window', function() {
                givenPrepareRenderSeoWasCalled.call(this);

                this.window.rendererModel = undefined;

                expect(this.window.renderSeo).toThrowError(/Renderer model/);
            });

            it('should fail if no current URL was exposed on window', function() {
                givenPrepareRenderSeoWasCalled.call(this);

                this.window.currentUrl = undefined;

                expect(this.window.renderSeo).toThrowError(/Current URL/);
            });

            it('should use the addExperimentsFromQuery to expose the experiments on the renderer model', function() {
                givenPrepareRenderSeoWasCalled.call(this);

                var runningExperiments = {wixCode: 'new'};

                this.window.rendererModel.runningExperiments = runningExperiments;

                this.window.renderSeo();

                expect(this.addExperimentsFromQuery).toHaveBeenCalledWith(runningExperiments, this.queryUtil, 'viewer');
            });

            it('should build and expose the siteModel', function() {
                givenPrepareRenderSeoWasCalled.call(this);

                var currentUrl = 'fakeurl.com';

                this.utils.urlUtils.parseUrl.and.returnValue(currentUrl);

                this.window.renderSeo();

                expect(this.convertSiteModel).toHaveBeenCalledWith(this.window.rendererModel, this.window.publicModel);
                expect(this.window.siteModel).toBeDefined();
                expect(this.window.siteModel.currentUrl).toEqual(currentUrl);
                expect(this.window.siteModel.santaBase).toEqual(this.requireConfig.baseUrl);
                expect(this.window.siteModel.baseVersion).toEqual(null);
                expect(this.window.siteModel.santaBaseFallbackUrl).toEqual(null);
            });

            it('should initialize wixCodeInit package and call the renderSeo method on the wixCodeSeo package', function() {
                givenPrepareRenderSeoWasCalled.call(this);
                var wixCodeAppApi = {};
                this.wixCodeInit.getAppApi.and.returnValue(wixCodeAppApi);

                this.window.renderSeo();

                expect(this.wixCodeInit.initMainR).toHaveBeenCalledWith(wixCodeAppApi, this.window.siteModel, false, this.queryUtil);
                expect(this.wixCodeSeo.renderSeo).toHaveBeenCalledWith(this.ajaxHandler, this.window.siteModel, jasmine.objectContaining({
                    wixCodeAppApi: wixCodeAppApi
                }));
            });
        });

        function givenPrepareRenderSeoWasCalled() {
            this.requireConfig = {
                baseUrl: ''
            };
            this.packageLoader = jasmine.createSpy('packageLoader');
            this.queryUtil = jasmine.createSpy('queryUtil');
            this.joinURL = jasmine.createSpy('joinURL');
            this.ajaxHandler = jasmine.createSpy('fakeAjaxHandler');
            this.addExperimentsFromQuery = jasmine.createSpy('addExperimentsFromQuery');
            this.convertSiteModel = jasmine.createSpy('convertSiteModel');
            this.serviceTopology = {};
            this.cookie = '';

            this.window = {
                publicModel: {},
                rendererModel: {},
                currentUrl: 'wixcodesite.wix.com',
                navigator: {
                    userAgent: 'Chrome'
                },
                location: {
                    protocol: 'http',
                    host: 'localhost',
                    pathname: ''
                }
            };

            this.wixCodeInit = jasmine.createSpyObj('wixCodeInit', ['getAppApi', 'initMainR']);
            this.wixCodeSeo = jasmine.createSpyObj('wixCodeSeo', ['renderSeo']);
            this.utils = {
                urlUtils: jasmine.createSpyObj('urlUtils', ['parseUrl']),
                storage: jasmine.createSpy('storage')
            };
            this.siteModel = {};

            var self = this;

            this.convertSiteModel.and.returnValue(this.siteModel);

            this.packageLoader.and.callFake(function(config, seoPackages, cb) {
                cb({wixCodeInit: self.wixCodeInit, wixCodeSeo: self.wixCodeSeo, utils: self.utils}, self.ajaxHandler);
            });

            prepareRenderSeo(
                this.requireConfig,
                this.packageLoader,
                this.queryUtil,
                this.joinURL,
                this.addExperimentsFromQuery,
                this.convertSiteModel,
                this.serviceTopology,
                this.cookie,
                this.window
            );
        }
    });
});
