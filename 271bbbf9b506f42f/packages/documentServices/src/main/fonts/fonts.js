define(['fonts',
    'documentServices/theme/theme',
    'documentServices/siteMetadata/generalInfo'
], function (fonts, theme, generalInfo) {
    "use strict";

    /**
     * @param ps
     * @returns ['googleApiUrl', 'languageStaticsUrl', 'helveticaStaticsUrl']
     */
    function getCssUrls(ps) {

        var documentType = generalInfo.getDocumentType(ps);
        var serviceTopology = ps.dal.get(ps.pointers.general.getServiceTopology());

        return fonts.fontUtils.getCssUrls(documentType, serviceTopology);

    }

    /**
     * @param ps
     * @returns [{lang: 'latin', fonts:[{fontMetaData}]}]
     */
    function getSiteFontsOptions(ps) {
        var documentType = generalInfo.getDocumentType(ps);
        var characterSets = theme.fonts.getCharacterSet(ps);
        return fonts.fontUtils.getCurrentSelectablefontsWithParams(documentType, characterSets);
    }

    function getAllFontsOptions(ps){
        var POSSIBLE_CHARACTERS_SETS = ['latin-ext', 'cyrillic', 'japanese', 'korean', 'arabic', 'hebrew', 'latin'];
        var documentType = generalInfo.getDocumentType(ps);
        return fonts.fontUtils.getCurrentSelectablefontsWithParams(documentType, POSSIBLE_CHARACTERS_SETS);
    }

    return {
        css: {
            getCssUrls: getCssUrls
        },
        getSiteFontsOptions: getSiteFontsOptions,
        getAllFontsOptions: getAllFontsOptions
    };
});
