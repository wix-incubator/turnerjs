define(['lodash', 'documentServices/siteAccessLayer/DSSiteAPIBase', 'utils'], function(_, DSSiteAPIBase, utils){
    "use strict";

    var data = {};

    function DocumentServicesSiteAPINoSite(_siteData, siteDataAPI, isSiteDataInitialized) {
        var siteData = _siteData;
        if (!isSiteDataInitialized){
            siteData = _.merge(new utils.SiteData(), _siteData);
        }

        DSSiteAPIBase.call(this, siteData, siteDataAPI);

        this._siteId = siteData.siteId;
        data[this._siteId] = siteData;

        this.createDisplayedPage = function(pageId) {
            siteDataAPI.createDisplayedPage(pageId);
        };

        this.createDisplayedNode = function(pointer) {
            siteDataAPI.createDisplayedNode(pointer);
        };

        //this is used only in tests - move to test utils!!
        this.activateModeById = function(compId, pageId, modeId) {
            siteDataAPI.activateModeById(compId, pageId, modeId);
        };

        //this is used only in tests - move to test utils!!
        this.deactivateModeById = function(compId, pageId, modeId) {
            siteDataAPI.deactivateModeById(compId, pageId, modeId);
        };
    }

    function getPossiblyRenderedRoots(){
        var siteData = data[this._siteId];
        return siteData.getAllPossiblyRenderedRoots();
    }

    DocumentServicesSiteAPINoSite.prototype = _.create(DSSiteAPIBase.prototype, {
        'constructor': DocumentServicesSiteAPINoSite,

        hasPendingFonts: function () {
            return false;
        },

        isComponentRenderedOnSite: function(){
            return true;
        },

        navigateToPage: _.noop,

        getAllRenderedRootIds: getPossiblyRenderedRoots,

        getRootIdsWhichShouldBeRendered: getPossiblyRenderedRoots

    });

    return DocumentServicesSiteAPINoSite;
});
