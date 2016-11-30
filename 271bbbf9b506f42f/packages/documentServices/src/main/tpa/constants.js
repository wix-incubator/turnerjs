define([], function () {
    'use strict';

    return {
        TYPE: {
            TPA_SECTION: 'TPASection',
            TPA_MULTI_SECTION: 'TPAMultiSection',
            TPA_WIDGET: 'TPAWidget',
            TPA_GLUED_WIDGET: 'TPAGluedWidget'
        },
        DATA_TYPE: {
            TPA_SECTION: 'TPA',
            TPA_MULTI_SECTION: 'TPAMultiSection',
            TPA_WIDGET: "TPAWidget"
        },
        COMP_TYPES: {
            TPA_SECTION: 'wysiwyg.viewer.components.tpapps.TPASection',
            TPA_MULTI_SECTION: 'wysiwyg.viewer.components.tpapps.TPAMultiSection',
            TPA_WIDGET: 'wysiwyg.viewer.components.tpapps.TPAWidget',
            TPA_GLUED_WIDGET: 'wysiwyg.viewer.components.tpapps.TPAGluedWidget'
        },
        TPA_COMP_TYPES: {
            TPA_SECTION: 'tpa.viewer.components.tpapps.TPASection',
            TPA_MULTI_SECTION: 'tpa.viewer.components.tpapps.TPAMultiSection',
            TPA_WIDGET: 'tpa.viewer.components.tpapps.TPAWidget',
            TPA_GLUED_WIDGET: 'tpa.viewer.components.tpapps.TPAGluedWidget'
        },
        SKINS: {
            TPA_SECTION: 'wysiwyg.viewer.skins.TPASectionSkin',
            TPA_WIDGET: 'wysiwyg.viewer.skins.TPAWidgetSkin'
        },
        APP_MARKET: {
            //TODO - get API from topologi
            EDITOR_BASE_URL: 'http://editor.wix.com/app-market-editor', //TODO TPA-DEPENDENCY-NOT-READY Get editor base URL from topology
            DOMAIN: 'http://editor.wix.com/'
        },
        STYLE: {
            TPA_WIDGET: 'tpaw0',
            TPA_GLUED_WIDGET: 'tpagw0',
            TPA_SECTION: 'tpas0'
        },
        CYCLE: {
            MONTHLY: 'monthly',
            YEARLY: 'yearly',
            ONE_TIME: 'oneTime'
        }
    };
});
