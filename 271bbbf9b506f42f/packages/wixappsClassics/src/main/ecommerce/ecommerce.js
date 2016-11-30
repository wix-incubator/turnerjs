define([
    'core',
    'wixappsCore',
    'wixappsClassics/ecommerce/proxies/numericStepperProxy',
    'wixappsClassics/ecommerce/proxies/optionsListInputProxy',
    'wixappsClassics/ecommerce/proxies/selectOptionsListProxy',
    'wixappsClassics/ecommerce/proxies/tableProxy',
    'wixappsClassics/ecommerce/aspects/ecomCheckoutAspect',
    'wixappsClassics/ecommerce/aspects/ecomDialogAspect',

    'wixappsClassics/ecommerce/components/ecomCheckoutMessageDialog',
    
    "wixappsClassics/ecommerce/logics/addToCartButtonLogic",
    'wixappsClassics/ecommerce/logics/CheckoutButtonLogic',
    'wixappsClassics/ecommerce/logics/EcomJoinedCartLogic',
    'wixappsClassics/ecommerce/logics/ShoppingCartLogic',
    "wixappsClassics/ecommerce/logics/viewCartLogic",
    'wixappsClassics/ecommerce/logics/productPageLogic',
    'wixappsClassics/ecommerce/logics/feedbackMessageLogic',
    'wixappsClassics/ecommerce/logics/productListLogic'
], function (core, /** wixappsCore */ wixapps, numericStepper, optionsListInput, selectOptionsList, table, ecomCheckoutAspect, ecomDialogAspect, ecomCheckoutMessageDialog) {
    'use strict';

    wixapps.proxyFactory.register("NumericStepper", numericStepper);
    wixapps.proxyFactory.register("OptionsList", optionsListInput);
    wixapps.proxyFactory.register("SelectOptionsList", selectOptionsList);
    wixapps.proxyFactory.register("Table", table);
    core.siteAspectsRegistry.registerSiteAspect("ecomCheckout", ecomCheckoutAspect);
    core.siteAspectsRegistry.registerSiteAspect("ecomDialog", ecomDialogAspect);

    core.compRegistrar.register("ecommerce.viewer.dialogs.EcomCheckoutMessageDialog", ecomCheckoutMessageDialog);

    return {};
});
