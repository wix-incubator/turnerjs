define(['documentServices/wixapps/utils/stringUtils'], function (stringUtils) {
    'use strict';

    describe('stringUtils', function () {

        describe('incNumberSuffix', function() {

            it('should add 2 as to a non number suffix', function() {
                var original = 'my test';
                var expected = 'my test 2';
                expect(stringUtils.incNumberSuffix(original)).toEqual(expected);
            });

            it('should increment an existing number suffix', function() {
                var original = 'my test 2014';
                var expected = 'my test 2015';
                expect(stringUtils.incNumberSuffix(original)).toEqual(expected);
            });

            it('should work with an empty string', function() {
                var original = '';
                var expected = ' 2';
                expect(stringUtils.incNumberSuffix(original)).toEqual(expected);
            });

            it('should add _2 when given _ as separator', function() {
                var original = 'my test';
                var expected = 'my test_2';
                expect(stringUtils.incNumberSuffix(original, '_')).toEqual(expected);
            });

            it('should increment suffix with non-space separators', function() {
                var original = 'my test_3';
                var expected = 'my test_4';
                expect(stringUtils.incNumberSuffix(original, '_')).toEqual(expected);
            });

        });

    });
});