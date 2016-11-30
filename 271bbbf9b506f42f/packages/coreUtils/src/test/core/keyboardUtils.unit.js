define(['lodash', 'coreUtils/core/keyboardUtils'], function (_, keyboardUtils) {
    'use strict';

    describe('testing keyboardUtils', function () {

        it('Should return the correct key code', function(){

            var keyEvent1 = {
                which: 27 // Escape
            };

            var keyEvent2 = {
                keyCode: 112 // F1
            };

            expect(keyboardUtils.getKey(keyEvent1)).toEqual(27);
            expect(keyboardUtils.getKey(keyEvent2)).toEqual(112);
        });

        it('Should translate correctly the key events', function(){

            var translatedKeys = {
                ARROWDOWN: 40,
                ARROWLEFT: 37,
                ARROWRIGHT: 39,
                ARROWUP: 38,
                ENTER: 13,
                ESCAPE: 27
            };

            _.forEach(translatedKeys, function(keyCode, keyEvent) {
                expect(keyboardUtils.keys[keyEvent]).toEqual(keyCode);
            });
        });
    });
});
