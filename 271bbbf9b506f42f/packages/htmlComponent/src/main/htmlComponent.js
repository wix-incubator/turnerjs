define(['lodash', 'react', 'core', 'utils', 'santaProps'], function (_, React, /** core */ core, utils, santaProps) {
    'use strict';

    var mixins = core.compMixins;
    var urlUtils = utils.urlUtils;

    function getIFrameSrc() {
        var url = this.props.compData.url;
        var isExternal = (this.props.compData.sourceType === 'external');
        var htmlComponentTopologyUrl = this.props.serviceTopologyStaticHTMLComponentUrl;

        if (!isExternal && utils.stringUtils.startsWith(url, 'html/')) {
            url = htmlComponentTopologyUrl + url;
        }

        url = urlUtils.addProtocolIfMissing(url);
        htmlComponentTopologyUrl = urlUtils.addProtocolIfMissing(htmlComponentTopologyUrl);

        if (!isExternal) {
            url = url.replace('//static.wixstatic.com', htmlComponentTopologyUrl);
        }

        return url;
    }

    function hasContent(compData) {
        return !!compData.url;
    }

    function getIframeAttributes() {
        var sandboxAttr = {sandbox: 'allow-same-origin allow-forms allow-popups allow-scripts allow-pointer-lock'};
        var defaultAttrs = {
            width: '100%',
            height: '100%',
            src: hasContent(this.props.compData) ? getIFrameSrc.call(this) : ''
        };

        return shouldAddSandboxAttr.call(this) ? _.assign(defaultAttrs, sandboxAttr) : defaultAttrs;
    }

    function shouldAddSandboxAttr() {
        // return this.props.siteData.rendererModel && this.props.siteData.rendererModel.useSandboxInHTMLComp;
        return this.props.useSandboxInHTMLComp;
    }

    /**
     * @class components.HtmlComponent
     * @extends {core.skinBasedComp}
     */
    return {
        displayName: 'HtmlComponent',
        mixins: [mixins.skinBasedComp],
		propTypes: {
            compData: santaProps.Types.Component.compData,
			serviceTopologyStaticHTMLComponentUrl: santaProps.Types.ServiceTopology.staticHTMLComponentUrl,
			useSandboxInHTMLComp: santaProps.Types.RendererModel.useSandboxInHTMLComp,
            os: santaProps.Types.Browser.os.isRequired
		},
		statics: {
			useSantaTypes: true
		},


        getInitialState: function () {
            return {
                $content: hasContent(this.props.compData) ? 'hasContent' : 'noContent'
            };
        },

        componentWillReceiveProps: function () {
            this.setState({
               $content: hasContent(this.props.compData) ? 'hasContent' : 'noContent'
            });
        },

        getSkinProperties: function () {
            var styles = {};

            // TODO: move this to the skin as a media query http://stephen.io/mediaqueries/
            // see also http://stackoverflow.com/questions/8037973/detect-different-device-platforms-using-css
            // on mobile safari, don't show scrolling
            // if (typeof window !== 'undefined' && window.navigator.userAgent.match(/(iPod|iPhone|iPad)/)) {
            if (this.props.os.ios === true) {
                _.assign(styles, {overflow: 'scroll', '-webkit-overflow-scrolling': 'touch'});
            }

            return {
                '': {
                    style: styles
                },
                'iFrameHolder': {
                    children: [
                        React.DOM.iframe(getIframeAttributes.call(this))
                    ]
                }
            };
        }
    };
});
