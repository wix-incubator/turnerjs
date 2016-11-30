define(['lodash', 'coreUtils', 'siteUtils/core/modesUtils'], function
    (_, coreUtils, /** modesUtils */modesUtils) {
    'use strict';

    describe('modes utils', function () {
        beforeEach(function () {
            this.defaultModeId = 'default-mode';
            this.nonDefaultModeId = 'non-default;';
            this.otherNonDefaultModeId = 'non-default-2';
            this.compModesDefinitions = [{
                modeId: this.defaultModeId,
                type: coreUtils.siteConstants.COMP_MODES_TYPES.DEFAULT
            }, {
                modeId: this.nonDefaultModeId,
                type: coreUtils.siteConstants.COMP_MODES_TYPES.SCROLL
            }, {
                modeId: this.otherNonDefaultModeId,
                type: coreUtils.siteConstants.COMP_MODES_TYPES.SCROLL
            }];
        });

        describe('getActiveComponentModeIds', function () {

            it('should return the active modes ids out of the component mode definitions', function () {
                var activeModes = {
                    notRelatedMode: true
                };
                activeModes[this.nonDefaultModeId] = true;
                activeModes[this.otherNonDefaultModeId] = true;

                var result = modesUtils.getActiveComponentModeIds(activeModes, this.compModesDefinitions);

                expect(_.keys(result).length).toEqual(2);
                expect(result[this.nonDefaultModeId]).toEqual(true);
                expect(result[this.otherNonDefaultModeId]).toEqual(true);
            });
        });


    });
});
