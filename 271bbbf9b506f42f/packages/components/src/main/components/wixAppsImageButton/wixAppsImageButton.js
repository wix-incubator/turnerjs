define(['core', 'react'], function (core, React) {
    'use strict';

    var mixins = core.compMixins;

    var SpriteState = {
        Default: 0,
        Hover: 1,
        Click: 2
    };

    /**
     * @class components.ImageButton
     * @extends {core.skinBasedComp}
     */
    return {
        displayName: "ImageButton",

        mixins: [mixins.skinBasedComp],

        getInitialState: function () {
            return {currentPositionX: this.props.compProp.startPositionX, currentPositionY: this.props.compProp.startPositionY};
        },

        setSpriteState: function (offset) {
            var compProp = this.props.compProp;
            var compData = this.props.compData;

            switch (compProp.spriteDirection) {
                case 'none':
                    break;
                case 'horizontal':
                    this.setState({currentPositionX: compProp.startPositionX - offset * compData.width});
                    break;
                default:
                    this.setState({currentPositionY: compProp.startPositionY - offset * compData.height});
                    break;
            }
        },

        onMouseOver: function () {
            this.setSpriteState(SpriteState.Hover);
            if (this.props.onMouseOver) {
                this.props.onMouseOver();
            }
        },

        onMouseDown: function () {
            this.setSpriteState(SpriteState.Click);
        },

        onMouseUp: function () {
            this.setSpriteState(SpriteState.Hover);
        },

        onMouseOut: function () {
            this.setSpriteState(SpriteState.Default);
            if (this.props.onMouseOut) {
                this.props.onMouseOut();
            }
        },

        getSpriteProperties: function (compData) {
            var styles = {
                backgroundImage: "url(" + compData.url + ")",
                backgroundRepeat: "no-repeat",
                backgroundPosition: this.state.currentPositionX + "px " + this.state.currentPositionY + "px",
                width: compData.width,
                height: compData.height,
                display: "inline-block"
            };

            return {
                "": {
                    style: {
                        width: compData.width,
                        height: compData.height
                    },
                    children: React.DOM.span({style: styles}),
                    onMouseOver: this.onMouseOver,
                    onMouseOut: this.onMouseOut,
                    onMouseDown: this.onMouseDown,
                    onMouseUp: this.onMouseUp
                }
            };
        },

        getImageProperties: function (compData) {
            return {
                "": {
                    style: {
                        width: compData.width,
                        height: compData.height
                    },
                    children: React.DOM.img({src: compData.url, width: compData.width, height: compData.height, title: compData.title}),
                    onMouseOver: this.props.onMouseOver,
                    onMouseOut: this.props.onMouseOut
                }
            };
        },

        getSkinProperties: function () {
            var compData = this.props.compData;

            return this.props.compProp.isSprite ?
                this.getSpriteProperties(compData) :
                this.getImageProperties(compData);
        }
    };
});