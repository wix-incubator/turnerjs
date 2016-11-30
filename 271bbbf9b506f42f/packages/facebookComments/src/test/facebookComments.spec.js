define(['lodash', 'testUtils', 'react', 'facebookComments'],
    function (_, testUtils, React, facebookComments) {
        'use strict';

        describe('Facebook Comment Component', function () {

            function createFacebookCommentsProps(partialProps) {
                return testUtils.santaTypesBuilder.getComponentProps(facebookComments, _.merge({
                    compData: {},
                    compProp: {},
                    cookie: 'my cookie',
                    registerReLayoutPending: _.noop
                }, partialProps));
            }

            function createFacebookCommentsComponent(partialProps) {
                var props = createFacebookCommentsProps(partialProps);
                return testUtils.getComponentFromDefinition(facebookComments, props);
            }

            describe('Test the children', function () {
                it('should return DIV with correct attributes', function () {
                    var comp = createFacebookCommentsComponent({
                        compProp: {
                            colorScheme: 'light',
                            numPosts: 5,
                            width: 500
                        }
                    });

                    var expectedDiv = React.DOM.div({
                        className: 'fb-comments',
                        'data-href': 'mockExternalBaseUrl',
                        'data-width': 500,
                        'data-numposts': 5,
                        'data-colorscheme': 'light',
                        'data-mobile': false
                    });

                    var skinProperties = comp.getSkinProperties();

                    expect(skinProperties.facebook.children).toEqual(expectedDiv);
                });
            });
            describe('commentsAreReady', function () {
                it('should call registerReLayoutPending when commentsAreReady and force render with setState', function () {
                    var comp = createFacebookCommentsComponent({
                        registerReLayoutPending: jasmine.createSpy('registerReLayoutPending')
                    });

                    spyOn(comp, 'setState');

                    comp.commentsAreReady();

                    expect(comp.props.registerReLayoutPending).toHaveBeenCalled();
                    expect(comp.setState).toHaveBeenCalled();
                });
            });

            describe('window.FB', function(){
                it('should call window.FB.Event.subscribe on mount', function() {
                    window.FB = {
                        Event: {
                            subscribe: jasmine.createSpy('subscribe')
                        }
                    };

                    createFacebookCommentsComponent();

                    expect(window.FB.Event.subscribe).toHaveBeenCalled();
                });

                it('should call window.FB.Event.unsubscribe on unmount', function() {
                    window.FB = {
                        Event: {
                            subscribe: jasmine.createSpy('subscribe'),
                            unsubscribe: jasmine.createSpy('unsubscribe')
                        }
                    };

                    var comp = createFacebookCommentsComponent();

                    comp.componentWillUnmount();

                    expect(window.FB.Event.unsubscribe).toHaveBeenCalled();
                });
            });
        });
    });
