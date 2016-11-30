define(['lodash', 'testUtils', 'mediaContainer'], function (_, testUtils, mediaContainer) {
    'use strict';

    describe('mediaContainer', function () {

        function createMediaContainerProps(partialProps) {
            return testUtils.santaTypesBuilder.getComponentProps(mediaContainer, _.merge({
                skin: "wysiwyg.viewer.skins.mediaContainer.DefaultMediaContainer"
            }, partialProps));
        }

        function createMediaContainer(partialProps) {
            var props = createMediaContainerProps(partialProps);
            return testUtils.getComponentFromDefinition(mediaContainer, props);
        }

        describe('getSkinProperties', function(){

            describe('background', function(){

                function getBackgroundSkinProperties(comp){
                    return comp.getSkinProperties().background;
                }

                it('should be balata component', function(){
                    var comp = createMediaContainer();

                    var background = getBackgroundSkinProperties(comp);

                    var balataClassName = 'wysiwyg.viewer.components.background.Balata';
                    expect(testUtils.isComponentOfType(background, balataClassName)).toBe(true);
                });
            });

            describe('container', function(){
                function getContainerSkinProperties(comp){
                    return comp.getSkinProperties().container;
                }
                describe('style', function(){
                    it('should be empty object', function(){
                        var comp = createMediaContainer();

                        var containerStyle = getContainerSkinProperties(comp).style;

                        expect(containerStyle).toEqual({});
                    });

                    describe('when sv_cssDesignData experiment is open', function(){
                        beforeEach(function(){
                            testUtils.experimentHelper.openExperiments('sv_cssDesignData');
                        });

                        describe('when cssStyle is defined', function(){
                            it('should include all the style from compDesign', function() {
                                var compDesign = {
                                    cssStyle: {
                                        cssBorderRadius: {
                                            "topLeft": {"unit": "px", "value":20},
                                            "topRight": {"unit": "px", "value":30},
                                            "bottomRight": {"unit": "px", "value":50},
                                            "bottomLeft": {"unit": "px", "value":70}
                                        }
                                    }
                                };
                                var comp = createMediaContainer({compDesign: compDesign});

                                var containerStyle = getContainerSkinProperties(comp).style;

                                expect(containerStyle.borderRadius).toEqual('20px 30px 50px 70px');
                            });

                            it("should include default styles: overflow: 'hidden', WebkitFilter: 'blur()'", function(){
                                var compDesign = {cssStyle: {}};

                                var comp = createMediaContainer({compDesign: compDesign});
                                var containerStyle = getContainerSkinProperties(comp).style;

                                var defaultBackgroundStyle = {
                                    overflow: 'hidden',
                                    WebkitFilter: 'blur()'
                                };
                                expect(containerStyle).toEqual(jasmine.objectContaining(defaultBackgroundStyle));
                            });
                        });

                        it('should be empty string if cssStyle is not defined', function(){
                            var compDesign = {cssStyle: undefined};

                            var comp = createMediaContainer({compDesign: compDesign});
                            var containerStyle = getContainerSkinProperties(comp).style;

                            expect(containerStyle).toEqual({});
                        });
                    });
                });
            });

            describe('inlineContentParent', function(){

                function getInlineContentParentSkinProperties(comp){
                    return comp.getSkinProperties().inlineContentParent;
                }

                describe('style', function(){
                    describe('when bgStyle is defined', function(){
                        it('should equal to bgStyle', function(){
                            var bgStyle = {
                                top: 50,
                                bottom: 50
                            };

                            var comp = createMediaContainer({bgStyle: bgStyle});
                            var inlineContentParentStyle = getInlineContentParentSkinProperties(comp).style;

                            expect(inlineContentParentStyle).toEqual(bgStyle);
                        });
                    });

                    describe('when bgStyle is not defined', function(){
                        it('should get default style', function(){
                            var comp = createMediaContainer({bgStyle: undefined});
                            var inlineContentParentStyle = getInlineContentParentSkinProperties(comp).style;

                            var defaultStyle = {
                                position: 'absolute',
                                left: 0,
                                right: 0,
                                top: 0,
                                bottom: 0
                            };
                            expect(inlineContentParentStyle).toEqual(defaultStyle);
                        });
                    });
                });
            });

            describe('inlineContent', function(){

                function getInlineContentSkinProperties(comp){
                    return comp.getSkinProperties().inlineContent;
                }

                describe('style', function(){
                    describe('when inlineStyle is defined', function(){
                        it('should equal to bgStyle', function(){
                            var inlineStyle = {
                                top: 50,
                                bottom: 50
                            };

                            var comp = createMediaContainer({inlineStyle: inlineStyle});
                            var inlineContentStyle = getInlineContentSkinProperties(comp).style;

                            expect(inlineContentStyle).toEqual(inlineStyle);
                        });
                    });

                    describe('when inlineStyle is not defined', function(){
                        it('should get default style', function(){
                            var rootStyle = {
                                width: 100
                            };
                            var comp = createMediaContainer({inlineStyle: undefined, rootStyle: rootStyle});
                            var inlineContentStyle = getInlineContentSkinProperties(comp).style;

                            var defaultStyle = {
                                width: rootStyle.width,
                                position: 'absolute',
                                top: 0,
                                bottom: 0
                            };
                            expect(inlineContentStyle).toEqual(defaultStyle);
                        });
                    });
                });

                describe('children', function(){
                    it('should equal to props.children', function(){
                        // var child = React.createElement('h2', {}, 'Hello world');
                        var children = ['comp-1', 'comp-2'];

                        var comp = createMediaContainer({children: children});

                        var inlineContentChildren = getInlineContentSkinProperties(comp).children;

                        expect(inlineContentChildren).toEqual(children);
                    });
                });
            });

            describe('root', function(){

                function getRootSkinProperties(comp){
                    return comp.getSkinProperties()[''];
                }

                describe('style', function(){
                    it('should equal to rootStyle if rootStyle defined', function(){
                        var rootStyle = {
                            position: 'absolute',
                            width: 100,
                            height: 100,
                            top: '', bottom: '', left: '', right: ''};
                        var comp = createMediaContainer({rootStyle: rootStyle});

                        var rootSkinPartStyle = getRootSkinProperties(comp).style;

                        expect(rootSkinPartStyle).toEqual(rootStyle);
                    });

                    it('should equal to style if rootStyle is not defined', function(){
                        var style = {
                            position: 'absolute',
                            width: 200,
                            height: 200,
                            top: '', bottom: '', left: '', right: ''};
                        var comp = createMediaContainer({rootStyle: undefined, style: style});

                        var rootSkinPartStyle = getRootSkinProperties(comp).style;

                        expect(rootSkinPartStyle).toEqual(style);
                    });
                });
            });
        });
    });
});
