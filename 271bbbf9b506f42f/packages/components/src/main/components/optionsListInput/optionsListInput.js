define(['lodash', 'core', 'react'], function (_, /** core */core, React) {
    'use strict';

    var mixins = core.compMixins;

    function selectItem(itemData, event, domID) {
        if (this.props.onSelectionChange) {
            event.type = 'selectionChanged';
            event.payload = itemData;
            this.props.onSelectionChange(event, domID);
        }
    }
    /**
     * @class components.OptionsListInput
     * @extends {core.skinBasedComp}
     * @property {{$validity: string}} state
     */
    return {
        displayName: "OptionsListInput",
        mixins: [mixins.skinBasedComp],

        propType: {
            itemClassName: React.PropTypes.string.isRequired,
            itemSkin: React.PropTypes.string.isRequired,
            selectedItem: React.PropTypes.object,
            valid: React.PropTypes.boolean,

            // Events
            onSelectionChange: React.PropTypes.function
        },

        getInitialState: function () {
            return this.getCssState(this.props);
        },

        getCssState: function (props) {
            return {
                '$validity': props.valid === false ? 'invalid' : 'valid'
            };
        },

        componentWillReceiveProps: function (props) {
            if (props.valid !== this.props.valid) {
                this.setState(this.getCssState(props));
            }
        },

        getSkinProperties: function () {
            var children = _.map(this.props.compData.options, function (itemData, index) {
                var extraProperties = {
                    selected: this.props.selectedItem === itemData,
                    onClick: selectItem.bind(this, itemData),
                    id: this.props.id + index,
                    ref: index
                };
                return this.createChildComponent(
                    itemData,
                    this.props.itemClassName, { //TODO: this should be in skin exports
                        skin: this.props.itemSkin,
                        styleId: this.props.loadedStyles[this.props.itemSkin]
                    },
                    extraProperties);

            }, this);

            return {
                "": {
                    children: children
                }
            };
        }
    };
});
