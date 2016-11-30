define(['lodash',
    "wixappsClassics/ecommerce/util/ecomDataUtils",
    "wixappsClassics/ecommerce/util/ecomLogger",
    "wixappsClassics/ecommerce/util/checkoutUrlUtil"
], function (_, ecomDataUtils, ecomLogger, checkoutUrlUtil) {
    'use strict';

    /**
     * In case a user does not have a premium ecom account we need to display a popup saying the store is unavailable.
     * (This is done by adding a MessageView compononet.)
     * @param siteApi
     * @param siteData
     */
    function handleBlockingPopupDialog(partApi) {
        function showDialog(siteMemberDetails) {
            var ecomDialogAspect = partApi.getSiteApi().getSiteAspect('ecomDialog');
            var siteData = partApi.getSiteData();
            var siteApi = partApi.getSiteApi();
            if (siteData.isMobileView()) {
                showCheckoutError(siteApi, 2034);
            } else if (isInTemplatePublicViewer(siteData)) {
                showCheckoutError(siteApi, 2035);
            } else if (siteMemberDetails && siteMemberDetails.owner) {
                ecomDialogAspect.showCheckoutDialogForOwner(partApi, handleCheckout);
            } else {
                showCheckoutError(siteApi, 2034);
            }
        }

        var siteMembersAspect = partApi.getSiteApi().getSiteAspect('siteMembers');
        siteMembersAspect.getMemberDetails(showDialog);
    }

    function showCheckoutError(siteApi, errorCode) {

        var ecomDialogAspect = siteApi.getSiteAspect('ecomDialog');
        var params = {
            code: errorCode
        };
        ecomDialogAspect.showMessage(params);
    }

    function reportCheckoutBi(partApi, checkoutTarget) {
        var checkoutSource = checkoutTarget === "_blank" ? 'from popup' : 'from same page';
        ecomLogger.reportEvent(partApi.getSiteData(), ecomLogger.events.USER_PROCEEDED_TO_CHECKOUT, {
            cartId: ecomDataUtils.getApplicationDataStore(partApi.getSiteData()).items.cart.id,
            checkoutSource: checkoutSource
        });
    }

    function openInIframe(partApi, checkoutUrl) {
        var ecomCheckoutAspect = partApi.getSiteApi().getSiteAspect("ecomCheckout");
        ecomCheckoutAspect.showModal(partApi, checkoutUrl);
    }

    function getCheckoutTarget(partApi) {
        var siteData = partApi.getSiteData();
        var appLogicParams = partApi.getPartData().appLogicParams;
        if (siteData.isMobileView() || siteData.isMobileDevice()) {
            return "_blank";
        }
        if (appLogicParams.checkoutTarget) {
            return appLogicParams.checkoutTarget.value;
        }
        return "_self";
    }

    function getCheckoutURL(partApi) {
        if (shouldOpenCheckoutInWixScreen(partApi)) {
            return checkoutUrlUtil.getInternalHandledCheckoutUrl(partApi);
        }
        return checkoutUrlUtil.getExternalHandledCheckoutUtl(partApi);
    }

    /**
     * If the user chose "open in new window" with a local handled checkout, we open an iframe for checkout
     * @param partApi
     * @param checkoutTarget
     * @returns {boolean}
     */
    function shouldOpenInIframe(partApi, checkoutTarget) {
        var sameWindow = checkoutTarget === "_self";
        return shouldOpenCheckoutInWixScreen(partApi) && !sameWindow;

    }

    function shouldOpenCheckoutInWixScreen(partApi) {
        var siteData = partApi.getSiteData();
        var cart = ecomDataUtils.getApplicationDataStore(siteData).items.cart;
        return cart.hasExternalCheckoutUrl === true;
    }

    function handleCheckout(partApi) {
        var checkoutUrl = getCheckoutURL(partApi);
        var checkoutTarget = getCheckoutTarget(partApi);
        var siteData = partApi.getSiteData();
        reportCheckoutBi(partApi, checkoutTarget);
        var isMobile = siteData.isMobileView() || siteData.isMobileDevice();
        if (!isMobile && shouldOpenInIframe(partApi, checkoutTarget)) {
            openInIframe(partApi, checkoutUrl);
        } else {
            window.open(checkoutUrl, checkoutTarget);
        }
    }

    function handleCheckoutClicked(partApi) {
        var ownerHasEcom = _.includes(partApi.getSiteData().getPremiumFeatures(), 'HasECommerce');
        var cart = ecomDataUtils.getApplicationDataStore(partApi.getSiteData()).items.cart;
        if (ownerHasEcom) {
            if (cart.items.length) {
                handleCheckout(partApi);
            }
        } else {
            handleBlockingPopupDialog(partApi);
        }
    }

    function isInTemplatePublicViewer(siteData) {
        return _.get(siteData, 'rendererModel.siteInfo.documentType') === 'Template';
    }

    return {
        handleCheckout: handleCheckoutClicked
    };
});
