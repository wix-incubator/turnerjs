define(['documentServices/theme/theme'], function(theme){
    "use strict";

    return {
        initMethod: theme.initialize,
        methods: {
            theme: {
                colors: {
                    update: {dataManipulation: theme.colors.update},
                    get: theme.colors.get,
                    render: theme.colors.render,
                    getAll: theme.colors.getAll,
                    getCustomUsedInSkins: theme.colors.getCustomUsedInSkins,
                    getColorPresets: theme.colors.getColorPresets,
                    getCss: theme.colors.getCssString
                },
                fonts: {
                    update: {dataManipulation: theme.fonts.update},
                    get: theme.fonts.get,
                    getAll: theme.fonts.getAll,
                    getMap: theme.fonts.getMap,
                    getCharacterSet: theme.fonts.getCharacterSet,
                    getLanguageCharacterSet: theme.fonts.getLanguageCharacterSet,
                    getCharacterSetByGeo: theme.fonts.getCharacterSetByGeo,
                    updateCharacterSet: theme.fonts.updateCharacterSet,
                    getThemeStyles: theme.fonts.getThemeStyles
                },
                styles: {
                    createItem: theme.styles.createItem,
                    update: {dataManipulation: theme.styles.update},
                    get: theme.styles.get,
                    getAll: theme.styles.getAll,
                    getAllIds: theme.styles.getAllIds
                },
                skins: {
                    getComponentSkins: theme.skins.getComponentSkins,
                    getSkinDefinition: theme.skins.getSkinDefinition
                },
                getSchema: theme.getSchema,
                events: {
                    onChange: {
                        addListener: theme.events.onChange.addListener,
                        removeListener: theme.events.onChange.removeListener
                    }
                }
            }
        }
    };
});
