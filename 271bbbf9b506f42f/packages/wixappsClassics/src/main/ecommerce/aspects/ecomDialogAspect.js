define(['siteUtils', 'lodash', "utils", 'santaProps', 'wixappsCore', 'wixappsClassics/ecommerce/util/ecomLogger'],
    function (siteUtils, _, /** utils */utils, santaProps, /** wixappsCore */wixapps, /** wixappsCore.ecomLogger */ecomLogger) {
        "use strict";

        var localizer = wixapps.localizer;

        var componentPropsBuilder = santaProps.componentPropsBuilder;
        var compFactory = siteUtils.compFactory;

        var USER_CLOSED_ONLOAD_DIALOG = false;
        var PACKAGE_NAME = 'ecommerce';

        function addComponent(structure, props) {
            this._componentToRender = {
                structure: structure,
                props: props
            };
        }

        function deleteComponent() {
            this._componentToRender = null;
            this._aspectSiteAPI.forceUpdate();
        }

        var errorCodeMessageMap = {
            //ECOM PRELOADED ERRORS
            1000: {
                'title': '@ECOM_SHOPPING_CART_INSUFFICIENT_STOCK_ERR_TITLE@',
                'description': '@ECOM_SHOPPING_CART_INSUFFICIENT_STOCK_ERR_DESC@'
            },
            1007: {
                'title': '@ECOM_SHOPPING_CART_UNAVAILABLE_PRODUCT_ERR_TITLE@',
                'description': '@ECOM_SHOPPING_CART_UNAVAILABLE_PRODUCT_ERR_DESC@'
            },
            1127: {
                'title': "@ECOM_OH_OH_ERR_TITLE@",
                'description': '@ECOM_CHECKOUT_BLOCKED_FOR_NON_PREMIUM_USER_ERR_DESC@'
            },

            // get product by Id (for product page) error.
            2020: {
                title: "@ECOM_SOMETHING_WENT_WRONG_ERR_TITLE@",
                description: "@ECOM_MAGENTO_REQUEST_FAILED_ERR_DESC@"
            },
            // get category products error
            2021: {
                title: "@ECOM_SOMETHING_WENT_WRONG_ERR_TITLE@",
                description: "@ECOM_MAGENTO_REQUEST_FAILED_ERR_DESC@"
            },
            //CUSTOM ERRORS
            2024: {
                title: "@ECOM_SOMETHING_WENT_WRONG_ERR_TITLE@",
                description: "@ECOM_MAGENTO_REQUEST_FAILED_ERR_DESC@"
            },
            2026: {
                title: "@ECOM_OOPS_ERR_TITLE@",
                description: "@ECOM_CHECKOUT_BLOCKED_FOR_NON_PREMIUM_USER_ERR_DESC@"
            },
            2027: {
                title: "@ECOM_OOPS_ERR_TITLE@",
                description: "@ECOM_CHECKOUT_BLOCKED_FOR_NON_PREMIUM_USER_ERR_DESC@"
            },
            2028: {
                title: "@ECOM_OOPS_ERR_TITLE@",
                description: "@ECOM_CHECKOUT_BLOCKED_FOR_NON_PREMIUM_USER_ERR_DESC@"
            },

            // Shipping Errors
            2032: {
                title: "@ECOM_OOPS_ERR_TITLE@",
                description: "@ECOM_CHECKOUT_BLOCKED_FOR_NON_PREMIUM_USER_ERR_DESC@"
            },
            2033: {
                title: "@ECOM_OOPS_ERR_TITLE@",
                description: "@ECOM_CHECKOUT_BLOCKED_FOR_NON_PREMIUM_USER_ERR_DESC@"
            },
            2034:{
                title: "@ECOM_OOPS_ERR_TITLE@",
                description: "@ECOM_CHECKOUT_BLOCKED_FOR_NON_PREMIUM_USER_FRIENDLY_MSG@"
            },
            2035:{
                title: "@ECOM_OH_OH_ERR_TITLE@",
                description: "@ECOM_CHECKOUT_BLOCKED_IN_TEMPLATE_VIEWER_ERR_DESC@"
            }
        };

        function createMessageCompFromParams(params){
            var title = params.code ? errorCodeMessageMap[params.code].title : params.title;
            var description = params.code ? errorCodeMessageMap[params.code].description : params.description;

            var compId = "batata";
            var siteData = this._aspectSiteAPI.getSiteData();
            var skin = siteData.isMobileView() ? "wysiwyg.viewer.skins.MobileMessageViewSkin" : "wysiwyg.viewer.skins.MessageViewSkin";
            var structure = {
                id: compId,
                componentType: "wysiwyg.viewer.components.MessageView",
                skin: skin,
                type: "Component"
            };

            var localizationBundle = localizer.getLocalizationBundleForPackage(this._aspectSiteAPI.getSiteAspect("wixappsDataAspect"), PACKAGE_NAME, siteData);
            var props = {
                compProp: {
                    title: localizer.localize(title, localizationBundle),
                    description: createMessageTextForUser(localizer.localize(description, localizationBundle), params.code || ''),
                    onCloseCallback: function () {
                        var queryParams = utils.urlUtils.parseUrlParams(window.location);
                        if (!USER_CLOSED_ONLOAD_DIALOG && queryParams && !_.isEmpty(queryParams.f_checkoutErrorId)){
                            USER_CLOSED_ONLOAD_DIALOG = true;
                        }
                        deleteComponent.call(this);
                    }.bind(this)
                }
            };

            addComponent.call(this, structure, props);
        }

        function createMessageTextForUser(baseMessage, error){
            if (baseMessage.indexOf('WOS') === baseMessage.length - 3) {
                return baseMessage + error;
            }

            var styledErr = '<span style="color: #909090; font-size: 11px">(WOS ' + error + ')</span>';
            return baseMessage + " " + styledErr;
        }

        /**
         *
         * @param {core.SiteAspectsSiteAPI} aspectSiteAPI
         * @implements {core.SiteAspectInterface}
         * @constructor
         */
        function EcomDialogAspect(aspectSiteAPI) {
            /** @type core.SiteAspectsSiteAPI */
            this._aspectSiteAPI = aspectSiteAPI;
            this._componentToRender = null;
        }

        function handleUpgrade(partApi) {
            var siteData = partApi.getSiteData();
            ecomLogger.reportEvent(siteData, ecomLogger.events.CHECKOUT_MESSAGE_UPGRADE_BUTTON_CLICK);

            // TODO: handle unsaved sites (i.e. ecom templates in the preview)
            var baseUrl = siteData.serviceTopology.premiumServerUrl || siteData.serviceTopology.billingServerUrl;
            var urlObj = utils.urlUtils.parseUrl(baseUrl + '/wix/api/premiumStart');
            urlObj.query = {
                referralAdditionalInfo: 'html_ECOM_CHECKOUT',
                siteGuid: siteData.getMetaSiteId()
            };

            var url = utils.urlUtils.buildFullUrl(urlObj);
            window.open(url, "_blank");

            deleteComponent.call(this);
        }

        EcomDialogAspect.prototype = {

            showMessage: function(params){
                createMessageCompFromParams.call(this, params);
                this._aspectSiteAPI.forceUpdate();
            },

            showCheckoutDialogForOwner: function(partApi, cb){
                var compId = "batata";
                var skin = "ecommerce.skins.viewer.dialogs.EcomCheckoutMessageDialogSkin";
                var structure = {
                    id: compId,
                    componentType: "ecommerce.viewer.dialogs.EcomCheckoutMessageDialog",
                    skin: skin,
                    type: "Component"
                };

                var siteData = this._aspectSiteAPI.getSiteData();
                var localizationBundle = localizer.getLocalizationBundleForPackage(this._aspectSiteAPI.getSiteAspect("wixappsDataAspect"), PACKAGE_NAME, siteData);
                var props = {
                    compProp: {
                        title: localizer.localize("@ECOM_CHECKOUT_MESSAGE_TITLE@", localizationBundle),
                        subtitle: localizer.localize("@ECOM_CHECKOUT_MESSAGE_SUB_TITLE@", localizationBundle),
                        description: localizer.localize("@ECOM_CHECKOUT_MESSAGE_DESCRIPTION@", localizationBundle),
                        tryButton: localizer.localize("@ECOM_CHECKOUT_MESSAGE_TRY_IT_OUT_BUTTON_TEXT@", localizationBundle),
                        upgradeButton: localizer.localize("@ECOM_CHECKOUT_MESSAGE_UPGRADE_BUTTON_TEXT@", localizationBundle),
                        onTryCallback: function () {
                            cb(partApi);
                            deleteComponent.call(this);
                        }.bind(this),
                        onUpgradeCallback: handleUpgrade.bind(this, partApi),
                        onCloseCallback: function () {
                            deleteComponent.call(this);
                        }.bind(this)
                    }
                };

                addComponent.call(this, structure, props);
                this._aspectSiteAPI.forceUpdate();
            },

            getComponentStructures: function () {
                if (this._componentToRender){
                    return this._componentToRender.structure;
                }
                return {};
            },

            /**
             *
             * @param loadedStyles
             */
            getReactComponents: function (loadedStyles) {
                var siteData = this._aspectSiteAPI.getSiteData();
                var queryParams = siteData.currentUrl.query;
                if (!USER_CLOSED_ONLOAD_DIALOG && queryParams && !_.isEmpty(queryParams.f_checkoutErrorId)){
                    var params = {
                        code: _.isArray(queryParams.f_checkoutErrorId) ? queryParams.f_checkoutErrorId[0] : queryParams.f_checkoutErrorId
                    };
                    createMessageCompFromParams.call(this, params);
                }

                if (this._componentToRender) {
                    var props = componentPropsBuilder.getCompProps(this._componentToRender.structure, this._aspectSiteAPI.getSiteAPI(), null, loadedStyles);
                    _.assign(props, this._componentToRender.props);
                    var compConstructor = compFactory.getCompClass(this._componentToRender.structure.componentType);
                    return compConstructor(props);
                }
                return null;
            }
        };

        return EcomDialogAspect;
    });
