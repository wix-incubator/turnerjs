define(['tpa/common/TPAUrlBuilder'], function (TPAUrlBuilder) {
    'use strict';
    describe('TPA URL builder spec', function () {
        var builder;
        var baseEndPoint = "https://comments.wixplus.com/settings.html";

        beforeEach(function() {
            builder = new TPAUrlBuilder(baseEndPoint);
        });

        describe('URL build', function () {
            it('should build only base URL', function () {
                var url = builder.build();

                expect(url).toEqual(baseEndPoint);
            });

            it('should add instance param', function () {
                var url = builder.addInstance('123').build();

                expect(url).toContain('instance=123');
            });

            it('should not add instance param', function () {
                var url = builder.addInstance('').build();

                expect(url).not.toContain('instance');
            });

            it('should add width param', function () {
                var url = builder.addWidth('500').build();

                expect(url).toContain('width=500');
            });

            it('should add locale param', function () {
                var url = builder.addLocale('en').build();

                expect(url).toContain('locale=en');
            });

            it('should add view mode param', function () {
                var url = builder.addViewMode('editor').build();

                expect(url).toContain('viewMode=editor');
            });

            it('should add comp id param', function () {
                var url = builder.addCompId('123').build();

                expect(url).toContain('compId=123');
            });

            it('should add device type param', function () {
                var url = builder.addDeviceType('DESKTOP').build();

                expect(url).toContain('deviceType=DESKTOP');
            });

            it('should add arbitrary query param', function () {
                var params = {id1: 1, id2: 2};
                var url = builder.addMultipleQueryParams(params).build();
                expect(url).toContain('id1=1&id2=2');
            });

            it('should add endpoint type param', function () {
                var url = builder.addEndpointType('xxx').build();

                expect(url).toContain('endpointType=xxx');
            });

            it('should add orig comp id param', function () {
                var url = builder.addOrigCompId('123').build();

                expect(url).toContain('origCompId=123');
            });

            it('should mutate iframe src', function () {
                var mutate = function(urlObj) {
                    urlObj.hash = '#state';
                    return urlObj;
                };

                var url = builder.mutateIframeSrc(mutate).build();

                expect(url).toContain('state');
            });

            it('should add externalId param', function () {
                var url = builder.addExternalId('123-4567').build();

                expect(url).toContain('externalId=123-4567');
            });

            it('should add origin param if not null', function () {
                var url = builder.addOrigin('gfpp_productPage').build();

                expect(url).toContain('origin=gfpp_productPage');
            });

            it('should not add origin param if null', function () {
                var url = builder.addOrigin(null).build();

                expect(url).not.toContain('origin=');
            });

            it('should not add origin param if empty string', function () {
                var url = builder.addOrigin('').build();

                expect(url).not.toContain('origin=');
            });

            it('should filter query params', function () {
                var url = builder.addLocale('en')
                    .addEndpointType('xxx')
                    .addOrigCompId('123')
                    .addDeviceType('DESKTOP')
                    .filterQueryParams(['endpointType', 'deviceType'])
                    .build();

                expect(url).toContain('deviceType=DESKTOP');
                expect(url).toContain('endpointType=xxx');
                expect(url).not.toContain('origCompId=123');
                expect(url).not.toContain('lang=en');
            });
        });
    });

});
