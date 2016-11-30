'use strict';

import * as _ from 'lodash';
import {conversionConfig} from 'documentServices/mobileConversion/data/conversionConfig';
import * as conversionUtils from 'documentServices/mobileConversion/modules/conversionUtils';

function tinyMenuLayoutHandler(): MobileOnlyComponentHandler {
    var BACKGROUND_TO_HAMBURGER_COLOR_MAP = {
        'color_11': 'tmFull1',
        'color_27': 'tmFull1',
        'color_32': 'tmFull1',
        'color_15': 'tmFull2',
        'color_18': 'tmFull2',
        'color_25': 'tmFull2'
    };

    return {
        DEFAULT_COMP_DATA: {
            type: 'Component',
            id: 'TINY_MENU',
            componentType: 'wysiwyg.viewer.components.mobile.TinyMenu',
            skin: 'wysiwyg.viewer.skins.mobile.TinyMenuFullScreenSkin',
            layout: _.merge(conversionUtils.getTinyMenuDefaultPosition(), {
                height: conversionConfig.TINY_MENU_SIZE,
                width: conversionConfig.TINY_MENU_SIZE
            }),
            dataQuery: '#MAIN_MENU',
            styleId: 'tmFull1'
        },

        DEFAULT_CONTAINER_ID: 'SITE_HEADER',
        ON_HIDDEN_LIST_WHEN_NOT_EXIST: true,
        ADD_BY_DEFAULT: true,

        getAdditionalStyles: function () {
            return {
                tmFull1: {
                    skin: 'wysiwyg.viewer.skins.mobile.TinyMenuFullScreenSkin',
                    style: {
                        properties: {
                            borderwidth: '0',
                            bg: 'color_11',
                            'alpha-bg': 0,
                            txt: 'color_11',
                            separatorHeight: '0',
                            textAlignment: 'center',
                            txts: 'color_18',
                            iconcolor: 'color_15',
                            iconcolorSelected: 'color_11'
                        }
                    }
                },
                tmFull2: {
                    skin: 'wysiwyg.viewer.skins.mobile.TinyMenuFullScreenSkin',
                    style: {
                        properties: {
                            borderwidth: '0',
                            bg: 'color_11',
                            'alpha-bg': 0,
                            txt: 'color_11',
                            separatorHeight: '0',
                            textAlignment: 'center',
                            txts: 'color_18',
                            iconcolor: 'color_11',
                            iconcolorSelected: 'color_11'
                        }
                    }
                },
                tm2: {
                    skin: 'wysiwyg.viewer.skins.mobile.TinyMenuSkin',
                    style: {
                        properties: {
                            bg: 'color_11',
                            bgh: 'color_13',
                            bgs: 'color_18',
                            txts: 'color_15',
                            txt: 'color_15'
                        }
                    }
                }
            };
        },

        addToStructure: function (structure) {
            var header = <ComponentWithConversionData> conversionUtils.getComponentByIdFromStructure(this.DEFAULT_CONTAINER_ID, structure);
            conversionUtils.addComponentsTo(header, [<Component>_.defaults({styleId: _.get(BACKGROUND_TO_HAMBURGER_COLOR_MAP, _.get(header.conversionData, 'backgroundColor'), 'tmFull1')}, this.DEFAULT_COMP_DATA)]);
            conversionUtils.ensureContainerTightlyWrapsChildren(header, header.components, true);
            return true;
        }
    };
}

export {
    tinyMenuLayoutHandler
}
