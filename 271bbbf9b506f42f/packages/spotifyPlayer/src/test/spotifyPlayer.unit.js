define(['lodash', 'testUtils', 'spotifyPlayer'], function (_, testUtils, spotifyPlayer) {
    'use strict';

    var createProps = function(propsOverrides) {
        return testUtils.santaTypesBuilder.getComponentProps(spotifyPlayer, _.assign({
            compData: {
                uri: 'spotify:track:3MjUtNVVq3C8Fn0MP3zhXa'
            },
            compProp: {
                color: "black",
                style: "list",
                size: "compact"
            },
            style: {
                width: 250,
                height: 80
            }
        }, propsOverrides));
    };

    var createComponent = function (propsOverrides) {
        return testUtils.getComponentFromDefinition(spotifyPlayer, createProps(propsOverrides));
    };

    describe('Spotify Player Component', function () {
        var spotifyPlayerComp;

        beforeEach(function(){
            spotifyPlayerComp = createComponent();
        });

        describe('Skin Properties', function(){
            describe('Structure Validation', function(){
                it("Should Contain two skinparts - iframe and placeholder", function(){
                    var skinProps = spotifyPlayerComp.getSkinProperties();

                    expect(_.size(skinProps)).toBe(3);
                    expect(skinProps.iframe).toBeDefined();
                    expect(skinProps.placeholder).toBeDefined();
                });

                describe("iframe structure", function(){
                    it("should have dimensions when valid source is provided", function(){
                        var skinProps = spotifyPlayerComp.getSkinProperties();

                        expect(skinProps.iframe.style).toBeDefined();
                        expect(skinProps.iframe.style.width).toBeDefined();
                        expect(skinProps.iframe.style.height).toBeDefined();

                    });

                    it("should have a valid source built from given properties", function(){
                        var skinProps = spotifyPlayerComp.getSkinProperties();

                        expect(skinProps.iframe.src).toBe('https://embed.spotify.com/?theme=black&uri=spotify%3Atrack%3A3MjUtNVVq3C8Fn0MP3zhXa&view=list');
                    });
                });
            });

            describe('Visibility Validation', function(){
                it("should hide default placeholder when having a defined iframe src", function(){
                    var skinProps = spotifyPlayerComp.getSkinProperties();

                    expect(skinProps.placeholder.style.display).toBe("none");
                    expect(skinProps.iframe.style.display).not.toBeDefined();
                });

                it("should hide iframe and display default placeholder when there is no src", function(){
                    spotifyPlayerComp = createComponent({
                        compData: {
                            uri: undefined
                        }
                    });
                    var skinProps = spotifyPlayerComp.getSkinProperties();

                    expect(skinProps.iframe.style.display).toBe("none");
                    expect(skinProps.placeholder.style).not.toBeDefined();
                });
            });
        });
     });
});
