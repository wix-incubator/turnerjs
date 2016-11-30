define(['lodash', 'utils', 'testUtils', 'backgroundCommon/components/bgOverlay'], function (_, utils, testUtils, bgOverlay) {
    'use strict';

    describe('bgOverlay', function () {

        function createBgOverlayProps(partialProps) {
            return testUtils.santaTypesBuilder.getComponentProps(bgOverlay, _.merge({
                skin: "skins.viewer.bgOverlay.bgOverlaySkin",
                compProp: {}
            }, partialProps));
        }

        function createBgOverlayComponent(partialProps) {
            var props = createBgOverlayProps(partialProps);
            return testUtils.getComponentFromDefinition(bgOverlay, props);
        }

        describe('getSkinProperties', function(){

            function getSkinProperty(bgOverlayComp, path){
                return _.get(bgOverlayComp.getSkinProperties(), path);
            }

            describe('outer style', function(){

                function getOuterStyle(bgOverlayComp){
                    return getSkinProperty(bgOverlayComp, ['', 'style']);
                }

                it('should include width, height 100% ans position absolute', function(){
                    var bgOverlayComp = createBgOverlayComponent();

                    var outerStyle = getOuterStyle(bgOverlayComp);

                    expect(outerStyle).toEqual(jasmine.objectContaining({
                        position: 'absolute',
                        width: '100%',
                        height: '100%'
                    }));
                });

                it('should include top: 0, position: fixed if should render in full screen', function(){
                    spyOn(utils.containerBackgroundUtils, 'isFullScreenByEffect').and.returnValue(true);
                    var fixedBackgroundColorBalata = true;
                    var bgOverlayComp = createBgOverlayComponent({
                        fixedBackgroundColorBalata: fixedBackgroundColorBalata
                    });

                    var outerStyle = getOuterStyle(bgOverlayComp);

                    expect(outerStyle.top).toEqual(0);
                    expect(outerStyle.position).toEqual('fixed');
                });

                it('should not include top: 0, position: fixed if isFullScreenByEffect is false', function(){
                    spyOn(utils.containerBackgroundUtils, 'isFullScreenByEffect').and.returnValue(false);
                    var fixedBackgroundColorBalata = true;
                    var bgOverlayComp = createBgOverlayComponent({
                        fixedBackgroundColorBalata: fixedBackgroundColorBalata
                    });

                    var outerStyle = getOuterStyle(bgOverlayComp);

                    expect(outerStyle.top).not.toBeDefined();
                    expect(outerStyle.position).toEqual('absolute');
                });

                it('should not include top: 0, position: fixed if fixedBackgroundColorBalata is false', function(){
                    spyOn(utils.containerBackgroundUtils, 'isFullScreenByEffect').and.returnValue(true);
                    var fixedBackgroundColorBalata = false;
                    var bgOverlayComp = createBgOverlayComponent({
                        fixedBackgroundColorBalata: fixedBackgroundColorBalata
                    });

                    var outerStyle = getOuterStyle(bgOverlayComp);

                    expect(outerStyle.top).not.toBeDefined();
                    expect(outerStyle.position).toEqual('absolute');
                });

                it('should include all the properties defined in props.style', function(){
                    var style = {
                        color: 'red',
                        border: '1px'
                    };

                    var bgOverlayComp = createBgOverlayComponent({style: style});

                    var outerStyle = getOuterStyle(bgOverlayComp);

                    expect(outerStyle).toEqual(jasmine.objectContaining(style));
                });
            });

            describe('inner style', function(){

                function getInnerStyle(bgOverlayComp){
                    return getSkinProperty(bgOverlayComp, ['overlay', 'style']);
                }

                it('should include width and height 100% and position absolute', function(){
                    var bgOverlayComp = createBgOverlayComponent();

                    var innerStyle = getInnerStyle(bgOverlayComp);

                    expect(innerStyle.width).toEqual('100%');
                    expect(innerStyle.height).toEqual('100%');
                    expect(innerStyle.position).toEqual('absolute');
                });

                describe('backgroundColor', function(){
                    it('should be rgba representation of the color from the colorsMap', function(){
                        var colorsHexToRgbaMap = {
                            '#FFFFFF': 'rgba(255, 255, 255, 1)'
                        };
                        var colorsMap = _.keys(colorsHexToRgbaMap);

                        var compProp = {
                            colorOverlay: 'color_0'
                        };
                        var bgOverlayComp = createBgOverlayComponent({colorsMap: colorsMap, compProp: compProp});

                        var innerStyle = getInnerStyle(bgOverlayComp);

                        expect(innerStyle.backgroundColor).toEqual(colorsHexToRgbaMap['#FFFFFF']);
                    });

                    it('should not defined if colorOverlay is not defined in compProp', function(){
                        var compProp = {};
                        var bgOverlayComp = createBgOverlayComponent({compProp: compProp});

                        var innerStyle = getInnerStyle(bgOverlayComp);

                        expect(innerStyle.backgroundColor).not.toBeDefined();
                    });
                });

                describe('backgroundImage', function(){
                    it('should be url start with staticMediaUrl and end with imageOverlay.uri', function(){
                        var staticMediaUrl = 'https://static.wixstatic.com/media';
                        var compProp = {
                            imageOverlay: {uri: 'imageOverlay1.png'}
                        };
                        var bgOverlayComp = createBgOverlayComponent({compProp: compProp, staticMediaUrl: staticMediaUrl});

                        var innerStyle = getInnerStyle(bgOverlayComp);

                        var expectedUrl = 'https://static.wixstatic.com/media/imageOverlay1.png';
                        expect(innerStyle.backgroundImage).toEqual('url(' + expectedUrl + ')');
                    });

                    it('should not defined if imageOverlay is not defined in compProp', function(){
                        var compProp = {};
                        var bgOverlayComp = createBgOverlayComponent({compProp: compProp});

                        var innerStyle = getInnerStyle(bgOverlayComp);

                        expect(innerStyle.backgroundImage).not.toBeDefined();
                    });
                });
            });
        });
    });
});
