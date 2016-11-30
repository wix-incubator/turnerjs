define(['documentServices/siteMetadata/siteMetadata',
        'documentServices/tpa/utils/AppMarketUrlBuilder',
        'documentServices/tpa/constants',
        'testUtils'], function (siteMetadata, AppMarketUrlBuilder, tpaConstants, testUtils) {
    'use strict';
    describe('App market URL builder spec', function () {
        var builder;

        beforeEach(function() {
            builder = new AppMarketUrlBuilder(tpaConstants.APP_MARKET.EDITOR_BASE_URL);
        });

        describe('URL build', function () {
            it('should build only base URL', function () {
                var url = builder.build();

                expect(url).toEqual(tpaConstants.APP_MARKET.EDITOR_BASE_URL);
            });

            it('should add language param', function () {
                var url = builder.addLangParam('en').build();

                expect(url).toContain('lang=en');
            });

            it('should add origin param', function () {
                var origin = 'http://editor.wix.com';
                var url = builder.addOriginParam(origin).build();

                expect(url).toContain('eo=' + window.btoa(origin));
            });

            it('should add dev application ID param', function () {
                var url = builder.addDevAppParam('dev-app-id').build();

                expect(url).toContain('appDefinitionId=dev-app-id');
            });

            it('should add compId param', function () {
                var url = builder.addCompIdParam().build();

                expect(url).toContain('compId=MarketPanel');
            });

            it('should add experiments param', function () {
                var url = builder.addAppMarketTests(['experiment1', 'experiment2']).build();

                expect(url).toContain('experiment=experiment1');
                expect(url).toContain('experiment=experiment2');
            });

            it('should add meta site ID param', function () {
                var url = builder.addMetaSiteIdParam('meta-site-id').build();

                expect(url).toContain('/meta-site-id');
            });

            it('should add meta site ID param as query param', function () {
                testUtils.experimentHelper.openExperiments('reactAppMarket');
                var url = builder.addMetaSiteIdParam('meta-site-id', true).build();

                expect(url).toContain('metaSiteId=meta-site-id');
                expect(url).not.toContain('/meta-site-id');
            });

            it('should not add meta site ID param as query param in case newUrl is not passed', function () {
                testUtils.experimentHelper.openExperiments('reactAppMarket');
                var url = builder.addMetaSiteIdParam('meta-site-id').build();

                expect(url).not.toContain('metaSiteId=meta-site-id');
                expect(url).toContain('/meta-site-id');
            });

            it('should add site ID param', function () {
                var url = builder.addSiteIdParam('site-1').build();

                expect(url).toContain('siteId=site-1');
            });

            it('should add tags param', function () {
                var url = builder.addTagsParam('tag-test').build();

                expect(url).toContain('query=tag-test');
            });

            it('should add open app tag param', function () {
                var url = builder.addOpenAppParam('open-app-tag-test').build();

                expect(url).toContain('openAppDefId=open-app-tag-test');
            });

            it('should add newWixStores', function () {
                var url = builder.addNewWixStores(false).build();

                expect(url).toContain('newWixStores=false');
            });

            it('should not add an empty query param', function () {
                var url = builder.addLangParam().build();

                expect(url).not.toContain('lang');
            });

            it('should add category param', function () {
                var url = builder.addCategoryParam('test-cat').build();

                expect(url).toContain('categorySlug=test-cat');
            });
        });
    });

});
