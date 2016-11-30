define(['lodash', 'testUtils', 'documentMedia'],
    function (_, /** testUtils */testUtils, documentMedia) {
        'use strict';

        function createDocumentMediaComponent(props, node) {
            return testUtils.componentBuilder('wysiwyg.viewer.components.documentmedia.DocumentMedia', props, node);
        }

        function createDocumentMediaProps(overrides) {
            return testUtils.santaTypesBuilder.getComponentProps(documentMedia, _.merge({
                style: {
                    width: 60,
                    height: 60
                },
                skin: 'skins.viewer.documentmedia.DocumentMediaSkin',
                browser: {}
            }, overrides));
        }

        describe('DocumentMedia component', function () {

            describe('component initialization', function () {
                it('should have a title', function () {
                    var documentMediaComponentProps = createDocumentMediaProps({
                        compData: {title: 'mock_title'}
                    });
                    var documentMediaComponent = createDocumentMediaComponent(documentMediaComponentProps);
                    var skinProperties = documentMediaComponent.getSkinProperties();
                    expect(skinProperties.label.children).toEqual('mock_title');
                });

                it('should hide label when title is empty', function () {
                    var documentMediaComponentProps = createDocumentMediaProps({
                        compData: {title: ''},
                        compProp: {showTitle: true},
                        styleId: 's0'
                    });
                    var documentMediaComponent = createDocumentMediaComponent(documentMediaComponentProps);
                    var skinProperties = documentMediaComponent.getSkinProperties();
                    expect(skinProperties.label.className.split(' ')).toContain('s0_hidden');
                });

                it('should hide label when showTitle is false', function () {
                    var documentMediaComponentProps = createDocumentMediaProps({
                        compData: {title: 'mock_title'},
                        compProp: {showTitle: false},
                        styleId: 's0'
                    });
                    var documentMediaComponent = createDocumentMediaComponent(documentMediaComponentProps);
                    var skinProperties = documentMediaComponent.getSkinProperties();
                    expect(skinProperties.label.className.split(' ')).toContain('s0_hidden');
                });

                it('should show label when showTitle is true and title not empty', function () {
                    var documentMediaComponentProps = createDocumentMediaProps({
                        compData: {title: 'mock_title'},
                        compProp: {showTitle: true},
                        styleId: 's0'
                    });
                    var documentMediaComponent = createDocumentMediaComponent(documentMediaComponentProps);
                    var skinProperties = documentMediaComponent.getSkinProperties();
                    expect(skinProperties.label.className.split(' ')).not.toContain('s0_hidden');
                });

                it('should use title on root level as tooltip', function () {
                    var documentMediaComponentProps = createDocumentMediaProps({
                        compData: {title: 'mock_title'}
                    });
                    var documentMediaComponent = createDocumentMediaComponent(documentMediaComponentProps);
                    var skinProperties = documentMediaComponent.getSkinProperties();
                    expect(skinProperties[''].title).toEqual('mock_title');
                });

                it('should create child image with relevant params', function () {
                    var compData = {};
                    var documentMediaComponentProps = createDocumentMediaProps({
                        compData: compData,
                        id: 's0'
                    });

                    var documentMediaComponent = createDocumentMediaComponent(documentMediaComponentProps);
                    spyOn(documentMediaComponent, 'createChildComponent');
                    documentMediaComponent.getSkinProperties();
                    expect(documentMediaComponent.createChildComponent).toHaveBeenCalledWith(
                            compData,
                            'core.components.Image',
                            'img',
                            jasmine.any(Object)
                        );

                    expect(documentMediaComponent.createChildComponent.calls.mostRecent().args[3]).toEqual({
                            displayName: 'Image',
                            id: 's0img',
                            ref: 'img',
                            imageData: compData,
                            containerWidth: 60,
                            containerHeight: 60,
                            displayMode: 'full',
                            usePreloader: true
                        });
                });

                it('should create a link when linkData is available', function () {
                    var documentMediaComponentProps = createDocumentMediaProps({
                        compData: {
                            link: {
                                type: 'ExternalLink',
                                url: 'http://www.peaceamongworlds.com/'
                            }
                        }
                    });
                    var documentMediaComponent = createDocumentMediaComponent(documentMediaComponentProps);
                    var skinProperties = documentMediaComponent.getSkinProperties();
                    expect(skinProperties.link.href).toEqual('http://www.peaceamongworlds.com/');
                });
            });
        });
    });
