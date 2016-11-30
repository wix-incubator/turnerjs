define(['lodash', 'dataFixer/plugins/compFixer'], function (_, compFixer) {
    'use strict';

    describe('compFixer spec', function () {
        var mockPageJson;
        beforeEach(function () {
            mockPageJson = {
                structure: {
                    components: [
                        {
                            componentType: "wysiwyg.viewer.components.ItunesButton",
                            layout: {
                                width: 400,
                                height: 40
                            },
                            skin: "skins.viewer.itunesbutton.ItunesButtonSkin",
                            type: "Component"
                        },
                        {
                            componentType: 'wysiwyg.viewer.components.menus.DropDownMenu',
                            propertyQuery: 'someQuery'
                        }
                    ]
                },
                data: {
                    component_properties: {
                        'someQuery': {}
                    }
                }
            };
        });

        it("Should check fix of itunes button height", function () {
            compFixer.exec(mockPageJson);

            var calculatedHeight = Math.round(mockPageJson.structure.components[0].layout.width / 2.75);

            expect(mockPageJson.structure.components[0].layout.height).toEqual(calculatedHeight);
        });

        it('Should use default properties if no properties and default exists', function () {
            var newPropertiesQuery = 'newQuery';
            mockPageJson.structure.components[1].propertyQuery = newPropertiesQuery;

            compFixer.exec(mockPageJson);

            expect(mockPageJson.data.component_properties[newPropertiesQuery]).toBeDefined();
        });

        describe('Text Comp Fixer:', function () {
            describe('What text props has invalid props type', function () {
                it('Should delete the props', function () {
                    mockPageJson.structure.components = mockPageJson.structure.components.concat({
                        componentType: 'wysiwyg.viewer.components.WRichText',
                        propertyQuery: 'textProp'
                    });

                    mockPageJson.data.component_properties.textProp = {
                        packed: true,
                        type: 'invalid'
                    };

                    compFixer.exec(mockPageJson);

                    expect(mockPageJson.structure.components[mockPageJson.structure.components.length - 1].propertyQuery).toBeUndefined();
                });
            });
        });
    });
});
