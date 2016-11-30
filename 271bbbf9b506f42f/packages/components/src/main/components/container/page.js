define(['lodash', 'balataCommon', 'containerCommon'], function (_, balataCommon, containerCommon) {
    'use strict';

    var containerMixin = containerCommon.mixins.containerMixin;

    function isMobileView(popup) {
        return popup.props.siteData.isMobileView();
    }

    function getViewModeProperty(popup) {
        return isMobileView(popup) ? 'mobile' : 'desktop';
    }

    function getPopupProps(popup) {
        return popup.props.compProp[getViewModeProperty(popup)].popup;
    }

    function getPopupBackground(popup) {
        return _.get(popup.props.compData, ['pageBackgrounds', getViewModeProperty(popup), 'ref']);
    }

    function closePopupOnOverlayClick() {
        this.props.siteAPI.closePopupPage();
    }

    function createBalata(popup, background, shouldCloseOnClick) {
        var extraProperties = {
            onClick: shouldCloseOnClick ? closePopupOnOverlayClick : _.noop,
            style: {
                position: 'fixed',
                pointerEvents: 'auto'
            },
            compDesign: {background: background}
        };

        return balataCommon.mubalat.createChildBalata(
            popup,
            extraProperties
        );
    }

    function createOverlay(popup) {
        var popupProps = getPopupProps(popup);
        return createBalata(popup, getPopupBackground(popup), popupProps.closeOnOverlayClick);
    }

    return {
        displayName: "WixPage",
        mixins: [containerMixin],
        getSkinProperties: function () {
            var skinProps = {
                "inlineContent": {
                    children: this.props.children
                }
            };

            if (this.props.compData.isPopup) {
                skinProps[""] = {
                    style: {
                        position: 'relative'
                    }
                };
                skinProps.bg = createOverlay(this);
                //In popup inlineContent appears above overlay. Overlay may be clicked, to make possible pointerEvents are none
                skinProps.inlineContent.style = {'pointerEvents': 'none'};
            }

            return skinProps;
        },

        componentDidMount: function() {
            if (this.props.compData.isPopup && isMobileView(this)){
                // block site scrolling
                this.props.siteAPI.getSiteAspect('siteScrollingBlocker').setSiteScrollingBlocked(this, true);
            }
        },

        componentWillUnmount: function () {
            if (this.props.compData.isPopup && isMobileView(this)) {
                // enable site scrolling
                this.props.siteAPI.getSiteAspect('siteScrollingBlocker').setSiteScrollingBlocked(this, false);
            }
        }
    };
});
