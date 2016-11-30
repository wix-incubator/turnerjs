/**
 * Created by lotemh on 7/17/2014.
 */
define(['lodash', 'react', 'core', 'reactDOM'], function(_, React, /** core */ core, ReactDOM) {
    'use strict';

    var mixins = core.compMixins;

    function getButtonSize(props) {
        var layout = props.compProp.size + '_' + props.compProp.annotation;
        switch (layout) {
            case 'small_bubble':
                return {width: 70, height: 15};
            case 'small_none':
                return {width: 24, height: 15};
            case 'small_inline':
                return {width: 250, height: 15};
            case 'medium_bubble':
                return {width: 90, height: 20};
            case 'medium_none':
                return {width: 32, height: 20};
            case 'medium_inline':
                return {width: 250, height: 20};
            case 'standard_bubble':
                return {width: 106, height: 24};
            case 'standard_none':
                return {width: 38, height: 24};
            case 'standard_inline':
                return {width: 250, height: 24};
            case 'tall_bubble':
                return {width: 50, height: 60};
            case 'tall_none':
                return {width: 50, height: 20};
            case 'tall_inline':
                return {width: 250, height: 20};
            default:
                return {width: 50, height: 60};
        }
    }

    /**
     * @class components.wGooglePlusOne
     * @extends {core.skinBasedComp}
     */
    return {
        displayName: 'WGooglePlusOne',
        mixins: [mixins.skinBasedComp],

        componentWillMount: function () {
            var loader = this.loader = this.props.siteAPI.getSiteAspect('externalScriptLoader');
            loader.loadScript('GOOGLE', this.renderTag, {
                cookie: this.props.siteData.requestModel.cookie,
                currentUrl: this.props.siteData.currentUrl
            });
        },

        componentDidMount: function () {
            if (window.gapi) {
                this.renderTag();
            }
        },
        componentDidUpdate: function (prevProps) {
            var propNames = ['annotation', 'size'];
            if (!_.isEqual(_.pick(this.props.compProp, propNames), _.pick(prevProps.compProp, propNames))) {
                this.renderTag();
            }
        },

        renderTag: function () {
            var gPlusRef = this.refs.googlePlus || this.refs[''];
            var buttonSize = getButtonSize(this.props);

            if (_.get(window, 'gapi.plusone')) {// server side rendering fix
                window.gapi.plusone.render(ReactDOM.findDOMNode(gPlusRef), {
                    size: this.props.compProp.size,
                    annotation: this.props.compProp.annotation,
                    width: buttonSize.width
                });
            }
        },

        componentWillUnmount: function () {
            this.loader.unsubscribe('GOOGLE', this.renderTag);
        },
        getSkinProperties: function () {
            return {
                googlePlus: {
                    children: React.DOM.div({
                        className: 'g-plusone'
                    }),
                    ref: 'googlePlus'
                },
                '': {
                    style: getButtonSize(this.props)
                }
            };
        }
    };
});
