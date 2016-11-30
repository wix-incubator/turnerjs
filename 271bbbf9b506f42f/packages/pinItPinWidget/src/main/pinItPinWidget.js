define(['lodash', 'core', 'santaProps', 'utils', 'pinItPinWidget/layout/PinItPinWidgetLayout', 'pinItPinWidget/aspects/PinterestWidgetPostMessageAspect'], function (_, /** core */ core, santaProps, utils) {
    'use strict';

    var DEFAULT_SIZES = {height: 274, width: 225};

    var getIframeSrc = function (props) {
        var iframeParams = {
            'pinUrl': props.compData.pinId,
            'compId': props.id
        };
        return props.santaBase + '/static/external/pinterestWidget.html?' + utils.urlUtils.toQueryString(iframeParams);

    };

    function getCompDimensions(compStyle, iframeDimensions, shouldShowError) {
        if (shouldShowError) {
            return DEFAULT_SIZES;
        }

        return _.assign({}, compStyle, iframeDimensions);
    }

    /**
     * @class components.PinItPinWidget
     * @extends {core.skinBasedComp}
     */
    return {
        displayName: 'PinItPinWidget',

        mixins: [core.compMixins.skinBasedComp, core.compMixins.skinInfo],

        propTypes: {
            shouldPresentErrorMessage: santaProps.Types.Pinterest.shouldPresentErrorMessage,
            iframeDimensions: santaProps.Types.Pinterest.iframeDimensions,
            santaBase: santaProps.Types.santaBase.isRequired,
            compData: santaProps.Types.Component.compData.isRequired
        },

        statics: {
            useSantaTypes: true
        },

        getInitialState: function () {
            return {
                $shouldShowError: this.props.shouldPresentErrorMessage || "noError"
            };
        },

        componentWillReceiveProps: function () {
            var shouldShowError = this.props.shouldPresentErrorMessage;
            if (shouldShowError !== this.state.$shouldShowError) {
                this.setState({$shouldShowError: shouldShowError});
            }
        },

        getSkinProperties: function () {
            var shouldShowError = this.state.$shouldShowError === 'error';
            var compDimensions = getCompDimensions(this.props.style, this.props.iframeDimensions, shouldShowError);

            return {
                '': {
                    style: _.pick(compDimensions, ['width', 'height'])
                },
                'iframe': {
                    src: getIframeSrc(this.props),
                    style: shouldShowError ? {height: '0%', width: '0%'} : {height: '100%', width: '100%'}
                }
            };
        }
    };
});
