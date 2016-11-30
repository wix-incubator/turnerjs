define(['lodash', 'textCommon'], function (_, textCommon) {
    'use strict';

    function getCssStateFromProps(props) {
        // TODO: shouldn't keep $erase in state
        return {
            '$erase': props.compData.value ? 'showButton' : 'hideButton'
        };
    }

    /**
     * @class components.ErasableTextInput
     * @extends {components.BaseTextInput}
     */
    return {
        displayName: "ErasableTextInput",
        mixins: [textCommon.baseTextInput],

        getInitialState: function() {
            return getCssStateFromProps(this.props);
        },

        componentWillReceiveProps: function (nextProps) {
            this.setState(getCssStateFromProps(nextProps));
        },

        getSkinProperties: function () {
            return _.merge(this.getBaseTextInputSkinProperties(), {
                erase: {
                    children: 'x',
                    onClick: this.props.onErase
                }
            });
        }
    };
});
