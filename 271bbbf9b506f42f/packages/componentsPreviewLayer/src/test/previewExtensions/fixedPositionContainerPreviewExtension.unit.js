define(['lodash',
        'definition!componentsPreviewLayer/previewExtensions/fixedPositionContainerPreviewExtension',
        'fake!previewExtensionsCore',
        'santaProps'
    ],
    function (_, fixedPositionContainerPreviewExtension, previewExtensionsRenderCore, santaProps) {
        'use strict';
        describe('footerAndHeaderPreviewExtension - ', function () {
            var extension;
            var previewExtensionsRenderPlugin = previewExtensionsRenderCore.registrar;

            var mockComp;

            function enableRenderFixedPositionContainers(isEnable){
                mockComp.props.renderFixedPositionContainers = isEnable;
            }

            beforeEach(function () {
                mockComp = {
                    props: {
                        renderFixedPositionContainers: true
                    }
                };

                spyOn(previewExtensionsRenderPlugin, 'registerCompExtension').and.callFake(function (compType, ext) {
                    extension = ext;
                });

                fixedPositionContainerPreviewExtension(_, previewExtensionsRenderCore, santaProps);
            });

            it('Should register the header and the footer extension in the extensions registrar', function () {
                expect(previewExtensionsRenderPlugin.registerCompExtension.calls.argsFor(0)[0]).toEqual('wysiwyg.viewer.components.FooterContainer');
                expect(previewExtensionsRenderPlugin.registerCompExtension.calls.argsFor(1)[0]).toEqual('wysiwyg.viewer.components.HeaderContainer');
            });

            describe('cssState Transformation function', function () {

                beforeEach(function () {
                    mockComp.state = {
                        $fixed: 'fixedPosition'
                    };
                });

                it("should do nothing if in preview mode", function(){
                    enableRenderFixedPositionContainers(true);

                    var transformedState = extension.getTransformedCssStates.call(mockComp);

                    expect(transformedState).toEqual(mockComp.state);
                });

                it("should remove the $fixed property from the state", function(){
                    enableRenderFixedPositionContainers(false);

                    var transformedState = extension.getTransformedCssStates.call(mockComp);

                    expect(transformedState.$fixed).not.toBeDefined();
                });
            });

            describe('get root position', function(){
                it('should return absolute if flag for fixed render is false', function(){
                    enableRenderFixedPositionContainers(false);
                    var style = {
                        position: 'somePosition'
                    };

                    var rootPosition = extension.getRootPosition.call(mockComp, style);

                    expect(rootPosition).toEqual('absolute');
                });

                it('should return the style position of flag for fixed render is true', function(){
                    enableRenderFixedPositionContainers(true);
                    var style = {
                        position: 'somePosition'
                    };

                    var rootPosition = extension.getRootPosition.call(mockComp, style);

                    expect(rootPosition).toEqual(style.position);
                });
            });

        });
    });
