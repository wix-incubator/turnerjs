/**
 * this code reduces the document domain sandbox to the minimal domain name.
 * example:
 * www.site.com > site.com
 * sub1.sub2.site.co.il > site.co.il
 */
(function(){
    var mode = window.editorModel && window.editorModel.mode || window.rendererModel && window.rendererModel.debugMode;
    if (mode != 'unit_test') {
        var topLevelDomains = {"com":true, "org":true, "net":true, "edu":true, "gov":true, "mil":true, "info":true, "co":true, "ac":true};
        var subDomain = document.domain.split('.');
        if (subDomain.length > 2) {
            var beforeLastPart = subDomain[subDomain.length - 2];
            if (topLevelDomains[beforeLastPart]) {
                subDomain = subDomain[subDomain.length - 3] + '.' + subDomain[subDomain.length - 2] + '.' + subDomain[subDomain.length - 1];
            }
            else {
                subDomain = subDomain[subDomain.length - 2] + '.' + subDomain[subDomain.length - 1];
            }
        }

        try {
            document.domain = subDomain;
        } catch(e) {
        }
    }
})();