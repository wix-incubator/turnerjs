/**@class wysiwyg.common.utils.ScrollAnimation*/
define.Class('wysiwyg.common.utils.SiteMemberLanguages', function (classDefinition) {
    /**@type bootstrap.managers.classmanager.ClassDefinition*/
    var def = classDefinition;

    def.statics({
        supportedLanguages: [ "en", "es", "de", "fr", "it", "ja", "ko", "pl", "pt", "ru", "tr", "nl", "sv", "no", "da"]
    });

    def.methods({
        _getLanguages: function (panel) {
            var languageKeysPrefix = "SITEMEMBERLANGS__";
            var langsArr = this.supportedLanguages.slice();

//            if(W.Experiments.isExperimentOpen('lang_sv')){
//                langsArr.push("sv");
//            }
//
//            if(W.Experiments.isExperimentOpen('lang_no')){
//                langsArr.push("no");
//            }
//
//            if(W.Experiments.isExperimentOpen('lang_da')){
//                langsArr.push("da");
//            }

            var languagesData = langsArr.map(function (langCode) {
                return {
                    label: panel._translate(languageKeysPrefix + langCode),
                    value: langCode
                };
            });
            return languagesData;
        }
    });
});

