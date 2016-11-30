define(['Squire'], function (Squire) {
    'use strict';

    // Mock skins package
    var injector = new Squire();
    var registeredPlugin;


    var skinsMock, mockuire;


    describe('QA Automation Renderer Components Plugin', function () {
        beforeEach(function() {
          skinsMock = skinsMock || {
            registerRenderPlugin: jasmine.createSpy().and.callFake(function (func) {
              registeredPlugin = func;
            })
          };

          mockuire = mockuire || injector.mock('skins', skinsMock);
        });

        var componentsPlugins;

        beforeEach(function (done) {
            registeredPlugin = null;
            mockuire.require(['qaAutomation/plugins/componentsPlugin'], function (_componentsPlugins) {
                componentsPlugins = _componentsPlugins;
                done();
            });
        });

        describe('init', function () {

            beforeEach(function () {
                componentsPlugins.init();
            });

            it('should register a renderer plugin on the skins package', function () {
                expect(skinsMock.registerRenderPlugin).toHaveBeenCalled();
            });

            describe('the registered plugin function', function () {

                it('should add to the refData top level ref, a data-comp property ' +
                    'with the provided structure.componentType as value', function () {
                    var refData = {'': {}};
                    var structure = {'componentType': 'mock_component_type'};
                    registeredPlugin(refData, [], structure);
                    expect(refData['']['data-comp']).toBe('mock_component_type');
                });

                it('should add to the refData top level ref, a data-skinpart property ' +
                    'with the provided structure.skinPart as value', function () {
                    var refData = {'': {}};
                    var structure = {'skinPart': 'mocked_skin_part_name'};
                    registeredPlugin(refData, [], structure);
                    expect(refData['']['data-skinpart']).toBe('mocked_skin_part_name');
                });

                it('should add a data-skinpart property to all the refData refs.', function () {
                    var refData = {
                        '': {},
                        'SkinPart_1': {},
                        'SkinPart_2': {},
                        'SkinPart_3': {}
                    };
                    registeredPlugin(refData, [], {});
                    expect(refData.SkinPart_1['data-skinpart']).toBe('SkinPart_1');
                    expect(refData.SkinPart_2['data-skinpart']).toBe('SkinPart_2');
                    expect(refData.SkinPart_3['data-skinpart']).toBe('SkinPart_3');
                });

                it('should add to the refData any skin-part that it is missing', function() {
                    // refData only contains skin-parts that are referenced by the component's logic
                    // The plugin should add to refData all other skin parts
                    // and set their 'data-skinpart' property to the skin part name
                    var refData = {'': {}};
                    refData.SkinPart_1 = {};
                    var skinTree = ['div', '', [], {},
                        ['div', 'SkinPart_1'],
                        ['div', 'SkinPart_2', [], {}, ['div', 'SkinPart_3']]
                    ];
                    registeredPlugin(refData, skinTree, {});
                    expect(refData.SkinPart_1['data-skinpart']).toBe('SkinPart_1');
                    expect(refData.SkinPart_2['data-skinpart']).toBe('SkinPart_2');
                    expect(refData.SkinPart_3['data-skinpart']).toBe('SkinPart_3');
                });
            });
        });
    });
});
