define(['lodash', 'core', 'react'], function (_, core, React) {
    'use strict';

    var mixins = core.compMixins;

    /**
     * @class components.Icon
     * @extends {core.skinBasedComp}
     * @property {comp.properties} props
     */
    return {
        displayName: "Icon",
        mixins: [mixins.skinBasedComp],
        getInitialState: function () {
            return {
                isIconClicked: false
            };
        },

        onClick: function () {
            //toggle behavior
            this.setState({isIconClicked: !this.state.isIconClicked});
        },

        getSkinProperties: function () {
            var compData = this.props.compData;
            var refData = {
                "img": {
                    parentConst: React.DOM.img,
                    src: compData.url,
                    title: compData.title,
                    width: compData.width,
                    height: compData.height,
                    onClick: this.onClick
                }
            };
            refData[""] = {style: _.merge(this.props.style, {
                width: compData.width,
                height: compData.height
            })};
            return refData;
        }
    };
});