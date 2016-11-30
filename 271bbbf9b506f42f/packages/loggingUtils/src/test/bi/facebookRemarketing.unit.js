define(['lodash', 'loggingUtils/bi/services/facebookRemarketing'], function(_, facebookRemarketing){
    'use strict';

    describe('facebookRemarketing', function(){

        it('should be defined', function(){
            expect(facebookRemarketing).toBeDefined();
        });

        it('should have "initRemarketingPixel" method', function(){
            expect(facebookRemarketing.initRemarketingPixel).toBeDefined();
        });

        beforeEach(function(){
            window._fbq = undefined;
        });

        // Do not write tests that relay on external resources
        xdescribe('when a valid accountId is passed to "initRemarketingPixel" function', function(){

            it('should create "_fbq" property on the global (window) scope', function(){
                var validAccountId = ["12345"];

                facebookRemarketing.initRemarketingPixel(validAccountId);

                expect(window._fbq).toBeDefined();
            });

            it('should push two elements to "_fbq" array with a specific structure', function(){
                var validAccountId = ["12345"];
                var validFirstElement = ["addPixelId", "12345"];
                var validSeconfElement = ['track', 'PixelInitialized', {}];

                facebookRemarketing.initRemarketingPixel(validAccountId);

                expect(window._fbq.length).toBe(2);
                expect(_.isEqual(window._fbq[0], validFirstElement)).toBe(true);
                expect(_.isEqual(window._fbq[1], validSeconfElement)).toBe(true);
            });
        });

        // Do not write tests that relay on external resources
        xdescribe('when an invalid accountId is passed to "initRemarketingPixel" function', function(){

            it('should do nothing when the "accountId" is not an array', function(){
                var invalidAccountIdArg = "notAnArray";

                facebookRemarketing.initRemarketingPixel(invalidAccountIdArg);

                expect(window._fbq).not.toBeDefined();
            });

            it('should do nothing when the "accountId[0]" is not a Number', function(){
                var invalidAccountIdArg = ["notANumber"];

                facebookRemarketing.initRemarketingPixel(invalidAccountIdArg);

                expect(window._fbq).not.toBeDefined();
            });

            it('should do nothing when the "accountId" contains more than 1 element', function(){
                var invalidAccountIdArg = ["123", "456"];

                facebookRemarketing.initRemarketingPixel(invalidAccountIdArg);

                expect(window._fbq).not.toBeDefined();
            });
        });


    });
});
