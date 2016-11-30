define(['lodash', 'dataFixer/plugins/fiveGridLineLayoutFixer'], function(_, dataFixer) {
    'use strict';

    describe('fiveGridLineLayoutFixer spec', function () {
        function mockCompStructure(skin, layout, components) {
            return {
                skin: skin,
                layout: layout,
                components: components
            };
        }

        beforeEach(function () {
            this.page = {
                structure: {
                    id: 'page',
                    components: [],
                    mobileComponents: [],
                    layout: {height: 100, y: 0}
                },
                data: {document_data: {}, theme_data: {}, component_properties: {}}
            };
        });

        describe('When a fiveGridLine components have a width larger than its skin\'s minimum width', function () {

            var layout = {width: 250};

            it('Should keep the component width', function () {
                this.page.structure.components = [
                    mockCompStructure('wysiwyg.viewer.skins.line.FadeLine', layout),
                    mockCompStructure('wysiwyg.viewer.skins.line.FadeNotchBottomLine', layout),
                    mockCompStructure('wysiwyg.viewer.skins.line.FadeNotchTopLine', layout),
                    mockCompStructure('wysiwyg.viewer.skins.line.ShadowBottomLine', layout),
                    mockCompStructure('wysiwyg.viewer.skins.line.ShadowTopLine', layout)
                ];

                dataFixer.exec(this.page);

                _.forEach(this.page.structure.components, function (comp) {
                    expect(comp.layout.width).toEqual(layout.width);
                });
            });

        });

        describe('When a fiveGridLine components have a width smaller than its skin\'s minimum width', function () {

            var layout = {width: 5};

            it('Should set the component width according to its skin\'s minimum width', function () {
                var compStructureMap = {
                    fadeLine: mockCompStructure('wysiwyg.viewer.skins.line.FadeLine', layout),
                    fadeNotchBottomLine: mockCompStructure('wysiwyg.viewer.skins.line.FadeNotchBottomLine', layout),
                    fadeNotchTopLine: mockCompStructure('wysiwyg.viewer.skins.line.FadeNotchTopLine', layout),
                    shadowBottomLine: mockCompStructure('wysiwyg.viewer.skins.line.ShadowBottomLine', layout),
                    shadowTopLine: mockCompStructure('wysiwyg.viewer.skins.line.ShadowTopLine', layout)
                };

                this.page.structure.components = _.values(compStructureMap);

                dataFixer.exec(this.page);

                expect(compStructureMap.fadeLine.layout.width).toEqual(90);
                expect(compStructureMap.fadeNotchBottomLine.layout.width).toEqual(60);
                expect(compStructureMap.fadeNotchTopLine.layout.width).toEqual(60);
                expect(compStructureMap.shadowBottomLine.layout.width).toEqual(200);
                expect(compStructureMap.shadowTopLine.layout.width).toEqual(200);
            });

        });

        describe('When a fiveGridLine mobile components have a width smaller than its skin\'s minimum width', function () {

            var layout = {width: 5};

            it('Should set the component width according to its skin\'s minimum width', function () {
                var compStructureMap = {
                    fadeLine: mockCompStructure('wysiwyg.viewer.skins.line.FadeLine', layout),
                    fadeNotchBottomLine: mockCompStructure('wysiwyg.viewer.skins.line.FadeNotchBottomLine', layout),
                    fadeNotchTopLine: mockCompStructure('wysiwyg.viewer.skins.line.FadeNotchTopLine', layout),
                    shadowBottomLine: mockCompStructure('wysiwyg.viewer.skins.line.ShadowBottomLine', layout),
                    shadowTopLine: mockCompStructure('wysiwyg.viewer.skins.line.ShadowTopLine', layout)
                };

                this.page.structure.mobileComponents = _.values(compStructureMap);

                dataFixer.exec(this.page);

                expect(compStructureMap.fadeLine.layout.width).toEqual(90);
                expect(compStructureMap.fadeNotchBottomLine.layout.width).toEqual(60);
                expect(compStructureMap.fadeNotchTopLine.layout.width).toEqual(60);
                expect(compStructureMap.shadowBottomLine.layout.width).toEqual(200);
                expect(compStructureMap.shadowTopLine.layout.width).toEqual(200);
            });

        });

        describe('When the structure has deep components subtree', function () {

            var layout = {width: 5};

            it('Should fix the width to all of them', function () {
                this.page.structure.components = [
                    mockCompStructure('wysiwyg.viewer.skins.line.FadeLine', layout, [
                        mockCompStructure('wysiwyg.viewer.skins.line.ShadowTopLine', layout, [
                            mockCompStructure('wysiwyg.viewer.skins.line.FadeNotchTopLine', layout)
                        ])
                    ])
                ];

                dataFixer.exec(this.page);

                expect(this.page.structure.components[0].layout.width).toEqual(90);
                expect(this.page.structure.components[0].components[0].layout.width).toEqual(200);
                expect(this.page.structure.components[0].components[0].components[0].layout.width).toEqual(60);
            });
        });
    });
});
