define(['lodash', 'loggingUtils/bi/services/yandexMetrika'], function(_, yandexMetrika){
    'use strict';

    describe('YandexMetrika', function () {

        it('Should be defined', function () {
            expect(yandexMetrika).toBeDefined();
        });

        describe('ReportPageHit', function () {

            /*
             Yandex code creates a global property window.yaCounterXXX (where XXX is the account id)
             with a hit() function to be called on page transition.
             reportPageHit will call that function if YandexMetricaScript was successfully loaded
             http://help.yandex.com/metrica/code/ajax-flash.xml
             */


            it('Should have reportPageHit method', function () {
                expect(yandexMetrika.reportPageHit).toBeOfType('function');
            });

        });
    });
});
