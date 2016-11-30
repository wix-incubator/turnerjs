define(['lodash', 'loggingUtils/bi/services/googleRemarketing'], function(_, googleRemarketing){
    'use strict';
    describe('Google Remarketing', function(){

        it('Should be defined', function(){

            expect(googleRemarketing).toBeDefined();
        });

        it('Should have "initRemarketingPixel" method', function(){

            expect(googleRemarketing.initRemarketingPixel).toBeOfType('function');
        });

        it('Should have "fireRemarketingPixel" method', function(){

            expect(googleRemarketing.fireRemarketingPixel).toBeOfType('function');
        });

        describe('Initialization for valid account id', function(){

            beforeEach(function(){
                window.google_trackConversion = undefined;
            });

            // This test creates a script tag that downloads script file and verifies it ran.
            // This shouldn't be tested in a UnitTest.
            xit("Should define 'google_trackConversion' property on the global scope", function(done){
                var validAccountIdParam = [915152591];
                googleRemarketing.initRemarketingPixel(validAccountIdParam);

                function finish(){
                    clearInterval(interval);
                    clearTimeout(timeout);
                    expect(window.google_trackConversion).toBeOfType('function');
                    done();
                }

                function finishIfDefined(){
                    if (typeof window.google_trackConversion === 'function') {
                        finish();
                    }
                }

                var interval = setInterval(finishIfDefined, 10);
                var timeout = setTimeout(finish, 500);

            });
        });
    });
});
