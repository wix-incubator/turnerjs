define(["wixappsClassics/ecommerce/proxies/mixins/optionsProxy"], function (optionsProxy) {
    'use strict';

    /**
     * @class proxies.OptionsListInput
     * @extends proxies.mixins.optionProxy
     */
    return {
        mixins: [optionsProxy],
        useSkinInsteadOfStyles: true,
        getSkinName: function () {
            return 'wixapps.integration.skins.ecommerce.options.OptionsListInputSkin';
        },
        getComponentName: function () {
            return 'wysiwyg.common.components.inputs.OptionsListInput';
        }
    };
});
