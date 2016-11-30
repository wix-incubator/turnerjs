define(['lodash', 'testUtils', 'spotifyFollow'], function (_, testUtils, spotifyFollow) {
    'use strict';

    var createProps = function(propsOverrides) {
        return testUtils.santaTypesBuilder.getComponentProps(spotifyFollow, _.assign({
            compData: {
                uri: 'spotify:artist:0EmeFodog0BfCgMzAIvKQp'
            },
            compProp: {
                size: "large",
                theme: "dark",
                showFollowersCount: true
            }
        }, propsOverrides));
    };

    var createComponent = function (propsOverrides) {
        return testUtils.getComponentFromDefinition(spotifyFollow, createProps(propsOverrides));
    };

    describe('Spotify Follow Component', function () {
        var spotifyFollowComp;

        beforeEach(function(){
            spotifyFollowComp = createComponent();
        });

        describe('Skin Properties', function(){

            describe('Structure Validation', function(){

                it("Should Contain two skinparts - iframe and placeholder", function(){
                    var skinProps = spotifyFollowComp.getSkinProperties();

                    expect(_.size(skinProps)).toBe(3);
                    expect(skinProps.iframe).toBeDefined();
                    expect(skinProps.placeholder).toBeDefined();
                });

                describe("iframe structure", function(){

                    it("should have dimensions when valid source is provided", function(){
                        var skinProps = spotifyFollowComp.getSkinProperties();

                        expect(skinProps.iframe.style).toBeDefined();
                        expect(skinProps.iframe.style.width).toBeDefined();
                        expect(skinProps.iframe.style.height).toBeDefined();
                    });

                    it("should have a valid source built from given properties", function(){
                        var skinProps = spotifyFollowComp.getSkinProperties();

                        expect(skinProps.iframe.src).toBe("https://embed.spotify.com/follow/1/?uri=spotify:artist:0EmeFodog0BfCgMzAIvKQp&size=detail&theme=dark&show-count=1");
                    });

                    it('it should have a sanitized uri for component to be reflected in iframe src', function() {
                        spotifyFollowComp = createComponent({
                            compData: {
                                uri: 'sPOtiFy:ArtiSt:0EmeFodog0BfCgMzAIvKQp'
                            }
                        });
                        var skinProps = spotifyFollowComp.getSkinProperties();

                        expect(skinProps.iframe.src).toBe("https://embed.spotify.com/follow/1/?uri=spotify:artist:0EmeFodog0BfCgMzAIvKQp&size=detail&theme=dark&show-count=1");
                    });
                });
            });

            describe('Visibility Validation', function(){
                it("should hide default placeholder when having a defined iframe src", function(){
                    var skinProps = spotifyFollowComp.getSkinProperties();

                    expect(skinProps.placeholder.style.display).toBe("none");
                    expect(skinProps.iframe.style.display).not.toBeDefined();
                });

                it("should hide iframe and display default placeholder when there is no src", function(){
                    spotifyFollowComp = createComponent({
                        compData: {
                            uri: undefined
                        }
                    });
                    var skinProps = spotifyFollowComp.getSkinProperties();

                    expect(skinProps.iframe.style.display).toBe("none");
                    expect(skinProps.placeholder.style).not.toBeDefined();
                });
            });
        });

        describe('Initial State', function(){
            it("should be a valid placeholder state according to the properties", function(){
                var initState = spotifyFollowComp.getInitialState();

                expect(initState.$placeholder).toBe("detailed_light_show");
            });
        });
    });
});
