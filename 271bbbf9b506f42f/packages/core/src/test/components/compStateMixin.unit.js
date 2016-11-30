define([
    'lodash',
    'react',
    'core/components/compStateMixin',
    'testUtils'
], function(_, React, compStateMixin, testUtils) {
    'use strict';

    describe('compStateMixin', function() {

        var COMP_ID = 'compId';
        var testCompDef, mockSiteApi;
        beforeEach(function() {
            function getPublicState(state) {
                return _.pick(state, ['test', 'key1', 'key2']);
            }

            testCompDef = {
                mixins: [compStateMixin(getPublicState)],
                render: React.DOM.div
            };
            mockSiteApi = testUtils.mockFactory.mockSiteAPI();
        });

        function getComponent(def) {
            function getTestCompFactory(compDef) {
                var compClass = React.createClass(compDef);
                return React.createFactory(compClass);
            }

            var testCompFactory = getTestCompFactory(def);
            var parentDef = {
                getInitialState: function () {
                    var siteData = mockSiteApi.getSiteData();
                    var santaTypesProps = testUtils.santaTypesBuilder.getComponentProps(def, {}, siteData, mockSiteApi);
                    return _.defaults({
                        id: COMP_ID,
                        siteAPI: mockSiteApi,
                        siteData: mockSiteApi.getSiteData(),
                        ref: 'test'
                    }, santaTypesProps);
                },
                render: function () {
                    return testCompFactory(this.state);
                }
            };

            return React.addons.TestUtils.renderIntoDocument(getTestCompFactory(parentDef)());
        }

        describe('setState', function() {

            it('should update the dal with the new state', function() {
                var comp = getComponent(testCompDef);

                comp.refs.test.setState({test: 'comp state value'});
                expect(mockSiteApi.getRuntimeDal().getCompState(COMP_ID)).toEqual({test: 'comp state value'});
            });

            it('should merge the new state in the dal', function() {
                var comp = getComponent(testCompDef);

                comp.refs.test.setState({key1: 'value 1'});
                comp.refs.test.setState({key2: 'value 2'});

                expect(mockSiteApi.getRuntimeDal().getCompState(COMP_ID)).toEqual({
                    key1: 'value 1',
                    key2: 'value 2'
                });
            });

            it('should update the dal with the new state when called before the initial render', function() {
                testCompDef.componentWillMount = function() {
                    this.setState({test: 'comp state value'});
                };

                getComponent(testCompDef);

                expect(mockSiteApi.getRuntimeDal().getCompState(COMP_ID)).toEqual({test: 'comp state value'});
            });

            it('should only expose the public state to the dal', function () {
                var comp = getComponent(testCompDef);

                comp.refs.test.setState({key1: 'value 1', key2: 'value 2', key3: 'value 3'});

                expect(mockSiteApi.getRuntimeDal().getCompState(COMP_ID)).toEqual({
                    key1: 'value 1',
                    key2: 'value 2'
                });
            });
        });
    });
});
