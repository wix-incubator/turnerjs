define(['loggingUtils/bi/bi'], function(bi) {
    'use strict';

    describe('BI Tests', function() {

        describe('WixBI service', function() {

            it('Should be defined', function() {
                expect(bi.wixBI).toBeDefined();
            });

            it('Should have report function', function() {
                expect(bi.wixBI.report).toBeDefined();
            });

        });

        describe('Google Analytics service', function() {

            it('Should be defined', function() {
                expect(bi.googleAnalytics).toBeDefined();
            });

            it('Should have reportPageEvent function', function() {
                expect(bi.googleAnalytics.reportPageEvent).toBeDefined();
            });
        });

        describe('Facebook Remarketing service', function(){
            it('Should be defined', function(){
                expect(bi.facebookRemarketing).toBeDefined();
            });

            it('Should have reportPageEvent function', function() {
                expect(bi.facebookRemarketing.initRemarketingPixel).toBeDefined();
            });
        });

        describe('Google Remarketing service', function(){
            it('Should be defined', function(){
                expect(bi.googleRemarketing).toBeDefined();
            });

            it('Should have initRemarketingPixel function', function() {
                expect(bi.googleRemarketing.initRemarketingPixel).toBeDefined();
            });
        });

        describe('Yandex Metrika service', function(){
            it('Should be defined', function(){
                expect(bi.yandexMetrika).toBeDefined();
            });

            it('Should have initialize function', function() {
                expect(bi.yandexMetrika.initialize).toBeOfType('function');
            });

            it('Should have reportPageHit function', function() {
                expect(bi.yandexMetrika.reportPageHit).toBeOfType('function');
            });
        });
    });
});
