define(['lodash', 'documentServices/component/componentsDefinitionsMap.json'],
    function (_, componentsDefinitionsMap) {
    'use strict';

    describe('componentsDefinitionsMap', function () {
        it('should have a nickname for every component', function () {

            var componentsWithoutNickNames = _(componentsDefinitionsMap)
                .omit(_.property('nickname'))
                .keys()
                .value();

            expect(componentsWithoutNickNames).toEqual([]);
            expect(componentsWithoutNickNames.length).toEqual(0);
        });
    });
});
