define(['lodash', 'coreUtils', 'definition!loggingUtils/bi/services/wixBI'], function(_, coreUtils, WixBIDef) {
    'use strict';

    describe('WixBI Tests', function() {

        var wixBI, pixel, siteData;
        var srcRegexp = /(http:\/\/[^\/]*)\/([^?]*)\?(.*)/;

        beforeEach(function() {
            pixel = {}; // EMPTY OBJECT!! YAY!!
            siteData = {wixBiSession: {initialTimeStamp: 1000, viewerSessionId: 123}};
            spyOn(window, 'Image').and.returnValue(pixel);

            wixBI = new WixBIDef(_, coreUtils);
        });

        it('Should have report function', function() {
            expect(wixBI.report).toBeDefined();
        });

        describe('URL', function() {

            it('Should report to default url if no biUrl parameter is given', function() {
                var options = {};

                wixBI.report(siteData, options);

                var match = pixel.src.match(srcRegexp);
                expect(match[1]).toEqual('http://frog.wixpress.com');
            });

            it('Should report to given server', function() {
                var options = {
                    biUrl: "http://someurl.com"
                };

                wixBI.report(siteData, options);

                var match = pixel.src.match(srcRegexp);
                expect(match[1]).toEqual(options.biUrl);
            });

            it('Should report to given adapter', function() {
                var options = {
                    adapter: "hed"
                };

                wixBI.report(siteData, options);

                var match = pixel.src.match(srcRegexp);
                expect(match[1]).toEqual('http://frog.wixpress.com');
                expect(match[2]).toEqual(options.adapter);
            });
        });

        describe('Params', function() {

            it('Should have ts property', function() {
                var options = { };

                wixBI.report(siteData, options);

                var match = pixel.src.match(srcRegexp);
                expect(_.includes(match[3], "ts")).toBe(true);
            });

            it('Should report with given params', function() {
                var options = {
                    params: {a: "1", b: "2"}
                };

                wixBI.report(siteData, options);

                var match = pixel.src.match(srcRegexp);
                expect(_.includes(match[3], "a=1")).toBe(true);
                expect(_.includes(match[3], "b=2")).toBe(true);
            });

            it('Should report with given query string', function() {
                var options = {
                    queryString: "a=1&b=2"
                };

                wixBI.report(siteData, options);

                var match = pixel.src.match(srcRegexp);
                expect(_.includes(match[3], "a=1&b=2")).toBe(true);
            });
        });

    });
});
