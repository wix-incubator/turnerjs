define(['lodash', 'santaProps'], function (_, santaProps) {
    'use strict';

    function getState(publicState) {
        var propsInfo = {
            props: this.props.compProp,
            data: this.props.compData
        };

        return publicState(this.state, propsInfo);
    }

	/**
     * Creates a mixin that update RuntimeDal with the public state of the component.
     * @param {function(state: Object, {data: Object?, props: Object?})} getPublicState Function to get the public state out of the current state, data and properties
     * @returns {Object} The mixin definition
     */
    function compStateMixin(getPublicState) {
        return {
            statics: {
                publicState: getPublicState
            },

            propTypes: {
                setCompState: santaProps.Types.DAL.setCompState.isRequired,
                removeCompState: santaProps.Types.DAL.removeCompState.isRequired,
                id: santaProps.Types.Component.id.isRequired
            },

            componentWillUnmount: function () {
                this.props.removeCompState(this.props.id);
            },

            componentDidMount: function () {
                this.props.setCompState(this.props.id, getState.call(this, getPublicState));
            },

            componentDidUpdate: function () {
                this.props.setCompState(this.props.id, getState.call(this, getPublicState));
            }
        };
    }

    return compStateMixin;
});
