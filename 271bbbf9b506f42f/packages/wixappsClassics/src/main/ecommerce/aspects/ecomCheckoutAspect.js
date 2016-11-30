define(['lodash', 'react',
    'utils',
    "wixappsClassics/ecommerce/util/checkoutUrlUtil",
    "wixappsClassics/ecommerce/util/ecomDataUtils",
    "wixappsClassics/ecommerce/data/cartManager"
], function(_, React, /**utils*/ utils, checkoutUrlUtil, ecomDataUtils, cartManager){
    'use strict';

    function getIframeReactComponent(src) {
        var iframe = React.DOM.iframe({
            src: src,
            id: 'checkoutPageIFrame',
            style: {
                width:'900',
                height: '600',
                top: '50%',
                left: '50%',
                'margin-left': '-450',
                'margin-top': '-300',
                position: 'absolute'
            }
        });

        return React.DOM.div({
            style: {
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundColor: 'rgba(0, 0, 0, 0.5)'
            }
        }, iframe);
    }

    function handleEcomFrameMessage(evt) {
        var checkoutOrigin = this.aspectSiteApi.getSiteData().serviceTopology.ecommerceCheckoutUrl;
        if (!_.includes(checkoutOrigin, evt.origin)) {
            return;
        }
        var payload = JSON.parse(evt.data) || {};

        switch (payload.eventType) {
            case 'doSuccessCheckout':
                doSuccessCheckout.call(this);
                break;
            case 'doCancelCheckout':
                closeCheckoutIframe.call(this);
                break;
            case 'goToCustomURL':
                window.location.href = payload.newURL;
                break;
            default:
                utils.log.error("Received unhandled message from ecom iframe: ", evt);
                closeCheckoutIframe.call(this);
                break;
        }
    }

    function closeCheckoutIframe(){
        this.modalOpened = false;
        this.aspectSiteApi.forceUpdate();
    }

    function doSuccessCheckout(){
        cartManager.clearCart(this.envPartApi.getSiteData());
        this.modalOpened = false;
        ecomDataUtils.clearApplicationDataStore(this.envPartApi.getSiteData());
        this.envPartApi.getSiteApi().navigateToPage(this.returnPageData);
        //this.aspectSiteApi.forceUpdate();
    }

    /**
     *
     * @param {core.SiteAspectsSiteAPI} aspectSiteApi
     * @implements {core.SiteAspectInterface}
     * @constructor
     */
    function EcomCheckoutAspect(aspectSiteApi) {
        /** @type core.SiteAspectsSiteAPI */
        this.aspectSiteApi = aspectSiteApi;
        this.aspectSiteApi.registerToMessage(handleEcomFrameMessage.bind(this));
        this.modalOpened = false;
        this.returnPageData = '';
    }

    EcomCheckoutAspect.prototype = {
        showModal: function (partApi, src) {
            this.modalOpened = true;
            this.envPartApi = partApi;
            this.src = src;

            var successURL = checkoutUrlUtil.getSuccessURL(this.envPartApi);
            this.returnPageData = utils.wixUrlParser.parseUrl(this.envPartApi.getSiteData(), successURL);

            //changed state to modal being opened, force re-render
            this.aspectSiteApi.forceUpdate();
        },

        getReactComponents: function () {
            if (this.modalOpened) {
                return getIframeReactComponent(this.src);
            }
            return null;
        }
    };

    return EcomCheckoutAspect;
});
