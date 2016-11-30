define(['lodash'], function (_) {
    'use strict';

    function isPageCurrentlyRendered(pageRefs, pageId){
        return pageRefs[pageId] && !pageRefs[pageId].isStub();
    }

    function getRenderedPages(pageRefs){
        return _(pageRefs)
            .omit("")
            .pick(function(pageRef){
                return !pageRef.isStub();
            })
            .keys()
            .value();
    }

    function getAllRenderedRootIds() {
        var masterPage = this.getMasterPage();
        //popups are rendered above the master page, so if there is no master page there are no roots
        if (!masterPage) {
            return [];
        }

        var siteData = this.props.siteData;
        var pageRefs = _.get(masterPage, ['refs', 'SITE_PAGES', 'refs']); //no need for fallback, since we always have pageRefs if we have masterpage
        var popupRefs = _.get(this, ['refs', 'popupRoot', 'refs'], {});

        var currentPageId = siteData.getPrimaryPageId();
        var currentPopupId = siteData.getCurrentPopupId();

        // the below if is an optimization so we don't loop over all refs if not necessary
        // however, what if a popup is currently rendered, but 'shouldnt be'? i.e. siteData.getCurrentPopupId() => undefined, but it's still rendered (site didnt update yet) ?
        // this optimization wont be correct in this case... after discussing with Alissa, this probably doesn't matter as you don't really want to do anything with a popup which is closing
        // if it's a problem, we can remove this optimization and think of another way to optimize this if we need to
        if (isPageCurrentlyRendered(pageRefs, currentPageId) &&
            (!currentPopupId || isPageCurrentlyRendered(popupRefs, currentPopupId))) {
            return _.compact(['masterPage', currentPageId, currentPopupId]);
        }

        return _.flatten(['masterPage', getRenderedPages(pageRefs), getRenderedPages(popupRefs)]);
    }

    function getRootIdsWhichShouldBeRendered(){
        var siteData = this.props.siteData;
        //popups are rendered above the master page, so if there is no master page there are no roots
        if (!this.getMasterPage()) {
            var navInfo = siteData.getExistingRootNavigationInfo(siteData.getCurrentUrlPageId());
            var isAllowed = this.siteAPI.getSiteAspect('siteMembers').isPageAllowed(navInfo);
            if (!isAllowed) {
                return [];
            }
        }

        return _.compact([
            'masterPage',
            siteData.getPrimaryPageId(),
            siteData.getCurrentPopupId()
        ]);
    }

    function getComponentsByPageId(rootId) {
        var root = this.getPageById(rootId);
        var comps = root && root.refs;
        return comps || null;
    }

    return {
       getAllRenderedRootIds: getAllRenderedRootIds,
       getRootIdsWhichShouldBeRendered: getRootIdsWhichShouldBeRendered,
       getComponentsByPageId: getComponentsByPageId
   };
});
