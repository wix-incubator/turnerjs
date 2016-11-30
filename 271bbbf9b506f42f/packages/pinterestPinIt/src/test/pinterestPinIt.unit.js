define(['lodash', 'testUtils', 'pinterestPinIt'],
    function (_, testUtils, pinterestPinIt) {
        'use strict';

        describe('Pinterest Pin It tests', function () {

            function createPinterestPinItProps(partialProps) {
                return testUtils.santaTypesBuilder.getComponentProps(pinterestPinIt, _.merge({
                    santaBase: 'someSource',
                    serviceTopology: {
                        staticMediaUrl: 'fake/static.wixstatic.com/media'
                    },
                    compData: {
                        uri: 'somImageUri',
                        description: 'some description',
                        id: 'data'
                    },
                    compProp:{
                        size: 'small',
                        color: 'gray',
                        counterPosition: 'none'
                    },
                    structure: {componentType: 'wysiwyg.common.components.pinterestpinit.viewer.PinterestPinIt'}
                }, partialProps));
            }

            function createPinterestPinItComp(partialProps) {
                partialProps = partialProps || {};
                var props = createPinterestPinItProps(partialProps);
                return testUtils.getComponentFromDefinition(pinterestPinIt, props);
            }

            it('Should render component', function () {
                var comp = createPinterestPinItComp();
                expect(comp).toBeDefined();
            });

            it('Should calculate component dimensions according to properties', function () {
                var comp = createPinterestPinItComp();

                expect(comp.getSkinProperties().iframe.width).toEqual(40);
                expect(comp.getSkinProperties().iframe.height).toEqual(20);
            });

            describe('Iframe src', function () {
                it('Should contain media parameters if component data uri is not empty', function () {
                    var comp = createPinterestPinItComp(),
                        iframeSrc = comp.getSkinProperties().iframe.src;

                    expect(iframeSrc).toContain('static/external/pinterestPinIt.html?');
                    expect(iframeSrc).toContain('data-pin-color=');
                    expect(iframeSrc).toContain('&data-pin-config=');
                    expect(iframeSrc).toContain('&data-pin-height=');
                    expect(iframeSrc).toContain('&description=');
                    expect(iframeSrc).toContain('&media=');
                    expect(iframeSrc).toContain('&url=');
                });

                it('Should contain gagPath parameter if component data uri is empty', function () {
                    var comp = createPinterestPinItComp(),
                        iframeSrc;

                    comp.props.compData.uri = '';
                    iframeSrc = comp.getSkinProperties().iframe.src;

                    expect(iframeSrc).toContain('static/external/pinterestPinIt.html?');
                    expect(iframeSrc).toContain('gagPath=');
                    expect(iframeSrc).toContain('static');
                    expect(iframeSrc).toContain('images');
                    expect(iframeSrc).toContain('pinterestPinIt');
                    expect(iframeSrc).toContain('pinterest-disabled.png');
                });

                it('Should contain gagPath parameter if component description is empty', function () {
                    var comp = createPinterestPinItComp(),
                        iframeSrc;

                    comp.props.compData.description = '';
                    iframeSrc = comp.getSkinProperties().iframe.src;

                    expect(iframeSrc).toContain('static/external/pinterestPinIt.html?');
                    expect(iframeSrc).toContain('gagPath=');
                    expect(iframeSrc).toContain('static');
                    expect(iframeSrc).toContain('images');
                    expect(iframeSrc).toContain('pinterestPinIt');
                    expect(iframeSrc).toContain('pinterest-disabled.png');
                });
            });
        });
    });
