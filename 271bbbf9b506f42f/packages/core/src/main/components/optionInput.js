define(['lodash', 'core/components/skinBasedComp'], function (_, skinBasedComp) {
    'use strict';

    var toolTipId = "toolTip";

    /**
     * @class core.optionInput
     * @extends {skinBasedComp}
     */
    return {
        mixins: [skinBasedComp],

        getInitialState: function () {
            return this.getCssState(this.props);
        },

        componentWillReceiveProps: function (props) {
            this.setState(this.getCssState(props));
        },

        getCssState: function (props) {
            return {
                '$enabledState': props.compData.disabled ? 'disabled' : 'enabled',
                '$selectState': props.selected ? 'selected' : 'unselected'
            };
        },

        onMouseEnter: function () {
            this.refs[toolTipId].showToolTip({}, {source: this});
        },

        onMouseLeave: function () {
            this.refs[toolTipId].closeToolTip();
        },

        createInfoTipChildComponent: function () {
            return this.createChildComponent({
                    content: this.props.compData.description,
                    id: toolTipId
                },
                "wysiwyg.common.components.InfoTip",
                {      //TODO: this should be in skin exports
                    skin: 'wixapps.integration.skins.ecommerce.options.InfoTipSkin',
                    styleId: this.props.loadedStyles['wixapps.integration.skins.ecommerce.options.InfoTipSkin']
                },
                {
                    ref: toolTipId,
                    className: this.props.styleId + "tooltip"
                });
        }
    };
});
