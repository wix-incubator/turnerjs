define([
    'lodash',
    'documentServices/mockPrivateServices/privateServicesHelper',
    'documentServices/constants/constants',
    'documentServices/hooks/hooks',
    'definition!documentServices/mobileConversion/modules/mobilePresetStructureHandler'
], function (_, privateServicesHelper, constants, hooks, mobilePresetStructureHandlerDefinition) {
    'use strict';

    describe('mobilePresetStructureHandler', function () {

        var ps;
        var mobilePresetStructureHandler = {};
        mobilePresetStructureHandlerDefinition(null, mobilePresetStructureHandler, _, hooks);

        function getMockSerializedComponent(someNumber, components) {
            var structure = {
                id: 'mockId' + someNumber,
                layout: {x: someNumber},
                components: components || [],
                componentType: 'someType',
                mobileStructure: {layout: {x: someNumber * 2}}
            };

            hooks.executeHook(hooks.HOOKS.ADD.AFTER, '', [ps, getCompPointer(structure.id), structure]);

            return structure;
        }

        function getCompPointer(compId) {
            return {id: compId, type: constants.VIEW_MODES.DESKTOP};
        }

        beforeEach(function () {
            hooks.unregisterAllHooks();
            mobilePresetStructureHandler.registerHooks();
            this.mockComp = getMockSerializedComponent(1, [getMockSerializedComponent(2), getMockSerializedComponent(3)]);
            var mockSiteData = privateServicesHelper.getSiteDataWithPages({mainPage: {components: [this.mockComp]}});

            ps = privateServicesHelper.mockPrivateServicesWithRealDAL(mockSiteData, {siteData: [{path: ['mobileStructures'], optional: true}]});
            this.compPointer = getCompPointer(this.mockComp.id);
        });

        it('should delete mobileStructure from actual components', function () {
            hooks.executeHook(hooks.HOOKS.ADD_ROOT.AFTER, '', [ps, this.compPointer]);

            expect(ps.dal.get(getCompPointer('mockId1')).mobileStructure).toBeUndefined();
            expect(ps.dal.get(getCompPointer('mockId2')).mobileStructure).toBeUndefined();
            expect(ps.dal.get(getCompPointer('mockId3')).mobileStructure).toBeUndefined();
        });

    });
});
