define(['react', 'wixappsCore', 'testUtils', 'wixappsClassics', 'components'], function (React, /** wixappsCore */wixapps, /** testUtils */testUtils) {
    'use strict';

    describe('Table proxy', function () {
        var viewDef, data;

        beforeEach(function () {
            var TestBaseProxy = {
                render: function () {
                    return React.DOM.div();
                }
            };

            wixapps.proxyFactory.register('TestBaseProxy', TestBaseProxy);

            viewDef = {
                comp: {
                    name: 'Table',
                    columns: []
                }
            };

            data = [];
        });

        afterEach(function () {
            wixapps.proxyFactory.invalidate('TestBaseProxy');
        });

        var itemDef = {
            comp: {
                name: 'TestBaseProxy'
            }
        };

        it('should create a Table component', function () {
            var props = testUtils.proxyPropsBuilder(viewDef, data);
            var proxy = testUtils.proxyBuilder('Table', props);
            var component = proxy.refs.component;

            // Validate default component is used
            expect(component).toBeComponentOfType('wysiwyg.viewer.components.Table');
            expect(component.props.skin).toEqual('wysiwyg.viewer.skins.table.TableComponentDefaultSkin');
        });

        it('should set numOfColumns according to columns definition', function () {
            viewDef.comp.columns = [
                {
                    item: itemDef
                }
            ];

            var props = testUtils.proxyPropsBuilder(viewDef, data);
            var proxy = testUtils.proxyBuilder('Table', props);
            var component = proxy.refs.component;

            var expectedCompProp = {
                numOfColumns: viewDef.comp.columns.length
            };

            expect(component.props.compProp).toEqual(jasmine.objectContaining(expectedCompProp));
        });

        it('should set header to true iff one of the columns has a definition for header', function () {
            viewDef.comp.columns = [
                {
                    item: itemDef
                }
            ];
            var props = testUtils.proxyPropsBuilder(viewDef, data);
            var proxy = testUtils.proxyBuilder('Table', props);
            expect(proxy.refs.component.props.compProp).toEqual(jasmine.objectContaining({header: false}));

            props.viewDef.comp.columns[0].header = itemDef;
            proxy = testUtils.proxyBuilder('Table', props);
            expect(proxy.refs.component.props.compProp).toEqual(jasmine.objectContaining({header: true}));
        });

        it('should set footer to true iff one of the columns has a definition for footer', function () {
            viewDef.comp.columns = [
                {
                    item: itemDef
                }
            ];
            var props = testUtils.proxyPropsBuilder(viewDef, data);
            var proxy = testUtils.proxyBuilder('Table', props);
            expect(proxy.refs.component.props.compProp).toEqual(jasmine.objectContaining({footer: false}));

            props.viewDef.comp.columns[0].footer = itemDef;
            proxy = testUtils.proxyBuilder('Table', props);
            expect(proxy.refs.component.props.compProp).toEqual(jasmine.objectContaining({footer: true}));
        });

        it('should set the minHeight compProp according to the definition', function () {
            var minHeight = '10';
            viewDef.comp.minHeight = minHeight;
            var props = testUtils.proxyPropsBuilder(viewDef, data);
            var proxy = testUtils.proxyBuilder('Table', props);
            var component = proxy.refs.component;

            expect(component.props.compProp).toEqual(jasmine.objectContaining({minHeight: Number(minHeight)}));
        });

        it('should set the number of rows as in data', function () {
            data = [{}, {}];
            viewDef.comp.columns = [
                {
                    item: itemDef
                }
            ];
            var props = testUtils.proxyPropsBuilder(viewDef, data);
            var proxy = testUtils.proxyBuilder('Table', props);
            var component = proxy.refs.component;

            expect(component.props.compProp).toEqual(jasmine.objectContaining({numOfRows: data.length}));
        });

        it('should return null for non existing cell definition', function () {
            data = [
                {}
            ];
            viewDef.comp.columns = [
                {
                    item: itemDef
                },
                {
                    item: itemDef,
                    header: itemDef
                }
            ];

            var props = testUtils.proxyPropsBuilder(viewDef, data);
            var proxy = testUtils.proxyBuilder('Table', props);
            var component = proxy.refs.component;

            expect(component.refs.header_cell_0).toBeDefined();
            expect(component.refs.header_cell_0.children.length).toEqual(0);

            expect(component.refs.header_cell_1).toBeDefined();
            expect(component.refs.header_cell_1.children.length).not.toEqual(0);

            props.viewDef.comp.columns = [
                {
                    item: itemDef,
                    footer: itemDef
                },
                {
                    item: itemDef
                }
            ];
            proxy = testUtils.proxyBuilder('Table', props);
            component = proxy.refs.component;

            expect(component.refs.footer_cell_0).toBeDefined();
            expect(component.refs.footer_cell_0.children.length).not.toEqual(0);

            expect(component.refs.footer_cell_1).toBeDefined();
            expect(component.refs.footer_cell_1.children.length).toEqual(0);
        });

        it('should throw exception if a column is missing item definition', function () {
            data = [
                {}
            ];
            viewDef.comp.columns = [
                {footer: itemDef},
                {item: itemDef}
            ];

            var props = testUtils.proxyPropsBuilder(viewDef, data);
            expect(testUtils.proxyBuilder.bind(testUtils, 'Table', props)).toThrow('missing definition for item in column 0');
        });
    });
});
