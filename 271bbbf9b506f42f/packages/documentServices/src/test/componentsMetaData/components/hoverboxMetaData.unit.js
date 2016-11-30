define(['lodash', 'documentServices/constants/constants',
    'documentServices/mockPrivateServices/privateServicesHelper',
    'documentServices/componentsMetaData/metaDataUtils',
    'documentServices/componentsMetaData/components/hoverboxMetaData'], function
    (_, constants, privateServicesHelper, metaDataUtils, hoverboxMetaData) {
    'use strict';

    describe('hoverbox metaData', function () {
        beforeEach(function () {
            this.siteData = privateServicesHelper.getSiteDataWithPages({
                'mainPage': {
                    components: [
                        {id: 'fiveGridLine', componentType: 'wysiwyg.viewer.components.FiveGridLine'},
                        {id: 'TPA', componentType: 'wysiwyg.viewer.components.tpapps.TPAGluedWidget'},
                        {
                            id: 'containerWithTPA', componentType: 'allowedType', components: [
                            {id: 'TPAchild', componentType: 'wysiwyg.viewer.components.tpapps.TPAGluedWidget'}
                        ]
                        },
                        {id: 'hoverbox', componentType: 'wysiwyg.viewer.components.HoverBox'}
                    ]
                }
            });
            this.ps = privateServicesHelper.mockPrivateServicesWithRealDAL(this.siteData);

            var pagePointer = this.ps.pointers.components.getPage('mainPage', constants.VIEW_MODES.DESKTOP);
            this.hoverboxPointer = this.ps.pointers.components.getComponent('hoverbox', pagePointer);
            this.tpaPointer = this.ps.pointers.components.getComponent('TPA', pagePointer);
            this.containerWithTPA = this.ps.pointers.components.getComponent('containerWithTPA', pagePointer);
            this.linePointer = this.ps.pointers.components.getComponent('fiveGridLine', pagePointer);

        });
        describe('canContainByStructure', function () {
            var childrenStructures = {
                suitable: {
                    id: 'someChild',
                    componentType: 'wysiwyg.viewer.components.FiveGridLine'
                },
                nonSuitable: {
                    id: 'someChild',
                    componentType: 'wysiwyg.viewer.components.tpapps.TPAGluedWidget'
                },
                nonSuitableRecursive: {
                    id: 'someChild',
                    componentType: 'wysiwyg.viewer.components.FiveGridLine',
                    components: [{
                        id: 'innerChild',
                        componentType: 'wysiwyg.viewer.components.FiveGridLine',
                        components: [{
                            id: 'innerNonSuitableChild',
                            componentType: 'wysiwyg.viewer.components.tpapps.TPAGluedWidget'
                        }]
                    }]
                }
            };

            it('should allow components that are suitable for non rendering state', function () {
                var res = hoverboxMetaData.canContainByStructure(this.ps, this.hoverboxPointer, childrenStructures.suitable);

                expect(res).toEqual(true);
            });

            it('should not allow components that are not suitable for non rendering state', function () {
                var res = hoverboxMetaData.canContainByStructure(this.ps, this.hoverboxPointer, childrenStructures.nonSuitable);

                expect(res).toEqual(false);
            });

            it('should check recursive children', function () {
                var res = hoverboxMetaData.canContainByStructure(this.ps, this.hoverboxPointer, childrenStructures.nonSuitableRecursive);

                expect(res).toEqual(false);
            });
        });

        describe('canContain', function () {
            it('should allow components that are suitable for non rendering state', function () {
                var res = hoverboxMetaData.canContain(this.ps, this.hoverboxPointer, this.linePointer);

                expect(res).toEqual(true);
            });

            it('should not allow components that are not suitable for non rendering state', function () {
                var res = hoverboxMetaData.canContain(this.ps, this.hoverboxPointer, this.tpaPointer);

                expect(res).toEqual(false);
            });

            it('should check recursive children', function () {
                var res = hoverboxMetaData.canContain(this.ps, this.hoverboxPointer, this.containerWithTPA);

                expect(res).toEqual(false);
            });
        });
    });
});

