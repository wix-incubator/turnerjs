define([
    'lodash',
    'reactDOM',
    'testUtils',
    'core',
    'svgShape/components/svgShape'
], function (_, ReactDOM, testUtils, core, svgShape) {
    "use strict";

    describe('svg shape', function () {

        function createButtonProps(partialProps) {
            return testUtils.santaTypesBuilder.getComponentProps(svgShape, _.merge({
                id: 'compId',
                structure: {
                    layout: {
                        scale: 2
                    }
                },
                skin: 'skins.viewer.svgshape.SvgShapeNOTDefaultSkin',
                theme: {
                    style: {
                        properties: {}
                    }
                },
                compData: {
                    type: 'SvgShape',
                    link: null
                },
                rootNavigationInfo: '',
                THEME_DATA: {
                    color: ["#FFFFFF", "#000000", "#ED1C24", "#0088CB", "#FFCB05", "#727272"]
                },
                svgString: '',
                styleId: '',
                linkRenderInfo: ''
            }, partialProps));
        }

        var defaultSkinHtml = '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 376.654 376.654"><g><polygon points="298.185,264.061 149.092,352.082 0,264.061 0,88.021 149.092,0 298.185,88.021 "/></g></svg>';


        function getSvgComp(partialProps) {
            var props = createButtonProps(partialProps);
            return testUtils.getComponentFromDefinition(svgShape, props);
        }

        it('should use updateRootRefDataStyles for the rendered shape', function () {
            spyOn(core.compMixins.baseCompMixin, 'updateRootRefDataStyles').and.callFake(function (refData) {
                _.assign(refData, {style: {width: 100, marginTop: 10}});
            });

            var partialProps = {
                svgString: defaultSkinHtml,
                styleId: 'style_1',
                theme: {
                    id: 'style-1',
                    style: {
                        properties: {}
                    }
                }
            };

            var comp = getSvgComp(partialProps);

            expect(core.compMixins.baseCompMixin.updateRootRefDataStyles).toHaveBeenCalledWith(jasmine.objectContaining({dangerouslySetInnerHTML: jasmine.any(Object)}));

            var node = ReactDOM.findDOMNode(comp.refs['']);
            expect(node.style.width).toEqual('100px');
            expect(node.style['margin-top']).toEqual('10px');
        });

        it('should create a component if it has a fillcolor in theme style (only testing that it doesn\'t fail)', function () {
            var comp = getSvgComp({
                svgString: defaultSkinHtml,
                styleId: 'style_1',
                theme: {
                    id: 'style_1',
                    style: {
                        properties: {
                            fillcolor: '#123'
                        }
                    }
                }
            });

            var node = ReactDOM.findDOMNode(comp.refs['']);

            expect(_.includes(node.innerHTML, 'fill:#112233')).toBeTruthy();
        });

        it('should create a component with defaults if it doesn\'t have a fillcolor in theme style (only testing that it doesn\'t fail)', function () {
            var partialProps = {
                styleId: 'style_1',
                theme: {
                    id: 'style-1',
                    style: {
                        properties: {}
                    }
                }
            };

            function testCompCreation() {
                return getSvgComp(partialProps);
            }

            expect(testCompCreation).not.toThrow();

        });

        it('should replace "fill" grey scaled color with tinted color', function () {
            spyOn(core.compMixins.baseCompMixin, 'updateRootRefDataStyles').and.callThrough();
            var svgString = '<svg fill="#444"><g></g></svg>';
            var partialProps = {svgString: svgString};

            var comp = getSvgComp(partialProps);

            var resultSvgString = '<svg fill="#444444"><g></g></svg>';
            var node = ReactDOM.findDOMNode(comp.refs['']);

            expect(_.includes(node.innerHTML, resultSvgString)).toBeTruthy();
        });
    });
});
