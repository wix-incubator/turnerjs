define(['tpa/common/TPABaseUrlBuilder'], function (TPABaseUrlBuilder) {
    'use strict';
    describe('TPA URL builder spec', function () {
        var builder;
        var baseEndPoint = "https://comments.wixplus.com/settings.html?param1=val1&param1=val3&parama2=val2";

        beforeEach(function() {
            builder = new TPABaseUrlBuilder(baseEndPoint);
        });

        describe('URL build', function () {
            it('should build only base URL', function () {
                var url = builder.build();

                expect(url).toEqual(baseEndPoint);
            });

            it('should add param to url and not override the origin params', function () {
                var url = builder.addQueryParam('param2', '123').build();
                expect(url).toEqual('https://comments.wixplus.com/settings.html?param1=val1&param1=val3&param2=123&parama2=val2');
            });

            it('should add multiple query param', function () {
                var params = {id1: 1, id2: 2};
                var url = builder.addMultipleQueryParams(params).build();
                expect(url).toContain('id1=1&id2=2');
            });

            it('should mutate iframe src', function () {
                var mutate = function(urlObj) {
                    urlObj.hash = '#state';
                    return urlObj;
                };

                var url = builder.mutateIframeSrc(mutate).build();

                expect(url).toContain('state');
            });


        });
    });

});
