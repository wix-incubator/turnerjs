define(['lodash', 'core', 'tpa', 'testUtils', 'reactDOM'], function(_, core, tpa, testUtils, ReactDOM) {
    'use strict';

    var mock = testUtils.mockFactory;

    describe('tpaGluedWidget', function() {
        var rendererModel = {
            clientSpecMap: {
                12: {
                    widgets: {
                        'abcd': {
                            widgetUrl: 'http://myapp.com'
                        }
                    }
                }
            },
            siteInfo: {
            }
        };

        var getComponent = function (props) {
            return testUtils.componentBuilder('wysiwyg.viewer.components.tpapps.TPAGluedWidget', props);
        };

        var givenCompWith = function (data, style, id) {
            var compProps = mock.mockProps()
                .setSkin("wysiwyg.viewer.skins.TPAWidgetSkin")
                .setLayout({fixedPosition: true}) //mocking the actual gluedWidget structure which is necessary for tests
                .addSiteData(_.constant(false), 'isMobileView')
                .addSiteData(rendererModel, 'rendererModel');

            compProps.style = style;
            compProps.id = id;
            compProps.structure.componentType = 'wysiwyg.viewer.components.tpapps.TPAGluedWidget';
            compProps.compData = _.merge({
                applicationId: 12,
                widgetId: 'abcd'
            }, _.clone(data || {}));
            return getComponent(compProps);
        };

        var comp;

        describe('rendering', function () {
            it('should render the iframe src with the width param value taken from the comp data', function () {
                comp = givenCompWith(null, {width: 123}, 'myid');
                var iframe = ReactDOM.findDOMNode(comp).querySelector('iframe');
                expect(iframe.src).toContain('&width=123');
            });

            it('should render the root element with css z-index=50', function() {
                comp = givenCompWith(null, {}, 'myid');
                var style = ReactDOM.findDOMNode(comp).style;
                expect(style.zIndex).toBe('50');
            });

            describe('when the width property is set in the component state', function() {
                beforeEach(function (done) {
                    comp = givenCompWith(null, {}, 'myid');
                    comp.setState({width: 123}, done);
                });

                it('should render the root element with css width set to the value of state.width', function () {
                    var style = ReactDOM.findDOMNode(comp).style;
                    expect(style.width).toBe('123px');
                });

            });

            describe('when the width property is set in the component state', function() {
                beforeEach(function (done) {
                    comp = givenCompWith(null, {}, 'myid');
                    comp.setState({height: 123}, done);
                });

                it('should render the root element with css height set to the value of state.height', function() {
                    var style = ReactDOM.findDOMNode(comp).style;
                    expect(style.height).toBe('123px');
                });
            });
        });
    });
});
