/*eslint no-multi-spaces:0*/
define(['core', 'react'], function (/** core */ core, React) {
    'use strict';

    var mixins = core.compMixins;
    var SKYPE_SIZES = {
        call: {
            small:  {width: 38, height: 16},
            medium: {width: 56, height: 24},
            large:  {width: 73, height: 32}
        },
        chat: {
            small:  {width: 45, height: 16},
            medium: {width: 65, height: 24},
            large:  {width: 86, height: 32}
        }
    };

    /**
     * @class components.SkypeCallButton
     * @extends {core.skinBasedComp}
     */
    return {
        displayName: 'SkypeCallButton',
        mixins: [mixins.skinBasedComp],
        getInitialState: function () {
            var data  = this.props.compData,
                props = this.props.compProp;

            return {
                $buttontype: data.buttonType,
                $imagesize:  props.imageSize,
                $imagecolor: props.imageColor
            };
        },
        componentWillReceiveProps: function(nextProps) {
            var data = nextProps.compData;
            var props = nextProps.compProp;
            this.setState({
                $buttontype: data.buttonType,
                $imagesize:  props.imageSize,
                $imagecolor: props.imageColor
            });
        },
        getSkinProperties: function () {
            var data  = this.props.compData,
                props = this.props.compProp,
                size  = SKYPE_SIZES[data.buttonType][props.imageSize];

            // fallback for placeholder
            var result = {
                '': {
                    style: {
                        width: size.width,
                        height: size.height
                    }
                },
                'placeholder': {
                    parentConst: React.DOM.div,
                    style: {
                        display: 'block',
                        width: size.width,
                        height: size.height
                    }
                }
            };

            if (data.skypeName) {
                result.skypeLink = {
                    href: 'skype:' + data.skypeName + '?' + data.buttonType
                };
            }
            return result;
        }
    };
});
