define(['lodash', 'core', 'render/render', 'react', 'utils', 'documentServices', 'testUtils'], function
    (_, core, render, React, utils, documentServices, testUtils) {
    'use strict';

    describe('Clientside Rendering', function () {
        var conditionalPackages, ajaxHandler, siteModel, queryUtil;

        beforeEach(function(){
            conditionalPackages = {};
            ajaxHandler = {};
            siteModel = testUtils.mockFactory.mockSiteModel();
            queryUtil = {
                getParameterByName: function(){ return 'someOrigin';}
            };

            var siteContainer = window.document.createElement('div');
            siteContainer.id = "SITE_CONTAINER";
            window.document.body.appendChild(siteContainer);
            var fakeSite = React.createElement('div');
            spyOn(core.renderer, 'renderSite').and.callFake(function(siteData, viewerPrivateServices, props, renderDoneCallback){
                window.rendered = {
                    registerAspectToEvent: _.noop,
                    forceUpdate: _.noop
                };
                renderDoneCallback(fakeSite);
            });
        });

        afterEach(function(){
            delete window.documentServices; //rendering with DS makes the window dirty..
            delete window.rendered; //rendering with DS makes the window dirty..
        });

        function fakeDataFixer(pageJson){
            if (pageJson.structure.type === 'Document'){
                pageJson.data.document_data.newItem = {};
            }
            return pageJson;
        }

        it('should call done when finishing to render the site', function () {

            function testRender(){
                render.clientSide(conditionalPackages, ajaxHandler, siteModel, queryUtil);
            }
            expect(testRender).not.toThrow();
            expect(core.renderer.renderSite).toHaveBeenCalled();
        });

        it('should throw if dsOrigin is not present in parameters', function() {
            spyOn(queryUtil, 'getParameterByName').and.returnValue({});
            conditionalPackages.documentServices = {};

            function testRender(){
                render.clientSide(conditionalPackages, ajaxHandler, siteModel, queryUtil);
            }
            expect(testRender).toThrow();
            expect(core.renderer.renderSite).not.toHaveBeenCalled();
        });

        it('should run data fixers when there is no document services', function(){
            spyOn(utils.dataFixer, 'fix').and.callFake(fakeDataFixer);

            render.clientSide(conditionalPackages, ajaxHandler, siteModel, queryUtil);

            expect(utils.dataFixer.fix).toHaveBeenCalled();
        });

        function mockStuff(){
            spyOn(utils.dataFixer, 'fix').and.callFake(fakeDataFixer);
            spyOn(utils.ajaxLibrary, 'ajax');
            siteModel.currentUrl.query.dsOrigin = 'my DS Origin';

            siteModel.documentServicesModel = {
                metaSiteData: {},
                permissionsInfo: {}
            };

            var configsForTest = _.clone(documentServices.configs);
            configsForTest.fullFunctionality = configsForTest.test;
            var documentServicesForTest = _.defaults({
                configs: configsForTest
            }, documentServices);

            conditionalPackages.documentServices = documentServicesForTest;
        }

        it('should ONLY fix pages data after creating private services - so that the initial snapshot of the privateServices is what we got from the server', function(){
            mockStuff();

            render.clientSide(conditionalPackages, ajaxHandler, siteModel, queryUtil);
            window.documentServices.save();

            var dataToSave = utils.ajaxLibrary.ajax.calls.argsFor(0)[0].data;
            expect(_.get(dataToSave, 'dataDelta.document_data.newItem')).toBeDefined();
        });

        it('should load the DS with a custom config from url', function(){
            mockStuff();
            siteModel.currentUrl.query.configName = 'siteInfo_v2'; //read only
            render.clientSide(conditionalPackages, ajaxHandler, siteModel, queryUtil);
            var pageData = window.documentServices.pages.getPagesData()[0];
            var pageId = pageData.id;
             expect(function(){window.documentServices.pages.duplicate(pageId);}).toThrowError('you are in read only mode, so you cannot do this!!');

        });

        it('should load the DS with fullFunctionalityConfig is the specified config in url is non existent', function(){
            mockStuff();
            siteModel.currentUrl.query.configName = 'nonExistent';
            render.clientSide(conditionalPackages, ajaxHandler, siteModel, queryUtil);
            var pageData = window.documentServices.pages.getPagesData()[0];
            var pageId = pageData.id;
             expect(function(){window.documentServices.pages.duplicate(pageId);}).not.toThrow();
        });

        it('should set renderFlags according to query parameters', function() {
            spyOn(utils.urlUtils, 'isQueryParamOn').and.returnValue(true);

            function testRender(){
                render.clientSide(conditionalPackages, ajaxHandler, siteModel, queryUtil);
            }
            expect(testRender).not.toThrow();
            expect(siteModel.renderFlags.componentViewMode).toEqual('editor');
            expect(siteModel.renderFlags.isSocialInteractionAllowed).toEqual(false);
        });

        it('should not set renderFlags if query parameters are not there', function() {
            spyOn(utils.urlUtils, 'isQueryParamOn').and.returnValue(false);

            function testRender(){
                render.clientSide(conditionalPackages, ajaxHandler, siteModel, queryUtil);
            }
            expect(testRender).not.toThrow();
            expect(siteModel.renderFlags.componentViewMode).toEqual('preview');
            expect(siteModel.renderFlags.isSocialInteractionAllowed).toEqual(true);
        });


    });
});
