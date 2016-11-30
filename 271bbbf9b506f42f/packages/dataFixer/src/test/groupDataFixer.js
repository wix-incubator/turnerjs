define(['dataFixer/plugins/groupFixer'], function (groupFixer) {
    'use strict';
    describe('groupDataFixer', function () {
        var mockPageJson;
        var GROUP_COMP_TYPE, GROUP_SKIN;

        beforeEach(function () {

            GROUP_COMP_TYPE = 'wysiwyg.viewer.components.Group';
            GROUP_SKIN = 'wysiwyg.viewer.components.GroupSkin';

            mockPageJson = {
                structure: {
                    components: [
                        {
                            componentType: "wysiwyg.viewer.components.ItunesButton",
                            layout: {
                                width: 400,
                                height: 40
                            },
                            skin: "skins.core.InlineSkin",
                            type: "Component"
                        },
                        {
                            componentType: GROUP_COMP_TYPE,
                            layout: {
                                width: 400,
                                height: 40
                            },
                            skin: "skins.viewer.itunesbutton.ItunesButtonSkin",
                            type: "Component",
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
                                    componentType: "wysiwyg.viewer.components.ItunesButton",
                                    layout: {
                                        width: 400,
                                        height: 40
                                    },
                                    skin: "skins.viewer.itunesbutton.ItunesButtonSkin",
                                    type: "Component"
                                }
                            ]
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

        it('should change all group components skin to GroupSkin', function () {
            groupFixer.exec(mockPageJson);
            expect(mockPageJson.structure.components[1].skin).toEqual(GROUP_SKIN);
        });
    });
});
