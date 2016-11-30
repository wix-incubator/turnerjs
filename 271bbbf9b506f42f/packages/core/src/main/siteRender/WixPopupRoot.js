define([
    'lodash',
    'react',
    'reactDOM',
    'santaProps',
    'core/siteRender/WixPageReact',
    'core/siteRender/blockingLayer'
], function(
    _,
    React,
    reactDOM,
    santaProps,
    WixPageReactClass,
    blockingLayerClass
){
    'use strict';

    var wixPageConstructor = React.createFactory(WixPageReactClass);
    var blockingPopupLayerConstructor = React.createFactory(blockingLayerClass);

    function isInViewerOrPreview(siteData) {
        return siteData.renderFlags.componentViewMode === 'preview';
    }

    return React.createClass({
        displayName: 'WixPopupRoot',

        getInitialState: function () {
            return {
                activePopupId: this.props.currentPopupId,
                activePopupKey: 1,
                animating: false
            };
        },

        shouldComponentUpdate: function (nextProps, nextState) {
            if (!nextProps.currentPopupId && this.state.activePopupId && !this.state.animating) {
                var actionsAsepct = this.props.siteAPI.getSiteAspect('actionsAspect');
                var popupCompsId = _.keys(this.refs[this.state.activePopupId].refs);
                this.setState({animating: true});
                actionsAsepct.registerComponentsExit(popupCompsId, function () {
                    if (!nextProps.currentPopupId) {
                        this.setState({activePopupId:null, animating:false});
                    }
                    actionsAsepct.handleNavigationComplete();
                }.bind(this));
                return false;
            } else if (nextState.animating && !nextProps.currentPopupId) {
                return false;
            }
            return true;
        },

        componentWillReceiveProps: function (nextProps) {
            if (nextProps.currentPopupId !== this.state.activePopupId) {
                this.setState({
                    activePopupId: nextProps.currentPopupId,
                    activePopupKey: (this.state.activePopupKey || 0) + 1,
                    animating: false
                });
            }
        },

        componentDidUpdate: function () {
            var popupId = this.state.activePopupId,
                runtimeDAL;

            if (popupId && isInViewerOrPreview(this.props.siteData)) {
                runtimeDAL = this.props.siteAPI.getRuntimeDal();
                runtimeDAL.markPopupAsBeenOpened(popupId);
            }
        },

        render: function(){
            var siteData = this.props.siteData;
            var currentPopupId = this.state.activePopupId;
            var isMobileView = siteData.isMobileView();

            if (currentPopupId){
                var popupProps = santaProps.componentPropsBuilder.getRootProps(this.props.currentPopupId, this.props.siteAPI, this.props.viewerPrivateServices, this.props.loadedStyles, this.props.measureMap);

                popupProps.key = this.state.activePopupKey;

                var popup = [wixPageConstructor(popupProps),
                    this.props.blockingPopupLayer ? blockingPopupLayerConstructor({
                        siteData: siteData
                    }) : null];

                var siteWidth = siteData.getSiteWidth();
                var wrapper = React.DOM.div({
                    id: 'POPUPS_WRAPPER',
                    className: 'POPUPS_WRAPPER',
                    key: 'POPUPS_WRAPPER',
                    style: {
                        minWidth: siteWidth,
                        minHeight: siteData.getScreenHeight(),
                        margin: '0 auto',
                        width: isMobileView ? siteWidth : 'auto'
                    },
                    children: popup
                });

                return React.DOM.div({
                        id: 'POPUPS_ROOT',
                        className: isMobileView ? 'POPUPS_ROOT mobile' : 'POPUPS_ROOT',
                        key: "POPUPS_ROOT",
                        style: {
                            overflow: siteData.renderFlags.allowSiteOverflow ? null : 'hidden'
                        },
                        tabIndex: 0,
                        children: [wrapper]
                    });

            }

            return null;
        },

        componentDidMount: function() {
            var DOMNode = reactDOM.findDOMNode(this);

            if (DOMNode){
                DOMNode.focus();
            }
        }
    });
});
