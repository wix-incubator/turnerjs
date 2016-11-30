define(['lodash', 'reactDOM', 'santaProps'], function(_, ReactDOM, santaProps) {
    'use strict';

    /**
     * @class core.facebookComponentMixin
     */

    /**
     * Checks if the component height or width was changed
     * @param newLayout
     * @param oldLayout
     * @returns {boolean}
     */
    function didSizeChange(newLayout, oldLayout) {
        if (newLayout && newLayout.height && newLayout.width && oldLayout && oldLayout.height && oldLayout.width) {
            return newLayout.height !== oldLayout.height || newLayout.width !== oldLayout.width;
        }
        return false;
    }

    return {

        getInitialState: function () {
            this.loadScript();
            this._lastHref = this.getHref(this.props);
            return null;
        },

        propTypes: {
            externalScriptLoader: santaProps.Types.SiteAspects.externalScriptLoader,
            cookie: santaProps.Types.RequestModel.cookie,
            currentUrl: santaProps.Types.currentUrl
        },

        /**
         * Loads the facebook SDK
         */
        loadScript: function () {
            if (typeof window !== 'undefined' && !window.FB) {// server side rendering fix
                this.props.externalScriptLoader.loadScript('FACEBOOK', null, {
                    currentUrl: this.props.currentUrl,
                    cookie: this.props.cookie
                });
            }
        },

        /**
         * Re renders the facebook plugin DOM node
         */
        parseFacebookPluginDomNode: function () {
            if (_.has(window, 'FB.XFBML.parse')) {
                window.FB.XFBML.parse(ReactDOM.findDOMNode(this));
            }
        },


        componentDidMount: function () {
            this.parseFacebookPluginDomNode();
        },

        componentDidUpdate: function (nextProps) {
            var newHref = this.getHref(this.props);

            if (!_.isEqual(nextProps.compData, this.props.compData) ||
                !_.isEqual(nextProps.compProp, this.props.compProp) ||
                didSizeChange(nextProps.style, this.props.style) ||
                newHref !== this._lastHref) {
                this.parseFacebookPluginDomNode();
            }
            this._lastHref = newHref;
        }
    };
});
