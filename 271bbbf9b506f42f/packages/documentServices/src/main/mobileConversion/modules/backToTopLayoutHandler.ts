'use strict';

import * as conversionUtils from 'documentServices/mobileConversion/modules/conversionUtils';

function backToTopLayoutHandler(): MobileOnlyComponentHandler {
    return {
        DEFAULT_COMP_DATA: {
            type: 'Component',
            id: 'BACK_TO_TOP_BUTTON',
            componentType: 'wysiwyg.common.components.backtotopbutton.viewer.BackToTopButton',
            skin: 'wysiwyg.viewer.skins.backtotopbutton.BackToTopButtonSkin',
            layout: {
                height: 0,
                width: 0,
                x: 0,
                y: 0
            },
            dataQuery: null,
            styleId: ''
        },

        DEFAULT_CONTAINER_ID: 'masterPage',
        ON_HIDDEN_LIST_WHEN_NOT_EXIST: false,
        ADD_BY_DEFAULT: false,

        getAdditionalStyles: function () {
            return {};
        },

        addToStructure: function (structure: Component | MasterPageComponent) {
            conversionUtils.addComponentsTo(structure, [this.DEFAULT_COMP_DATA]);
        }
    };
}

export {
    backToTopLayoutHandler
}