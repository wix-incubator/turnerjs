define([
        'lodash',
        'core',
        'utils',
        'testUtils',
        'backgroundCommon/mixins/backgroundDetectionMixin'
    ],
    function (_, core, utils, testUtils, backgroundDetectionMixin) {
        'use strict';


        describe("backgroundDetectionMixin tests", function () {

            var compWithMixinDef = {
                displayName: 'compWithBackgroundDetectionMixin',
                mixins: [core.compMixins.skinBasedComp, backgroundDetectionMixin],
                getSkinProperties: function () { //eslint-disable-line react/display-name
                    return {
                        '': {}
                    };
                }
            };

            var mockDynamicColorElementsAspect = {
                updateInformation: function(){}
            };

            function createComponentsProps(partialProps) {
                return testUtils.santaTypesBuilder.getComponentProps(compWithMixinDef, _.merge({
                    skin: "skins.viewer.balata.balataBaseSkin",
                    id: 'comp-1',
                    dynamicColorElementsAspect: mockDynamicColorElementsAspect,
                    compDesign: {}
                }, partialProps));
            }

            function createCompWithMixin(partialProps) {
                var props = createComponentsProps(partialProps);
                return testUtils.getComponentFromDefinition(compWithMixinDef, props);
            }

            describe('componentDidMount', function(){

                function getCompWithImage(id){
                    var compDesign = {
                        background: {
                            mediaRef: {
                                type: 'Image',
                                uri: 'image1.jpeg'
                            }
                        }
                    };

                    return createCompWithMixin({id: id, compDesign: compDesign});
                }

                function getCompWithoutImage(id){
                    var compDesign = {
                        background: {
                            mediaRef: null
                        }
                    };

                    return createCompWithMixin({id: id, compDesign: compDesign});
                }

                it('should update dynamicColorElements aspect with background image', function() {
                    var defaultImageBrightness = 0.4;
                    var compId = 'comp-1';

                    spyOn(utils.imageUtils, 'getImageMeanBrightness').and.callFake(function(imageUrl, imageDimensions, onSuccess) {
                        onSuccess(defaultImageBrightness);
                    });
                    spyOn(mockDynamicColorElementsAspect, 'updateInformation');

                    getCompWithImage(compId);

                    expect(utils.imageUtils.getImageMeanBrightness).toHaveBeenCalled();
                    expect(mockDynamicColorElementsAspect.updateInformation).toHaveBeenCalledWith(compId, {brightness: defaultImageBrightness, alpha: undefined});
                });

                it('should update dynamicColorElements aspect with background color if no image', function() {
                    var compId = 'comp-1';

                    spyOn(utils.imageUtils, 'getImageMeanBrightness');
                    spyOn(mockDynamicColorElementsAspect, 'updateInformation');

                    getCompWithoutImage(compId);

                    var defaultColorBrightness = 0;
                    expect(utils.imageUtils.getImageMeanBrightness).not.toHaveBeenCalled();
                    expect(mockDynamicColorElementsAspect.updateInformation).toHaveBeenCalledWith(compId, {brightness: defaultColorBrightness, alpha: 1});
                });

                it('should do nothing if in mobile view mode', function(){
                    spyOn(utils.imageUtils, 'getImageMeanBrightness');
                    spyOn(mockDynamicColorElementsAspect, 'updateInformation');

                    createCompWithMixin({isMobileView: true});

                    expect(utils.imageUtils.getImageMeanBrightness).not.toHaveBeenCalled();
                    expect(mockDynamicColorElementsAspect.updateInformation).not.toHaveBeenCalled();
                });
            });
        });
    });
