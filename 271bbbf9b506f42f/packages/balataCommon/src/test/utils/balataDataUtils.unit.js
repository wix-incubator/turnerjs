define(['lodash', 'balataCommon/utils/balataDataUtils'], function (_, balataDataUtils) {
    'use strict';

    describe('balataDataUtils tests', function(){
        describe('createChildBalataSkinData', function(){
            it('should return object with skin and styleId', function(){
                var parentStyleId = 'parentStyle-1';
                var childBalataSkinData = balataDataUtils.createChildBalataSkinData(parentStyleId);

                expect(childBalataSkinData).toEqual({
                    skin: 'skins.viewer.balata.balataBaseSkin',
                    styleId: parentStyleId + 'balata'
                });
            });
        });

        describe('createChildBalataProps', function(){
            it('ref should be balata', function(){
                var childBalataProps = balataDataUtils.createChildBalataProps();

                expect(childBalataProps.ref).toBe('balata');
            });

            it('id should start with parent id and end with balata', function(){
                var parentId = 'comp-1';
                var childBalataProps = balataDataUtils.createChildBalataProps(parentId);

                expect(childBalataProps.id).toBe(parentId + 'balata');
            });

            it('structureComponentId should be equal to parent id', function(){
                var parentId = 'comp-1';
                var childBalataProps = balataDataUtils.createChildBalataProps(parentId);

                expect(childBalataProps.structureComponentId).toBe(parentId);
            });

            it('behaviors should be equal to parent behaviors', function(){
                var parentId = 'comp-1';
                var parentBehaviors = {parentBehaviors: 'parentBehaviors'};
                var childBalataProps = balataDataUtils.createChildBalataProps(parentId, parentBehaviors);

                expect(childBalataProps.behaviors).toBe(parentBehaviors);
            });

            it('structure should be object with behaviors', function(){
                var parentId = 'comp-1';
                var parentBehaviors = {parentBehaviors: 'parentBehaviors'};
                var childBalataProps = balataDataUtils.createChildBalataProps(parentId, parentBehaviors);

                expect(childBalataProps.structure).toEqual({behaviors: parentBehaviors});
            });

            it('compDesign should be parent compDesign', function(){
                var parentId = 'comp-1';
                var parentBehaviors = {};
                var parentCompDesign = {parentCompDesign: 'parentCompDesign'};
                var childBalataProps = balataDataUtils.createChildBalataProps(parentId, parentBehaviors, parentCompDesign);

                expect(childBalataProps.compDesign).toBe(parentCompDesign);
            });

            it('compActions should be the given compActions', function(){
                var parentId = 'comp-1';
                var parentBehaviors = {};
                var parentCompDesign = {};
                var compActions = {compActions: 'compActions'};
                var childBalataProps = balataDataUtils.createChildBalataProps(parentId, parentBehaviors, parentCompDesign, compActions);

                expect(childBalataProps.compActions).toBe(compActions);
            });
        });
    });
});
