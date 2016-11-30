define(['documentServices/fonts/fonts'], function (fonts) {
    "use strict";
    return {
        methods: {
            fonts: {
                css: {
                    getUrls: fonts.css.getCssUrls
                },
                getFontsOptions: {deprecated: true,
                    deprecationMessage: 'old function use getSiteFontsOptions instead',
                    methodDef: fonts.getSiteFontsOptions //backward compatibility for the editor. todo: remove this when editor changes  ga'ed
                },
                getSiteFontsOptions: fonts.getSiteFontsOptions,
                getAllFontsOptions: fonts.getAllFontsOptions
            }
        }
    };
});
