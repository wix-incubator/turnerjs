define([
    'testUtils',
    'core/components/actionsAspectActions/screenInAction'], function
    (testUtils, ScreenInAction) {
    'use strict';

    describe('screenInAction aspect', function () {
        var screenInAction;

        beforeEach(function () {
            var mockSiteAPI = testUtils.mockFactory.mockSiteAPI();
            screenInAction = new ScreenInAction(mockSiteAPI);
        });

        describe('isDescendantOf', function () {
            var compStructure = {
                components: [
                    {id: 1},
                    {id: 2},
                    {id: 3,
                        components: [
                            {id: 31},
                            {id: 'target'}
                        ]
                    },
                    {id: 4}
                ]
            };

            it('should return true if target is a descendant of comp', function () {
                var result = screenInAction.isDescendantOf(compStructure, 'target');

                expect(result).toEqual(true);
            });

            it('should return false if target is not a descendant of comp', function () {
                var result = screenInAction.isDescendantOf(compStructure, 'other');

                expect(result).toEqual(false);
            });
            
            it('should return false if target component has no children', function(){
                var emptyCompStructure = {};

                var result = screenInAction.isDescendantOf(emptyCompStructure, 'other');

                expect(result).toEqual(false);
            });

        });
    });
});