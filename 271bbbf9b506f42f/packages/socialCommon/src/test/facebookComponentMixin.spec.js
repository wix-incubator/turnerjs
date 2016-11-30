define(['react', 'lodash', 'testUtils', 'socialCommon/mixins/facebookComponentMixin'],
    function (React, _, testUtils, facebookComponentMixin) {
        'use strict';

        describe('facebookComponentMixin', function () {

            var component;

            function createProps(partialProps) {
                return testUtils.santaTypesBuilder.getComponentProps(getCompDefinition(), _.merge({
                    style: {
                        'position': 'absolute',
                        width: 280,
                        height: 130,
                        x: 0,
                        y: 0
                    },
                    compData: {
                        showHeader: false,
                        showFaces: false,
                        showStream: false,
                        facebookPageId: 'wix'
                    },
                    externalScriptLoader: {
                        loadScript: jasmine.createSpy('loadScript'),
                        getScriptDescription: function () {
                            return {
                                NAME: 'FacebookSDK',
                                SRC: 'fake//connect.facebook.net/en_US/sdk.js#xfbml=1&appId=236335823061286&version=v2.0'
                            };
                        }
                    }
                }, partialProps));
            }

            function getComponent(partialProps) {
                var props = createProps(partialProps);
                return testUtils.getComponentFromDefinition(getCompDefinition(), props);
            }


            function getCompDefinition() {
                return {
                    mixins: [facebookComponentMixin],
                    getHref: _.noop,
                    render: function () {
                        return React.DOM.div(this.props);
                    }
                };
            }

            beforeEach(function () {
                component = getComponent();
            });

            it('should call loadScript on getInitialState', function () {
                var oldFB = window.FB;
                window.FB = undefined;
                component.getInitialState();
                window.FB = oldFB;

                expect(component.props.externalScriptLoader.loadScript).toHaveBeenCalled();
            });

            // parseFacebookPluginDomNode calls XFBML.parse in every test
            it('should re render the component using XFBML.parse on componentDidMount', function () {
                spyOn(component, 'parseFacebookPluginDomNode');

                component.componentDidMount();

                expect(component.parseFacebookPluginDomNode).toHaveBeenCalled();
            });

            it('should re render the component using XFBML.parse on props change', function () {
                var newProps = _.cloneDeep(component.props);
                spyOn(component, 'parseFacebookPluginDomNode');

                component.props.compData.showStream = true;
                component.componentDidUpdate(newProps);

                expect(component.parseFacebookPluginDomNode).toHaveBeenCalled();
            });

            it('should re render the component using XFBML.parse on size change', function () {
                var newProps = _.cloneDeep(component.props);
                spyOn(component, 'parseFacebookPluginDomNode');

                component.props.style.height += 20;
                component.componentDidUpdate(newProps);

                expect(component.parseFacebookPluginDomNode).toHaveBeenCalled();
            });

            it('should re render the component using XFBML.parse on href change', function () {
                var newProps = _.cloneDeep(component.props);
                spyOn(component, 'parseFacebookPluginDomNode');

                component._lastHref = 'http://www.facebook.com/sheker';
                component.componentDidUpdate(newProps);

                expect(component.parseFacebookPluginDomNode).toHaveBeenCalled();
            });

            it('should not call XFBML.parse if props didn\'t change', function () {
                var newProps = _.cloneDeep(component.props);
                spyOn(component, 'parseFacebookPluginDomNode');

                component.componentDidUpdate(newProps);

                expect(component.parseFacebookPluginDomNode).not.toHaveBeenCalled();
            });

            it('should not call XFBML.parse if size didn\'t change and its not passed in nextprops', function () {
                var newProps = _.cloneDeep(component.props);

                delete newProps.style;
                spyOn(component, 'parseFacebookPluginDomNode');

                component.componentDidUpdate(newProps);

                expect(component.parseFacebookPluginDomNode).not.toHaveBeenCalled();
            });

            it('should not call XFBML.parse if position was changed', function () {
                var newProps = _.cloneDeep(component.props);
                spyOn(component, 'parseFacebookPluginDomNode');
                component.props.style.x += 20;
                component.props.style.y += 20;

                component.componentDidUpdate(newProps);

                expect(component.parseFacebookPluginDomNode).not.toHaveBeenCalled();
            });


            it('should call XFML.parse if lastHref has changed', function() {
                var oldWindowFB = window.FB;
                window.FB = {
                    XFBML: {
                        parse: jasmine.createSpy('parse')
                    }
                };

                component = getComponent();
                var newProps = _.cloneDeep(component.props);

                component._lastHref = 'http://www.facebook.com/sheker';
                component.componentDidUpdate(newProps);

                expect(window.FB.XFBML.parse).toHaveBeenCalled();

                window.FB = oldWindowFB;
            });
        });
    });
