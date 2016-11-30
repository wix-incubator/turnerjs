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
     * @class components.SelectOptionsList
     * @extends {core.skinBasedComp}
     * @extends {core.timeoutsMixin}
     * @property {{$validity: string, $tooltip: string}}} state
     */
    return {
        displayName: "SelectOptionsList",
        mixins: [mixins.skinBasedComp, mixins.timeoutsMixin],

        propType: {
            itemClassName: React.PropTypes.string.isRequired,
            itemSkin: React.PropTypes.string.isRequired,
            selectedItem: React.PropTypes.object,
            valid: React.PropTypes.boolean,

            // Events
            onSelectionChange: React.PropTypes.function
        },

        getInitialState: function () {
            return {
                '$validity': this.props.valid === false ? 'invalid' : 'valid',
                '$tooltip': this.props.selectedItem && this.props.selectedItem.description ? 'displayed' : 'hidden'
            };
        },

        componentWillMount: function () {
            if (this.state.$tooltip === 'displayed') {
                var self = this;
                this.setTimeout(function () {
                    self.setState({$tooltip: 'hidden'});
                }, 1500);
            }
        },

        componentWillReceiveProps: function (props) {
            var oldProps = this.props;
            var newState = {
                $validity: props.valid === false ? 'invalid' : 'valid'
            };

            if (!oldProps.selectedItem || (oldProps.selectedItem && props.selectedItem && oldProps.selectedItem.description !== props.selectedItem.description)) {
                newState.$tooltip = props.selectedItem && props.selectedItem.description ? 'displayed' : 'hidden';
            }

            this.setState(newState);
            if (this.props.selectedItem !== props.selectedItem && newState.$tooltip === 'displayed') {
                var self = this;
                this.setTimeout(function () {
                    self.setState({$tooltip: 'hidden'});
                }, 1500);
            }
        },

        getSkinProperties: function () {
            var children = _.map(this.props.compData.options, function (itemData, index) {
                var extraProperties = {
                    selected: this.props.selectedItem === itemData,
                    onClick: selectItem.bind(this, itemData),
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

            var skinPartsProps = {
                itemsContainer: {
                    children: children
                }
            };

            if (this.props.selectedItem) {
                skinPartsProps.tooltip = {
                    children: [this.props.selectedItem.description]
                };
            }

            return skinPartsProps;
        }
    };
});
