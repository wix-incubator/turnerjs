define(['lodash', 'react', 'wixappsCore/core/viewsCustomizer', 'wixappsCore/core/proxyFactory'], function (_, React, viewsCustomizer, proxyFactory) {
    "use strict";

    function getViewDef() {
        return {
            forType: "Dish",
            format: 'view',
            name: "Stripe",
            comp: {
                regions: {center: {minWidth: 500}},
                items: [
                    {id: "title", data: "title", layout: {last: true, minWidth: 250, padding: "6 0 0 3"}},
                    {id: "1", value: 'Hardcoded text', layout: {minWidth: 250, maxWidth: "100%", padding: "0 30 15 3"}},
                    {id: "image", data: "image", layout: {minWidth: 175, region: "west", padding: "3 5 15 0"}},
                    {id: 'aPrice', data: "price", layout: {region: "east", anchor: "bottom-left", minWidth: 50}},
                    {id: "image", data: 'image', layout: {minWidth: 200}, comp: {width: 100}}
                ]
            }
        };
    }

    describe("view customizer", function () {

        describe("should customize a viewDef according to given rules", function () {

            it('explicit settings', function () {
                var source = getViewDef();
                var rules = [
                    {forType: "Dish", view: "Stripe", fieldId: "image", format: "view", key: "comp.label", value: "Should be overridden"},
                    {forType: "Dish", view: "Stripe", fieldId: "image", format: "view", key: "comp.label", value: "Overriding"},
                    {forType: "Dish", view: "Stripe", fieldId: "image", format: "edit", key: "comp.label", value: "Should not override"},
                    {forType: "Dish", view: "Stripe", fieldId: "aPrice", format: "view", key: "layout.anchor", value: "bottom-right"},
                    {forType: "Dish", view: "Stripe", fieldId: "1", format: "view", key: "layout", value: {padding: '0'}},
                    {forType: "Meal", view: "FullEdit", fieldId: "image", format: "view", key: "comp.label", value: "Wrong type and view"},
                    {forType: "Meal", view: "Stripe", fieldId: "image", format: "view", key: "comp.label", value: "Wrong type"},
                    {forType: "Dish", view: "FullEdit", fieldId: "image", format: "view", key: "comp.label", value: "Wrong view"}
                ];

                var viewDef = viewsCustomizer.customizeView(source, rules);

                expect(viewDef.comp.items[0].comp).toBeUndefined();
                expect(viewDef.comp.items[1].layout).toEqual({padding: '0'});
                expect(viewDef.comp.items[2].comp).toEqual({label: 'Overriding'});
                expect(viewDef.comp.items[3].layout).toEqual({region: "east", anchor: "bottom-right", minWidth: 50});
            });

            it("explicit override rules in separate batches", function () {
                var source = getViewDef();
                var rules1 = [
                    {forType: "Dish", view: "Stripe", fieldId: "image", format: "view", key: "comp.label", value: "Should be overridden"}
                ];
                var rules2 = [
                    {forType: "Dish", view: "Stripe", fieldId: "image", format: "view", key: "comp.label", value: "Overriding"}
                ];

                var viewDef = viewsCustomizer.customizeView(source, rules1, rules2);

                expect(viewDef.comp.items[2].comp).toEqual({label: 'Overriding'});
            });

            it('wildcard settings', function () {
                var source = getViewDef();
                var rules = [
                    {forType: "Dish", view: "*", fieldId: "*", format: "edit", key: "comp.label", value: "Wrong format"},
                    {forType: "Dish", view: "*", fieldId: "*", format: "*", key: "comp.label", value: "Label everywhere"},
                    {forType: "Meal", view: "*", fieldId: "*", format: "view", key: "comp.label", value: "Wrong type"},
                    {forType: "*", view: "FullEdit", fieldId: "*", format: "view", key: "comp.label", value: "Wrong view"},
                    {forType: "*", view: "*", fieldId: "image", format: "view", key: "comp.label", value: "Overriding"},
                    {forType: "Dish", view: "Stripe", fieldId: "image", format: "edit", key: "comp.label", value: "Should not override"},
                    {forType: "Dish", view: "Stripe", fieldId: "aPrice", format: "view", key: "layout.anchor", value: "bottom-right"},
                    {forType: "Dish", view: "Stripe", fieldId: "1", format: "view", key: "layout", value: {padding: '0'}},
                    {forType: "Dish", view: "FullEdit", fieldId: "description", format: "edit", key: "comp.label", value: "Wrong view"},
                    {forType: "Dish", view: "*", fieldId: "basePrice", format: "*", key: "comp.label", value: "Wrong fieldID"},
                    {forType: "Dish", view: "*", fieldId: "*", format: "*", key: "layout.anchor", value: "top-right"}
                ];

                var viewDef = viewsCustomizer.customizeView(source, rules);

                expect(viewDef.comp.items[0].comp).toEqual({label: 'Label everywhere'});
                expect(viewDef.comp.items[0].layout).toEqual({last: true, minWidth: 250, padding: "6 0 0 3", anchor: 'top-right'});
                expect(viewDef.comp.items[1].comp).toEqual({label: 'Label everywhere'});
                expect(viewDef.comp.items[1].layout).toEqual({padding: '0', anchor: 'top-right'});
                expect(viewDef.comp.items[2].comp).toEqual({label: 'Overriding'});
                expect(viewDef.comp.items[2].layout).toEqual({minWidth: 175, region: "west", padding: "3 5 15 0", anchor: 'top-right'});
                expect(viewDef.comp.items[3].comp).toEqual({label: 'Label everywhere'});
                expect(viewDef.comp.items[3].layout).toEqual({region: "east", anchor: "top-right", minWidth: 50});
            });

            it('recursive search', function () {
                var source = {
                    forType: "Dish",
                    format: 'view',
                    name: "Stripe",
                    comp: {
                        regions: {center: {minWidth: 500}},
                        items: [
                            {id: "title", data: "title", layout: {last: true, minWidth: 250, padding: "6 0 0 3"}},
                            {id: "1", value: 'Hardcoded text', layout: {minWidth: 250, maxWidth: "100%", padding: "0 30 15 3"}},
                            {
                                id: "2", comp: {
                                name: 'HBox', layout: {someProp: 'A'}, items: [
                                    {data: 'special', comp: {name: 'BooleanCheckbox'}},
                                    {
                                        id: 'InnerHBox', comp: {
                                        name: 'HBox', layout: {someProp: 'A'}, items: [
                                            {data: 'ingredients', name: 'Label'}
                                        ]
                                    }
                                    },
                                    {data: 'tax', comp: {layout: {someProp: 'A'}}}
                                ]
                            }
                            },
                            {data: "image", layout: {minWidth: 175, region: "west", padding: "3 5 15 0"}},
                            {id: 'aPrice', data: "price", layout: {region: "east", anchor: "bottom-left", minWidth: 50}}
                        ]
                    }
                };

                var rules = [
                    {forType: "*", view: "*", fieldId: "2", format: "*", key: "comp.layout.someProp", value: "B"},
                    {forType: "*", view: "*", fieldId: "InnerHBox", format: "*", key: "comp.name", value: "VBox"},
                    {forType: "*", view: "*", fieldId: "tax", format: "*", key: "comp.name", value: "NumberFormat"},
                    {forType: "*", view: "*", fieldId: "special", format: "*", key: "comp.name", value: "BooleanAlternates"}
                ];

                var viewDef = viewsCustomizer.customizeView(source, rules);

                expect(viewDef.comp.items[2].comp.layout).toEqual({someProp: 'B'}); // first inner layout
                expect(viewDef.comp.items[2].comp.items[2].comp.layout).toEqual({someProp: 'A'}); // tax
                expect(viewDef.comp.items[2].comp.items[2].comp.name).toEqual('NumberFormat'); // tax
                expect(viewDef.comp.items[2].comp.items[0].comp.name).toEqual('BooleanAlternates'); // inner layout
            });

            it('apply rule with default format', function () {
                var source = {
                    forType: "Dish",
                    format: 'view',
                    name: "Stripe",
                    comp: {
                        regions: {center: {minWidth: 500}},
                        items: [
                            {id: "image", data: "image", layout: {minWidth: 175, region: "west", padding: "3 5 15 0"}}
                        ]
                    }
                };

                // trying to access without format and see that doesn't change
                var viewDef = _.cloneDeep(source);
                viewsCustomizer.applyCustomization(viewDef, {forType: "Dish", view: "Stripe", fieldId: "image", key: "layout.minWidth", value: 200});
                expect(viewDef).toEqual(source);

                viewsCustomizer.applyCustomization(viewDef, {forType: "Dish", view: "Stripe", fieldId: "image", format: "", key: "layout.minWidth", value: 200});
                expect(viewDef).toEqual(source);

                viewsCustomizer.applyCustomization(viewDef, {forType: "Dish", view: "Stripe", fieldId: "image", format: "non-existing-format", key: "layout.minWidth", value: 200});
                expect(viewDef).toEqual(source);

                // access with correct format and see that it changes
                viewsCustomizer.applyCustomization(viewDef, {forType: "Dish", view: "Stripe", fieldId: "image", format: "view", key: "layout.minWidth", value: 200});

                var expected = _.cloneDeep(source);
                expected.comp.items[0].layout.minWidth = 200;

                expect(viewDef).toEqual(expected);
            });

            it('remove value', function () {
                var source = {
                    forType: "Dish",
                    format: 'view',
                    name: "Stripe",
                    comp: {
                        regions: {center: {minWidth: 500}},
                        items: [
                            {id: "title", data: "title", layout: {last: true, minWidth: 250, padding: "6 0 0 3"}},
                            {id: "1", value: 'Hardcoded text', layout: {minWidth: 250, maxWidth: "100%", padding: "0 30 15 3"}},
                            {id: 'image', data: "image", layout: {minWidth: 175, region: "west", padding: "3 5 15 0"}},
                            {id: 'aPrice', data: "price", layout: {region: "east", anchor: "bottom-left", minWidth: 50}},
                            {id: 'image', data: 'image', layout: {minWidth: 200}, comp: {width: 100}}
                        ]
                    }
                };

                var rules = [
                    {forType: "Dish", view: "Stripe", fieldId: "image", format: "*", key: "layout.minWidth"},
                    {forType: "Dish", view: "Stripe", fieldId: "aPrice", format: "*", key: "layout.anchor"},
                    {forType: "Dish", view: "Stripe", fieldId: "aPrice", format: "*", key: "comp.width"}
                ];

                var viewDef = viewsCustomizer.customizeView(source, rules);

                var expected = _.clone(source);

                delete expected.comp.items[2].layout.minWidth;
                delete expected.comp.items[3].layout.anchor;
                delete expected.comp.items[4].layout.minWidth;

                expected.comp.items[3].comp = {};

                expect(viewDef).toEqual(expected);
            });

            describe('customizeView', function () {

                beforeAll(function () {
                    proxyFactory.register('TestProxy', {
                        render: function () { //eslint-disable-line react/display-name
                            return React.createElement('div', this.props);
                        }
                    });
                });

                afterAll(function () {
                    proxyFactory.invalidate('TestProxy');
                });

                it('should set apply old customization with proxy name as it\'s view', function () {
                    var proxyName = 'TestProxy';
                    var source = {
                        forType: 'MyType',
                        format: '',
                        name: proxyName + 'View',
                        comp: {
                            regions: {center: {minWidth: 500}},
                            items: [
                                {
                                    id: 'image',
                                    data: 'image',
                                    comp: {
                                        name: 'Image',
                                        imageMode: 'fill'
                                    },
                                    layout: {minWidth: 175, region: 'west', padding: '3 5 15 0'}
                                }
                            ]
                        }
                    };

                    var rules = [
                        {
                            view: proxyName,
                            forType: 'MyType',
                            type: 'AppPartCustomization',
                            format: '',
                            fieldId: 'image',
                            key: 'layout.height',
                            value: '300'
                        }
                    ];

                    viewsCustomizer.customizeView(source, rules);

                    expect(source.comp.items[0].layout.height).toEqual(300);
                });
            });

        });

    });

});
