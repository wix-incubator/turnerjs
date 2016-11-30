define(['lodash', 'documentServices/siteAccessLayer/DocumentServicesSiteAPINoSite'], function(_, DocumentServicesSiteAPINoSite){

    "use strict";

    function DocumentServicesSiteAPIForTests(siteData, siteDataAPI) {
        DocumentServicesSiteAPINoSite.call(this, siteData, siteDataAPI);
    }

    DocumentServicesSiteAPIForTests.prototype = new DocumentServicesSiteAPINoSite({});

    DocumentServicesSiteAPIForTests.prototype.reportBI = _.noop;

    DocumentServicesSiteAPIForTests.prototype.getSiteAspect = _.noop;

    return DocumentServicesSiteAPIForTests;
});
