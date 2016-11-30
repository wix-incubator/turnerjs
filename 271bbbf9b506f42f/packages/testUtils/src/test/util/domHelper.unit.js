define(['testUtils/util/domHelper'], function (domHelper) {
    'use strict';

    describe('domHelper', function () {
        it('should return empty object when element has no custom style', function () {
            var element = window.document.createElement('div');
            var actual = domHelper.getStyleObject(element);

            expect(actual).toEqual({});
        });

        it('should have camelCase properties of style object', function () {
            var element = window.document.createElement('div');
            element.style.backgroundColor = 'red';
            var actual = domHelper.getStyleObject(element);

            expect(actual).toEqual({backgroundColor: 'red'});
        });

        it('should not get illegal style values', function () {
            var element = window.document.createElement('div');
            element.style.backgroundColor = '123';
            var actual = domHelper.getStyleObject(element);

            expect(actual).toEqual({});
        });
    });
});
