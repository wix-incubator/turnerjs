define(['lodash', 'core', 'santaProps'], function (_, core, santaProps) {
    'use strict';

    var getPublicState = function (state) {
        return {valid: _.get(state, 'valid', true)};
    };

    /**
     * @class components.Checkbox
     * @extends {core.skinBasedComp}
     */
    return {
        displayName: "Checkbox",

        statics: {
            useSantaTypes: true,

            behaviors: {
                change: {methodName: 'validate'}
            }
        },

        propTypes: {
            compData: santaProps.Types.Component.compData.isRequired,
            compProp: santaProps.Types.Component.compProp.isRequired
        },

        mixins: [core.compMixins.skinBasedComp, core.compMixins.runTimeCompData, core.compMixins.compStateMixin(getPublicState)],

        validate: function () {
            var valid = this.props.compProp.required ? this.refs.input.checked : true;
            this.setState({valid: valid});
            this.handleAction('validate');
        },

        getInitialState: function () {
           return _.assign(getPublicState(), {checked: false});
        },

        componentWillMount: function () {
            this.setState({checked: this.props.compData.checked});
        },

        componentWillReceiveProps: function (nextProps) {
            var state = {checked: nextProps.compData.checked};
            if (nextProps.renderFlags.componentViewMode === 'editor') {
                state.valid = true;
            }
            this.setState(state);
        },

        onChange: function () {
            if (this.props.compProp.readOnly || this.props.compProp.isDisabled) {
                return;
            }

            var updatedData = {checked: !this.state.checked};

            this.setState(updatedData);
            this.updateData(updatedData);
            this.handleAction('change', updatedData);
            this.validate();
        },

        onFocus: function () {
            this.handleAction('focus');
        },

        getSkinProperties: function () {
            return {
                '': {
                    "data-error": !this.state.valid,
                    "data-disabled": !!this.props.compProp.isDisabled
                },
                container: {
                    tabIndex: 0,
                    onFocus: this.onFocus
                },
                input: {
                    disabled: !!this.props.compProp.isDisabled,
                    required: this.props.compProp.required,
                    checked: this.state.checked,
                    onChange: this.onChange,
                    value: this.props.compData.value
                }
            };
        }
    };
});
