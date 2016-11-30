define(['lodash', /** testUtils */ 'testUtils', 'react', 'facebookLikeBox'],
    function (_, testUtils, React, facebookLikeBox) {
        'use strict';

        var component;
        var minHeight = {SIMPLE: 130, FACES: 214, STREAM: 575, MAX: 2000};

        describe('FacebookLikeBox Component', function () {

            beforeEach(function () {
                this.getChildren = function (likebox) {
                    return likebox.getSkinProperties()[''].children;
                };

                component = createFacebookLikeBoxComponent();
            });

            function createFacebookLikeBoxProps(partialProps) {
                return testUtils.santaTypesBuilder.getComponentProps(facebookLikeBox, _.merge({
                    compData: {
                        showHeader: false,
                        showFaces: false,
                        showStream: false,
                        facebookPageId: 'wix'
                    },
                    style: {
                        'psoition': 'absolute',
                        width: 280,
                        height: 130
                    },
                    externalScriptLoader: {
                        loadScript: function () {
                        },
                        getScriptDescription: function () {
                            return {
                                NAME: 'FacebookSDK',
                                SRC: 'fake//connect.facebook.net/en_US/sdk.js#xfbml=1&appId=236335823061286&version=v2.0'
                            };
                        }
                    }

                }, partialProps));
            }

            function createFacebookLikeBoxComponent(partialProps) {
                var props = createFacebookLikeBoxProps(partialProps);
                return testUtils.getComponentFromDefinition(facebookLikeBox, props);
            }

            describe('Test container child div (actual comp)', function () {

                it('should return DIV with correct attributes', function () {
                    var expectedDiv = React.DOM.div({
                        className: 'fb-page',
                        'data-href': 'http://www.facebook.com/wix',
                        'data-height': 130,
                        'data-width': 280,
                        'data-hide-cover': true,
                        'data-show-posts': false,
                        'data-show-facepile': false,
                        'data-adapt-container-width' : true,
                        key: '280130'
                    });
                    var createdComp = this.getChildren(component);
                    expect(createdComp).toEqual(expectedDiv);
                });
            });

            describe('Minimum height', function () {
                it('should be set to minimum (130) when no posts or faces shown', function () {
                    var likebox = createFacebookLikeBoxComponent();
                    var createdComp = this.getChildren(likebox);
                    expect(createdComp.props['data-height']).toEqual(minHeight.SIMPLE);
                });

                it('should be set to medium (214) when faces are shown but posts are not', function () {
                    var likebox = createFacebookLikeBoxComponent({compData: {showFaces: true}});
                    var createdComp = this.getChildren(likebox);
                    expect(createdComp.props['data-height']).toEqual(minHeight.FACES);
                });

                it('should be set to stream (575) when posts are shown (faces does not matter)', function () {
                    var likebox = createFacebookLikeBoxComponent({compData: {showStream: true}});
                    var createdComp = this.getChildren(likebox);
                    expect(createdComp.props['data-height']).toEqual(minHeight.STREAM);
                });
            });


        });
    });
