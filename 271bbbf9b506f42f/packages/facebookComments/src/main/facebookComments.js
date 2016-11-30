define(['lodash', 'core', 'react', 'socialCommon', 'santaProps'], function (_, /** core */core, React, socialCommon, santaProps) {
    'use strict';

    var mixins = core.compMixins;
    var commentsEvents = ['xfbml.render', 'xfbml.resize', 'comment.create', 'comment.remove'];

    /**
     * @class components.WFacebookComment
     * @extends {core.skinBasedComp}
     */
    return {
        displayName: 'WFacebookComment',
        mixins: [mixins.skinBasedComp, mixins.timeoutsMixin, socialCommon.facebookComponentMixin, socialCommon.socialCompMixin],
        scriptDesc: null,

        propTypes: {
            id: santaProps.Types.Component.id.isRequired,
            isMobileView: santaProps.Types.isMobileView.isRequired,
            compData: santaProps.Types.Component.compData.isRequired,
            compProp: santaProps.Types.Component.compProp.isRequired,
            registerReLayoutPending: santaProps.Types.Layout.registerReLayoutPending.isRequired
        },

        statics: {
            useSantaTypes: true
        },

        getInitialState: function () {
            if (typeof window !== 'undefined') { // server side rendering fix
                window.fbAsyncInit = this.subscribeToFacebookEvents; // The Facebook script will call this function when the script will be ready
            }

            return {
                ready: false,
                lastEventTimeStamp: Date.now()
            };
        },
        commentsAreReady: function () {
            this.props.registerReLayoutPending(this.props.id);
            this.setState({
                lastEventTimeStamp: Date.now()
            });
        },
        subscribeToFacebookEvents: function () {
            _.forEach(commentsEvents, function (eventName) {
                window.FB.Event.subscribe(eventName, this.commentsAreReady);
            }, this);
        },
        getHref: function () {
            return this.getSocialUrl();
        },
        componentDidMount: function () {
            if (window.FB) {
                this.subscribeToFacebookEvents();
            }
        },
        componentWillUnmount: function () {
            if (window.FB) {
                _.forEach(commentsEvents, function (eventName) {
                    window.FB.Event.unsubscribe(eventName, this.commentsAreReady);
                }, this);
            }
        },
        getSkinProperties: function () {
            return {
                facebook: {
                    children: React.DOM.div({
                        className: 'fb-comments',
                        'data-href': this.getHref(),
                        'data-width': this.props.isMobileView ? 320 : this.props.compProp.width,
                        'data-numposts': this.props.compProp.numPosts,
                        'data-colorscheme': this.props.compProp.colorScheme,
                        'data-mobile': false
                    })
                }
            };
        }
    };
});
