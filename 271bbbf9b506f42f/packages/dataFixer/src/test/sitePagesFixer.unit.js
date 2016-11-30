define(['dataFixer/plugins/sitePagesFixer'], function (sitePagesFixer) {
    'use strict';

    describe('pageGroupContainsOnlyPagesValidator spec', function () {

        describe("sitePages shouldn't have components (the pages are coming on the root structure)", function () {

            it("should remove SITE PAGE (page group) components from mobile structure and desktop structure", function () {
                var pageStructure = {
                    "structure": {
                        type: "Document",
                        id: "masterPage",
                        children: [{
                            "type": "Container", "id": "PAGES_CONTAINER", "components": [{
                                "type": "Container",
                                "id": "SITE_PAGES",
                                "components": [
                                    {"type": "Component", "id": "i0ycvd21"}
                                ]
                            }]
                        }],
                        mobileComponents: [{
                            "type": "Container", "id": "PAGES_CONTAINER", "components": [{
                                "type": "Container",
                                "id": "SITE_PAGES",
                                "components": [
                                    {"type": "Component", "id": "i0ycvd21"}
                                ]
                            }]
                        }]
                    },
                    data: {document_data: {}, theme_data: {}, component_properties: {}}
                };

                sitePagesFixer.exec(pageStructure);
                expect(pageStructure.structure.children[0].components[0].components.length).toEqual(0);
                expect(pageStructure.structure.mobileComponents[0].components[0].components.length).toEqual(0);
            });

            it("should set y of sitePages to zero", function () {
                var pageStructure = {
                    "structure": {
                        type: "Document",
                        id: "masterPage",
                        children: [{
                            "type": "Container", "id": "PAGES_CONTAINER", "components": [{
                                "type": "Container",
                                "id": "SITE_PAGES",
                                "layout": {
                                    x: 0,
                                    y: 40,
                                    width: 980,
                                    height: 500
                                }
                            }]
                        }],
                        mobileComponents: [{
                            "type": "Container", "id": "PAGES_CONTAINER", "components": [{
                                "type": "Container",
                                "id": "SITE_PAGES",
                                "layout": {
                                    x: 0,
                                    y: 40,
                                    width: 980,
                                    height: 500
                                }
                            }]
                        }]
                    },
                    data: {document_data: {}, theme_data: {}, component_properties: {}}
                };

                sitePagesFixer.exec(pageStructure);
                expect(pageStructure.structure.children[0].components[0].layout.y).toEqual(0);
                expect(pageStructure.structure.mobileComponents[0].components[0].layout.y).toEqual(0);
            });
        });

    });
});
