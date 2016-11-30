define(['lodash', 'zepto', 'utils', 'core/bi/events.json'], function(_, $, utils, biEvents){
    'use strict';

    function cancelEvent(event) {
        event.stopPropagation();
        event.preventDefault();
        return false;
    }

    function moveToMobileIfNeeded(link, siteAPI){
        if (link.attr('data-mobile')) {
            var isMobile = utils.stringUtils.isTrue(link.attr('data-mobile'));
            siteAPI.setMobileView(isMobile);
            utils.mobileViewportFixer.fixViewportTag(siteAPI.getSiteData());
        }
    }

    function handleExternalNavigationSomeCases(event, link, linkUrl){
        var siteData = this.props.siteData;

        var isExternalLink = utils.linkRenderer.isExternalLink(siteData, linkUrl);
        var isEmailLink = utils.linkRenderer.isEmailLink(linkUrl);
        var isOnCurrentTab = link.attr('target') === '_self';
        var previewTooltipCallback = siteData.renderRealtimeConfig.previewTooltipCallback;

        var shouldBlockLinkNavigation = !siteData.renderFlags.isExternalNavigationAllowed && previewTooltipCallback &&
            (isExternalLink && isOnCurrentTab || isEmailLink);
        if (shouldBlockLinkNavigation) {
            var targetClientRect = event.target.getBoundingClientRect();
            previewTooltipCallback(targetClientRect, 'text_editor_inactive_link_on_preview');
            return true;
        }

        return false;
    }

    function getNavInfo(link, linkUrl, siteData){
        var noUrlChangeAttr = link.attr('data-no-physical-url');
        var url = noUrlChangeAttr || linkUrl;
        return utils.wixUrlParser.parseUrl(siteData, url);
    }

    function isChangingUrl(link){
        return !link.attr('data-no-physical-url');
    }

    function isKeepingNavigationRoots(link){
        return !!link.attr('data-keep-roots');
    }

    function assignAdditionalDataToNavInfo(navInfo, link){
        _.assign(navInfo, {
            pageItemAdditionalData: link.attr('data-page-item-context'),
            anchorData: link.attr('data-anchor')
        });
    }

    function handleSiteInternalNavigation(link, linkUrl){
        var siteData = this.props.siteData;
        var navInfo = getNavInfo(link, linkUrl, siteData);

        if (!navInfo || link.attr('target') === '_blank') {
            return false;
        }

        assignAdditionalDataToNavInfo(navInfo, link);

        var changeUrl = isChangingUrl(link);
        var keepRoots = isKeepingNavigationRoots(link);

        this.handleNavigation(navInfo, linkUrl, changeUrl, keepRoots);

        return true;
    }

    function logLinkBI(siteAPI, link) {
        if (!link.attr('data-type')) {
            return;
        }

        siteAPI.reportBI(biEvents.CLICK_TO_ACTION, {
            "field_type": link.attr('data-type'),
            "data": link.attr('data-content'),
            "input_type": link.attr('data-auto-recognition') ? 'auto_recognized' : 'user_input'
        });
    }

    function clickHandler(event) {
        var link = event.target.tagName.toLowerCase() === 'a' ? $(event.target) : $(event.target).parents("a");
        var linkUrl = link.attr('href');

        logLinkBI(this.siteAPI, link);
        moveToMobileIfNeeded(link, this.siteAPI);

        var isEventCancelled = handleExternalNavigationSomeCases.call(this, event, link, linkUrl);

        if (!isEventCancelled){
            isEventCancelled = handleSiteInternalNavigation.call(this, link, linkUrl);
        }
        if (this.siteAPI.isSelectionSharerVisible()) {
            this.siteAPI.hideSelectionSharer();
        }
        return isEventCancelled ? cancelEvent(event) : true;
    }

    return {
        clickHandler: clickHandler
    };
});
