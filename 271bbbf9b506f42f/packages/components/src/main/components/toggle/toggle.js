define(['core'], function (/** core */core) {
    'use strict';

    var mixins = core.compMixins;

    /**
     * @class components.Toggle
     * @extends {core.skinBasedComp}
     */

    return {
        displayName: "Toggle",
        mixins: [mixins.skinBasedComp],

        getInitialState: function () {
            return this.getCssState(this.props);
        },

        componentWillReceiveProps: function (props) {
            this.setState(this.getCssState(props));
        },

        getCssState: function (props) {
            return {$default: props.initialState || 'off'};
        },

        getSkinProperties: function () {
            var onProxyInstance = this.props.children[0];
            var offProxyInstance = this.props.children[1];

            return {
                "on": {children: this.props.initialState === 'on' ? [onProxyInstance] : []},
                "off": {children: this.props.initialState === 'off' ? [offProxyInstance] : []}
            };
        }
    };
});