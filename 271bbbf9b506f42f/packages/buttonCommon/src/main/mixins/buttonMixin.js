define(['lodash', 'santaProps', 'utils', 'textCommon'], function (_, santaProps, utils, textCommon) {
    'use strict';

    function getLabelMargins(props) {
        var margins = {};
        if (props.compProp.align !== 'center') {
            var marginProp = 'margin' + (props.compProp.align ? utils.stringUtils.capitalize(props.compProp.align) : '');
            margins[marginProp] = props.compProp.margin;
        }
        return margins;
    }

    function getLabelPadding(props) {
        var padding = {};
        if (props.compProp.padding !== '') {
            padding.padding = props.compProp.padding;
        }
        return padding;
    }

    function getLineHeight(){
        if (this.shouldRecalculateLineHeight){
            return {'lineHeight': ''};
        }
        return {};
    }

    /**
     * @exports core/components/buttonMixin
     */
    var buttonMixin = {

        propTypes: {
            compData: santaProps.Types.Component.compData,
            compProp: santaProps.Types.Component.compProp,
            compTheme: santaProps.Types.Component.theme
        },

        mixins: [textCommon.textScaleMixin],

        componentWillMount: function(){
            this.currentStyle = this.props.theme;
            this.currentScale = _.get(this, 'props.structure.layout.scale', 1);
        },
        componentWillReceiveProps: function(nextProps){
            var newStyle = nextProps.theme;
            var newScale = _.get(nextProps, 'structure.layout.scale', 1);
            if (!_.isEqual(this.currentStyle, newStyle) || this.currentScale !== newScale){
                this.shouldRecalculateLineHeight = true;
            }
            this.currentStyle = newStyle;
            this.currentScale = newScale;
        },
        componentDidUpdate: function(){
            if (this.shouldRecalculateLineHeight){
                this.shouldRecalculateLineHeight = false;
            }
        },
        resetMinHeightIfNeeded: function(skinProps){
            if (this.shouldRecalculateLineHeight){ //MUST keep this if here. Though technically always resetting the minHeight makes sense, it just DOESNT WORK for some weird reason.
                skinProps[''] = skinProps[''] || {};
                skinProps[''].style = skinProps[''].style || {};
                skinProps[''].style.minHeight = '';
            }
        },
        getLabelStyle: function () {
            return _.merge(getLabelMargins(this.props), getLabelPadding(this.props), this.getFontSize(), getLineHeight.call(this));
        }
    };

    return buttonMixin;
});
