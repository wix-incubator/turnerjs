define([
    'lodash',
    'react',
    'santaProps/utils/propsSelectorsFactory',
    'santaProps/utils/propsSelectorsUtils'
], function (_, React, propsSelectorsFactory, propsSelectorsUtils) {
    'use strict';

    var applyFetch = propsSelectorsUtils.applyFetch;

    describe('propsSelectorsFactory', function () {

        it('compDefinition with no mixins and no propTypes', function () {
            var myState = {};
            var myProps = {};

            var compDefinition = {};

            var name = _.uniqueId('compName');

            propsSelectorsFactory.registerComponent(name, compDefinition);

            var componentProps = propsSelectorsFactory.getPropsSelectorForComponent(name)(myState, myProps);

            expect(componentProps).toEqual({});
        });

        it('compDefinition with non-fetch propTypes', function () {
            var myState = {a: 5};
            var myProps = {b: 6};

            var compDefinition = {
                propTypes: {
                    a: React.PropTypes.number
                }
            };

            var name = _.uniqueId('compName');

            propsSelectorsFactory.registerComponent(name, compDefinition);

            var componentProps = propsSelectorsFactory.getPropsSelectorForComponent(name)(myState, myProps);

            expect(componentProps).toEqual({});
        });

        it('compDefinition with fetch propTypes', function () {
            var myState = {a: 5};
            var myProps = {b: 6};

            var compDefinition = {
                propTypes: {
                    a: applyFetch(React.PropTypes.number, function(state, props) {
                        return state.a + props.b;
                    }),
                    b: applyFetch(React.PropTypes.number, function(state, props) {
                        return state.a * props.b;
                    })
                }
            };

            var name = _.uniqueId('compName');

            propsSelectorsFactory.registerComponent(name, compDefinition);

            var componentProps = propsSelectorsFactory.getPropsSelectorForComponent(name)(myState, myProps);

            expect(componentProps).toEqual({a: 11, b: 30});
        });

        it('should merge propTypes from mixins', function () {
            var myState = {a: 5};
            var myProps = {b: 6};

            var compDefinition = {
                mixins: [{
                    propTypes: {
                        b: applyFetch(React.PropTypes.number, function(state, props) {
                            return state.a * props.b;
                        })
                    }
                }],
                propTypes: {
                    a: applyFetch(React.PropTypes.number, function(state, props) {
                        return state.a + props.b;
                    })
                }
            };

            var name = _.uniqueId('compName');

            propsSelectorsFactory.registerComponent(name, compDefinition);

            var componentProps = propsSelectorsFactory.getPropsSelectorForComponent(name)(myState, myProps);

            expect(componentProps).toEqual({a: 11, b: 30});
        });

        it('when adding a mixin before the first call to getPropsSelectorForComponent should generate this prop', function () {
            var myState = {a: 5};
            var myProps = {b: 6};

            var compDefinition = {
                mixins: [{
                    propTypes: {
                        b: applyFetch(React.PropTypes.number, function(state, props) {
                            return state.a * props.b;
                        })
                    }
                }],
                propTypes: {
                    a: applyFetch(React.PropTypes.number, function(state, props) {
                        return state.a + props.b;
                    })
                }
            };

            var name = _.uniqueId('compName');

            propsSelectorsFactory.registerComponent(name, compDefinition);

            compDefinition.mixins.push({
                propTypes: {
                    c: applyFetch(React.PropTypes.number, function(state, props) {
                        return state.a - props.b;
                    })
                }
            });

            var componentProps = propsSelectorsFactory.getPropsSelectorForComponent(name)(myState, myProps);

            expect(componentProps).toEqual({a: 11, b: 30, c: -1});
        });

        it('when adding a mixin after the first call to getPropsSelectorForComponent should not generate this prop', function () {
            var myState = {a: 5};
            var myProps = {b: 6};

            var compDefinition = {
                mixins: [{
                    propTypes: {
                        b: applyFetch(React.PropTypes.number, function(state, props) {
                            return state.a * props.b;
                        })
                    }
                }],
                propTypes: {
                    a: applyFetch(React.PropTypes.number, function(state, props) {
                        return state.a + props.b;
                    })
                }
            };

            var name = _.uniqueId('compName');

            propsSelectorsFactory.registerComponent(name, compDefinition);

            propsSelectorsFactory.getPropsSelectorForComponent(name)(myState, myProps);

            compDefinition.mixins.push({
                propTypes: {
                    c: applyFetch(React.PropTypes.number, function(state, props) {
                        return state.a - props.b;
                    })
                }
            });

            var componentProps = propsSelectorsFactory.getPropsSelectorForComponent(name)(myState, myProps);

            expect(componentProps).toEqual({a: 11, b: 30});
        });

        it('in case of collisions in propTypes higher level wins', function () {
            var myState = {a: 5};
            var myProps = {b: 6};

            var compDefinition = {
                mixins: [{
                    propTypes: {
                        a: applyFetch(React.PropTypes.number, function(state, props) {
                            return state.a * props.b;
                        })
                    }
                }],
                propTypes: {
                    a: applyFetch(React.PropTypes.number, function(state, props) {
                        return state.a + props.b;
                    })
                }
            };

            var name = _.uniqueId('compName');

            propsSelectorsFactory.registerComponent(name, compDefinition);

            var componentProps = propsSelectorsFactory.getPropsSelectorForComponent(name)(myState, myProps);

            expect(componentProps).toEqual({a: 11});
        });

    });

});
