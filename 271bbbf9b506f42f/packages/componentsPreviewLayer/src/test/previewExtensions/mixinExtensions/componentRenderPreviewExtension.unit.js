define([
    'lodash',
    'react',
    'reactDOM',
    'testUtils',
    'container',
    'previewExtensionsCore',
    'core/components/baseCompMixin',
    'componentsPreviewLayer/previewExtensions/mixinExtensions/componentRenderPreviewExtension'
], function (_,
             React,
             ReactDOM,
             testUtils,
             container,
             previewExtensionsCore,
             baseCompMixin,
             componentRenderPreviewExtension) {
    'use strict';

    var testItems = [
        {
            choice: [false, false, false, false, false, false],
            text: 'isFixed: false, shouldShowFixedComp: false, isHidden: false, shouldShowHiddenComp: false, shouldIgnoreHiddenProp: false, previousVisibility: hidden',
            result: {visibility: 'hidden', ghost: false}
        },
        {
            choice: [false, false, false, false, false, true],
            text: 'isFixed: false, shouldShowFixedComp: false, isHidden: false, shouldShowHiddenComp: false, shouldIgnoreHiddenProp: false, previousVisibility: visible',
            result: {visibility: '', ghost: false}
        },
        {
            choice: [false, false, false, false, true, false],
            text: 'isFixed: false, shouldShowFixedComp: false, isHidden: false, shouldShowHiddenComp: false, shouldIgnoreHiddenProp: true, previousVisibility: hidden',
            result: {visibility: 'hidden', ghost: false}
        },
        {
            choice: [false, false, false, false, true, true],
            text: 'isFixed: false, shouldShowFixedComp: false, isHidden: false, shouldShowHiddenComp: false, shouldIgnoreHiddenProp: true, previousVisibility: visible',
            result: {visibility: '', ghost: false}
        },
        {
            choice: [false, false, false, true, false, false],
            text: 'isFixed: false, shouldShowFixedComp: false, isHidden: false, shouldShowHiddenComp: true, shouldIgnoreHiddenProp: false, previousVisibility: hidden',
            result: {visibility: 'hidden', ghost: false}
        },
        {
            choice: [false, false, false, true, false, true],
            text: 'isFixed: false, shouldShowFixedComp: false, isHidden: false, shouldShowHiddenComp: true, shouldIgnoreHiddenProp: false, previousVisibility: visible',
            result: {visibility: '', ghost: false}
        },
        {
            choice: [false, false, false, true, true, false],
            text: 'isFixed: false, shouldShowFixedComp: false, isHidden: false, shouldShowHiddenComp: true, shouldIgnoreHiddenProp: true, previousVisibility: hidden',
            result: {visibility: 'hidden', ghost: false}
        },
        {
            choice: [false, false, false, true, true, true],
            text: 'isFixed: false, shouldShowFixedComp: false, isHidden: false, shouldShowHiddenComp: true, shouldIgnoreHiddenProp: true, previousVisibility: visible',
            result: {visibility: '', ghost: false}
        },
        {
            choice: [false, false, true, false, false, false],
            text: 'isFixed: false, shouldShowFixedComp: false, isHidden: true, shouldShowHiddenComp: false, shouldIgnoreHiddenProp: false, previousVisibility: hidden',
            result: {visibility: 'hidden', ghost: false}
        },
        {
            choice: [false, false, true, false, false, true],
            text: 'isFixed: false, shouldShowFixedComp: false, isHidden: true, shouldShowHiddenComp: false, shouldIgnoreHiddenProp: false, previousVisibility: visible',
            result: {visibility: 'hidden', ghost: false}
        },
        {
            choice: [false, false, true, false, true, false],
            text: 'isFixed: false, shouldShowFixedComp: false, isHidden: true, shouldShowHiddenComp: false, shouldIgnoreHiddenProp: true, previousVisibility: hidden',
            result: {visibility: '', ghost: false}
        },
        {
            choice: [false, false, true, false, true, true],
            text: 'isFixed: false, shouldShowFixedComp: false, isHidden: true, shouldShowHiddenComp: false, shouldIgnoreHiddenProp: true, previousVisibility: visible',
            result: {visibility: '', ghost: false}
        },
        {
            choice: [false, false, true, true, false, false],
            text: 'isFixed: false, shouldShowFixedComp: false, isHidden: true, shouldShowHiddenComp: true, shouldIgnoreHiddenProp: false, previousVisibility: hidden',
            result: {visibility: '', ghost: true}
        },
        {
            choice: [false, false, true, true, false, true],
            text: 'isFixed: false, shouldShowFixedComp: false, isHidden: true, shouldShowHiddenComp: true, shouldIgnoreHiddenProp: false, previousVisibility: visible',
            result: {visibility: '', ghost: true}
        },
        {
            choice: [false, false, true, true, true, false],
            text: 'isFixed: false, shouldShowFixedComp: false, isHidden: true, shouldShowHiddenComp: true, shouldIgnoreHiddenProp: true, previousVisibility: hidden',
            result: {visibility: '', ghost: false}
        },
        {
            choice: [false, false, true, true, true, true],
            text: 'isFixed: false, shouldShowFixedComp: false, isHidden: true, shouldShowHiddenComp: true, shouldIgnoreHiddenProp: true, previousVisibility: visible',
            result: {visibility: '', ghost: false}
        },
        {
            choice: [false, true, false, false, false, false],
            text: 'isFixed: false, shouldShowFixedComp: true, isHidden: false, shouldShowHiddenComp: false, shouldIgnoreHiddenProp: false, previousVisibility: hidden',
            result: {visibility: 'hidden', ghost: false}
        },
        {
            choice: [false, true, false, false, false, true],
            text: 'isFixed: false, shouldShowFixedComp: true, isHidden: false, shouldShowHiddenComp: false, shouldIgnoreHiddenProp: false, previousVisibility: visible',
            result: {visibility: '', ghost: false}
        },
        {
            choice: [false, true, false, false, true, false],
            text: 'isFixed: false, shouldShowFixedComp: true, isHidden: false, shouldShowHiddenComp: false, shouldIgnoreHiddenProp: true, previousVisibility: hidden',
            result: {visibility: 'hidden', ghost: false}
        },
        {
            choice: [false, true, false, false, true, true],
            text: 'isFixed: false, shouldShowFixedComp: true, isHidden: false, shouldShowHiddenComp: false, shouldIgnoreHiddenProp: true, previousVisibility: visible',
            result: {visibility: '', ghost: false}
        },
        {
            choice: [false, true, false, true, false, false],
            text: 'isFixed: false, shouldShowFixedComp: true, isHidden: false, shouldShowHiddenComp: true, shouldIgnoreHiddenProp: false, previousVisibility: hidden',
            result: {visibility: 'hidden', ghost: false}
        },
        {
            choice: [false, true, false, true, false, true],
            text: 'isFixed: false, shouldShowFixedComp: true, isHidden: false, shouldShowHiddenComp: true, shouldIgnoreHiddenProp: false, previousVisibility: visible',
            result: {visibility: '', ghost: false}
        },
        {
            choice: [false, true, false, true, true, false],
            text: 'isFixed: false, shouldShowFixedComp: true, isHidden: false, shouldShowHiddenComp: true, shouldIgnoreHiddenProp: true, previousVisibility: hidden',
            result: {visibility: 'hidden', ghost: false}
        },
        {
            choice: [false, true, false, true, true, true],
            text: 'isFixed: false, shouldShowFixedComp: true, isHidden: false, shouldShowHiddenComp: true, shouldIgnoreHiddenProp: true, previousVisibility: visible',
            result: {visibility: '', ghost: false}
        },
        {
            choice: [false, true, true, false, false, false],
            text: 'isFixed: false, shouldShowFixedComp: true, isHidden: true, shouldShowHiddenComp: false, shouldIgnoreHiddenProp: false, previousVisibility: hidden',
            result: {visibility: 'hidden', ghost: false}
        },
        {
            choice: [false, true, true, false, false, true],
            text: 'isFixed: false, shouldShowFixedComp: true, isHidden: true, shouldShowHiddenComp: false, shouldIgnoreHiddenProp: false, previousVisibility: visible',
            result: {visibility: 'hidden', ghost: false}
        },
        {
            choice: [false, true, true, false, true, false],
            text: 'isFixed: false, shouldShowFixedComp: true, isHidden: true, shouldShowHiddenComp: false, shouldIgnoreHiddenProp: true, previousVisibility: hidden',
            result: {visibility: '', ghost: false}
        },
        {
            choice: [false, true, true, false, true, true],
            text: 'isFixed: false, shouldShowFixedComp: true, isHidden: true, shouldShowHiddenComp: false, shouldIgnoreHiddenProp: true, previousVisibility: visible',
            result: {visibility: '', ghost: false}
        },
        {
            choice: [false, true, true, true, false, false],
            text: 'isFixed: false, shouldShowFixedComp: true, isHidden: true, shouldShowHiddenComp: true, shouldIgnoreHiddenProp: false, previousVisibility: hidden',
            result: {visibility: '', ghost: true}
        },
        {
            choice: [false, true, true, true, false, true],
            text: 'isFixed: false, shouldShowFixedComp: true, isHidden: true, shouldShowHiddenComp: true, shouldIgnoreHiddenProp: false, previousVisibility: visible',
            result: {visibility: '', ghost: true}
        },
        {
            choice: [false, true, true, true, true, false],
            text: 'isFixed: false, shouldShowFixedComp: true, isHidden: true, shouldShowHiddenComp: true, shouldIgnoreHiddenProp: true, previousVisibility: hidden',
            result: {visibility: '', ghost: false}
        },
        {
            choice: [false, true, true, true, true, true],
            text: 'isFixed: false, shouldShowFixedComp: true, isHidden: true, shouldShowHiddenComp: true, shouldIgnoreHiddenProp: true, previousVisibility: visible',
            result: {visibility: '', ghost: false}
        },
        {
            choice: [true, false, false, false, false, false],
            text: 'isFixed: true, shouldShowFixedComp: false, isHidden: false, shouldShowHiddenComp: false, shouldIgnoreHiddenProp: false, previousVisibility: hidden',
            result: {visibility: 'hidden', ghost: false}
        },
        {
            choice: [true, false, false, false, false, true],
            text: 'isFixed: true, shouldShowFixedComp: false, isHidden: false, shouldShowHiddenComp: false, shouldIgnoreHiddenProp: false, previousVisibility: visible',
            result: {visibility: 'hidden', ghost: false}
        },
        {
            choice: [true, false, false, false, true, false],
            text: 'isFixed: true, shouldShowFixedComp: false, isHidden: false, shouldShowHiddenComp: false, shouldIgnoreHiddenProp: true, previousVisibility: hidden',
            result: {visibility: 'hidden', ghost: false}
        },
        {
            choice: [true, false, false, false, true, true],
            text: 'isFixed: true, shouldShowFixedComp: false, isHidden: false, shouldShowHiddenComp: false, shouldIgnoreHiddenProp: true, previousVisibility: visible',
            result: {visibility: 'hidden', ghost: false}
        },
        {
            choice: [true, false, false, true, false, false],
            text: 'isFixed: true, shouldShowFixedComp: false, isHidden: false, shouldShowHiddenComp: true, shouldIgnoreHiddenProp: false, previousVisibility: hidden',
            result: {visibility: 'hidden', ghost: false}
        },
        {
            choice: [true, false, false, true, false, true],
            text: 'isFixed: true, shouldShowFixedComp: false, isHidden: false, shouldShowHiddenComp: true, shouldIgnoreHiddenProp: false, previousVisibility: visible',
            result: {visibility: 'hidden', ghost: false}
        },
        {
            choice: [true, false, false, true, true, false],
            text: 'isFixed: true, shouldShowFixedComp: false, isHidden: false, shouldShowHiddenComp: true, shouldIgnoreHiddenProp: true, previousVisibility: hidden',
            result: {visibility: 'hidden', ghost: false}
        },
        {
            choice: [true, false, false, true, true, true],
            text: 'isFixed: true, shouldShowFixedComp: false, isHidden: false, shouldShowHiddenComp: true, shouldIgnoreHiddenProp: true, previousVisibility: visible',
            result: {visibility: 'hidden', ghost: false}
        },
        {
            choice: [true, false, true, false, false, false],
            text: 'isFixed: true, shouldShowFixedComp: false, isHidden: true, shouldShowHiddenComp: false, shouldIgnoreHiddenProp: false, previousVisibility: hidden',
            result: {visibility: 'hidden', ghost: false}
        },
        {
            choice: [true, false, true, false, false, true],
            text: 'isFixed: true, shouldShowFixedComp: false, isHidden: true, shouldShowHiddenComp: false, shouldIgnoreHiddenProp: false, previousVisibility: visible',
            result: {visibility: 'hidden', ghost: false}
        },
        {
            choice: [true, false, true, false, true, false],
            text: 'isFixed: true, shouldShowFixedComp: false, isHidden: true, shouldShowHiddenComp: false, shouldIgnoreHiddenProp: true, previousVisibility: hidden',
            result: {visibility: 'hidden', ghost: false}
        },
        {
            choice: [true, false, true, false, true, true],
            text: 'isFixed: true, shouldShowFixedComp: false, isHidden: true, shouldShowHiddenComp: false, shouldIgnoreHiddenProp: true, previousVisibility: visible',
            result: {visibility: 'hidden', ghost: false}
        },
        {
            choice: [true, false, true, true, false, false],
            text: 'isFixed: true, shouldShowFixedComp: false, isHidden: true, shouldShowHiddenComp: true, shouldIgnoreHiddenProp: false, previousVisibility: hidden',
            result: {visibility: 'hidden', ghost: false}
        },
        {
            choice: [true, false, true, true, false, true],
            text: 'isFixed: true, shouldShowFixedComp: false, isHidden: true, shouldShowHiddenComp: true, shouldIgnoreHiddenProp: false, previousVisibility: visible',
            result: {visibility: 'hidden', ghost: false}
        },
        {
            choice: [true, false, true, true, true, false],
            text: 'isFixed: true, shouldShowFixedComp: false, isHidden: true, shouldShowHiddenComp: true, shouldIgnoreHiddenProp: true, previousVisibility: hidden',
            result: {visibility: 'hidden', ghost: false}
        },
        {
            choice: [true, false, true, true, true, true],
            text: 'isFixed: true, shouldShowFixedComp: false, isHidden: true, shouldShowHiddenComp: true, shouldIgnoreHiddenProp: true, previousVisibility: visible',
            result: {visibility: 'hidden', ghost: false}
        },
        {
            choice: [true, true, false, false, false, false],
            text: 'isFixed: true, shouldShowFixedComp: true, isHidden: false, shouldShowHiddenComp: false, shouldIgnoreHiddenProp: false, previousVisibility: hidden',
            result: {visibility: 'hidden', ghost: false}
        },
        {
            choice: [true, true, false, false, false, true],
            text: 'isFixed: true, shouldShowFixedComp: true, isHidden: false, shouldShowHiddenComp: false, shouldIgnoreHiddenProp: false, previousVisibility: visible',
            result: {visibility: '', ghost: false}
        },
        {
            choice: [true, true, false, false, true, false],
            text: 'isFixed: true, shouldShowFixedComp: true, isHidden: false, shouldShowHiddenComp: false, shouldIgnoreHiddenProp: true, previousVisibility: hidden',
            result: {visibility: 'hidden', ghost: false}
        },
        {
            choice: [true, true, false, false, true, true],
            text: 'isFixed: true, shouldShowFixedComp: true, isHidden: false, shouldShowHiddenComp: false, shouldIgnoreHiddenProp: true, previousVisibility: visible',
            result: {visibility: '', ghost: false}
        },
        {
            choice: [true, true, false, true, false, false],
            text: 'isFixed: true, shouldShowFixedComp: true, isHidden: false, shouldShowHiddenComp: true, shouldIgnoreHiddenProp: false, previousVisibility: hidden',
            result: {visibility: 'hidden', ghost: false}
        },
        {
            choice: [true, true, false, true, false, true],
            text: 'isFixed: true, shouldShowFixedComp: true, isHidden: false, shouldShowHiddenComp: true, shouldIgnoreHiddenProp: false, previousVisibility: visible',
            result: {visibility: '', ghost: false}
        },
        {
            choice: [true, true, false, true, true, false],
            text: 'isFixed: true, shouldShowFixedComp: true, isHidden: false, shouldShowHiddenComp: true, shouldIgnoreHiddenProp: true, previousVisibility: hidden',
            result: {visibility: 'hidden', ghost: false}
        },
        {
            choice: [true, true, false, true, true, true],
            text: 'isFixed: true, shouldShowFixedComp: true, isHidden: false, shouldShowHiddenComp: true, shouldIgnoreHiddenProp: true, previousVisibility: visible',
            result: {visibility: '', ghost: false}
        },
        {
            choice: [true, true, true, false, false, false],
            text: 'isFixed: true, shouldShowFixedComp: true, isHidden: true, shouldShowHiddenComp: false, shouldIgnoreHiddenProp: false, previousVisibility: hidden',
            result: {visibility: 'hidden', ghost: false}
        },
        {
            choice: [true, true, true, false, false, true],
            text: 'isFixed: true, shouldShowFixedComp: true, isHidden: true, shouldShowHiddenComp: false, shouldIgnoreHiddenProp: false, previousVisibility: visible',
            result: {visibility: 'hidden', ghost: false}
        },
        {
            choice: [true, true, true, false, true, false],
            text: 'isFixed: true, shouldShowFixedComp: true, isHidden: true, shouldShowHiddenComp: false, shouldIgnoreHiddenProp: true, previousVisibility: hidden',
            result: {visibility: '', ghost: false}
        },
        {
            choice: [true, true, true, false, true, true],
            text: 'isFixed: true, shouldShowFixedComp: true, isHidden: true, shouldShowHiddenComp: false, shouldIgnoreHiddenProp: true, previousVisibility: visible',
            result: {visibility: '', ghost: false}
        },
        {
            choice: [true, true, true, true, false, false],
            text: 'isFixed: true, shouldShowFixedComp: true, isHidden: true, shouldShowHiddenComp: true, shouldIgnoreHiddenProp: false, previousVisibility: hidden',
            result: {visibility: '', ghost: true}
        },
        {
            choice: [true, true, true, true, false, true],
            text: 'isFixed: true, shouldShowFixedComp: true, isHidden: true, shouldShowHiddenComp: true, shouldIgnoreHiddenProp: false, previousVisibility: visible',
            result: {visibility: '', ghost: true}
        },
        {
            choice: [true, true, true, true, true, false],
            text: 'isFixed: true, shouldShowFixedComp: true, isHidden: true, shouldShowHiddenComp: true, shouldIgnoreHiddenProp: true, previousVisibility: hidden',
            result: {visibility: '', ghost: false}
        },
        {
            choice: [true, true, true, true, true, true],
            text: 'isFixed: true, shouldShowFixedComp: true, isHidden: true, shouldShowHiddenComp: true, shouldIgnoreHiddenProp: true, previousVisibility: visible',
            result: {visibility: '', ghost: false}
        }
    ];


    function getComp(compDef, partialProps) {
        var props = testUtils.santaTypesBuilder.getComponentProps(compDef, _.merge({
            // Default values here
        }, partialProps));

        return testUtils.getComponentFromReactClass(compDef, props);
    }

    function getMockComponentDefinition(styleOverride) {
        return React.createClass({
            displayName: 'MockComponent',
            mixins: [baseCompMixin.baseComp],
            render: function () {
                var rootRefData = {style: styleOverride};
                this.updateRootRefDataStyles(rootRefData);
                var props = _.defaults(rootRefData, this.props);

                return React.createElement('div', props);
            }
        });
    }



    describe('componentRenderPreviewExtension', function () {

        beforeAll(function () {
            previewExtensionsCore.registrar.resetAllExtensions();
            previewExtensionsCore.registrar.registerMixinExtension(componentRenderPreviewExtension.mixin, componentRenderPreviewExtension.extension);
            previewExtensionsCore.registrar.extendCompMixinClasses();
        });

        afterAll(function () {
            previewExtensionsCore.registrar.resetAllExtensions();
        });

        describe('hidden components', function () {
            function getItText(visibilityResult, ghostClassResult) {
                var visibilityText = 'should be ' + (visibilityResult === '' ? 'visible' : 'hidden');
                return visibilityText + ' and should' + (ghostClassResult ? '' : ' not') + ' have ghost class';
            }

            function createTest() {
                _.forEach(testItems, function (testItem) {

                    var compId = 'myCompId';
                    var isFixedPosition = testItem.choice[0];
                    var showFixedComponents = testItem.choice[1];
                    var isHidden = testItem.choice[2];
                    var showHiddenComponents = testItem.choice[3];
                    var ignoreHiddenProperty = testItem.choice[4] ? [compId] : [];
                    var renderedVisibility = testItem.choice[5];
                    var visibilityResult = testItem.result.visibility;
                    var ghostClassResult = testItem.result.ghost;

                    describe('when ' + testItem.text, function () {

                        it(getItText(visibilityResult, ghostClassResult), function () {
                            var props = {
                                id: compId,
                                compProp: {
                                    isHidden: isHidden
                                },
                                renderFlags: {
                                    allowShowingFixedComponents: showFixedComponents,
                                    showHiddenComponents: showHiddenComponents,
                                    ignoreComponentsHiddenProperty: ignoreHiddenProperty
                                },
                                structure: {
                                    layout: {
                                        fixedPosition: isFixedPosition
                                    }
                                }
                            };

                            var styleOverride;

                            if (!renderedVisibility) {
                                styleOverride = {visibility: 'hidden'};
                            }

                            var compDef = getMockComponentDefinition(styleOverride);
                            var comp = getComp(compDef, props);


                            var compNode = ReactDOM.findDOMNode(comp);
                            expect(_.get(compNode, 'style.visibility')).toBe(visibilityResult);
                            expect(_.includes(compNode.classList, 'hidden-comp-ghost-mode')).toBe(ghostClassResult);
                        });
                    });
                });
            }

            createTest();
        });

        describe('collapseComponent experiment', function () {

            beforeEach(function () {
                testUtils.experimentHelper.openExperiments('collapseComponent');
            });

            it('should add hidden-comp-ghost-mode to collapsed component when componentViewMode is editor', function () {
                var comp = getComp(React.createClass(container), {
                    id: 'comp',
                    compProp: {
                        isCollapsed: true
                    },
                    renderFlags: {
                        componentViewMode: 'editor'
                    },
                    structure: {
                        layout: {
                            x: 0,
                            y: 0,
                            width: 50,
                            height: 50
                        }
                    }
                });

                var compNode = ReactDOM.findDOMNode(comp);
                expect(_.includes(compNode.classList, 'hidden-comp-ghost-mode')).toBeTruthy();
            });
        });
    });
});
