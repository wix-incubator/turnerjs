import { changeDeepProperty } from '../../src/utils/builders/DeepPropertyChanger';

describe('Deep Property', () => {
    let initialObject;

    beforeEach(function () {
        initialObject = {
            level_0: {
                level_1: {
                    prop: 'value'
                }
            },
            lev_1: [1, 2, 3]
        };
    });

    it('should return new object with changed proprty, simple property', () => {
        const resultObject = changeDeepProperty('level_0.level_1.prop', 'new_value', initialObject);
        expect(resultObject.level_0.level_1.prop).toEqual('new_value');
    });

    it('should change value of an array item', () => {
        const resultObject = changeDeepProperty('lev_1.1', {test: 1}, initialObject);
        expect(resultObject.lev_1[1]).toEqual({test: 1});
    });

    it('should change object to new object', () => {
        const resultObject = changeDeepProperty('level_0', {test: 1}, initialObject);
        expect(resultObject.level_0).toEqual({test: 1});
    });
});
