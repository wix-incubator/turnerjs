define(['coreUtils/core/guidUtils'], function (guidUtils) {
    'use strict';
    describe('guidUtils', function () {

        describe('getGUID', function () {
            it('should return a guid string', function () {
                spyOn(Math, 'random').and.returnValue(0.8);
                var id = guidUtils.getGUID();
                expect(id).toBe('cccccccc-cccc-4ccc-8ccc-cccccccccccc');
            });

            it('should return result of generateNewPageId if there is no popupIds', function () {
                spyOn(Date, 'now').and.returnValue(1476346521877);
                var id = guidUtils.getUniqueId();
                expect(id).toBe('iu82lmvp');
            });

            it('should return result of generateNewPageId if there is no popupIds', function () {
                var id = guidUtils._getUniqueId({}, '', '', 1476346521877);
                expect(id).toBe('iu82lmvp');
            });

            it('should return result of generateNewPageId if there is no popupIds', function () {
                var id = guidUtils._getUniqueId({lastGeneratedId: 1476346521877, counter: 0}, '', '', 1476346521877);
                expect(id).toBe('iu82lmvp1');
            });

            it('should return result of generateNewPageId if there is no popupIds', function () {
                var id = guidUtils._getUniqueId({lastGeneratedId: 1476346521877, counter: 0}, 'a', '-', 1476346521877);
                expect(id).toBe('a-iu82lmvp1');
            });
        });

        describe('generateNewPopupId', function () {
            beforeEach(function () {
                spyOn(guidUtils, 'generateNewPageId').and.returnValue('rerer');
            });

            it('should return result of generateNewPageId if there is no popupIds', function () {
                var id = guidUtils.generateNewPopupId(['ababa']);

                expect(guidUtils.generateNewPageId).toHaveBeenCalled();
                expect(id).toBe('rerer');
            });

            describe('should return increased id -', function () {
                it('when id is "00000" it should return "00001', function () {
                    expect(guidUtils.generateNewPopupId(['ababa'], ['00000'])).toBe('00001');
                });

                it('when id is "00009" it should return "0000a', function () {
                    expect(guidUtils.generateNewPopupId(['ababa'], ['00009'])).toBe('0000a');
                });

                it('when id is "0000z" it should return "00010', function () {
                    expect(guidUtils.generateNewPopupId(['ababa'], ['0000z'])).toBe('00010');
                });

                it('when id is "azzzz" it should return "b0000', function () {
                    expect(guidUtils.generateNewPopupId(['ababa'], ['azzzz'])).toBe('b0000');
                });

                it('of last popup', function () {
                    expect(guidUtils.generateNewPopupId(['ababa'], ['b0000', 'azzzz', 'a9999'])).toBe('b0001');
                });

                it('but avoid already existed ids', function () {
                    expect(guidUtils.generateNewPopupId(['ababa', '00001'], ['00000'])).toBe('00002');
                });
            });

        });

    });
});
