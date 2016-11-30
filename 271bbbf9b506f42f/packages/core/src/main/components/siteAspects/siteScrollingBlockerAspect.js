define([
    'core/core/siteAspectsRegistry',
    'lodash',
    'zepto'
], function (siteAspectsRegistry, _, $) {
    "use strict";

    function SiteScrollingBlocker() {
        this._blockersList = [];
    }

    function isSiteScrollingBlocked() {
        return !!_.size(this._blockersList);
    }

    function saveScrollPosition(component){
        component._scrollCorrection = window.scrollY;
    }

    function blockSiteScrolling(component) {
        saveScrollPosition(component);
        $('html')
            .css({marginTop: (-Math.max(0.5, window.scrollY)) + 'px'})
            .addClass('blockSiteScrolling');
    }

    function enterMediaZoomMode(component) {
        saveScrollPosition(component);
        $('html').addClass('media-zoom-mode');
    }

    function restoreScrollPosition(component){
        window.requestAnimationFrame(function(){
            window.scrollTo(0, component._scrollCorrection);
        });
    }

    function unblockSiteScrolling(component) {
        $('html')
            .removeClass('blockSiteScrolling')
            .css({marginTop: ''});

        restoreScrollPosition(component);
    }

    function exitMediaZoomMode(component) {
        $('html').removeClass('media-zoom-mode');
        restoreScrollPosition(component);
    }

    function setSiteScrollingBlocked(blocker, value) {
        var isAlreadyBlocked = _.first(this._blockersList);

        this._blockersList = value ?
            _(this._blockersList).concat(blocker).uniq().value() :
            _.without(this._blockersList, blocker);

        var shouldBeBlocked = _.first(this._blockersList);

        if (isAlreadyBlocked === shouldBeBlocked) {
            return;
        }

        (shouldBeBlocked ? blockSiteScrolling : unblockSiteScrolling).call(null, this);
    }

    SiteScrollingBlocker.prototype.setSiteScrollingBlocked = setSiteScrollingBlocked;
    SiteScrollingBlocker.prototype.isSiteScrollingBlocked = isSiteScrollingBlocked;
    SiteScrollingBlocker.prototype.enterMediaZoomMode = enterMediaZoomMode;
    SiteScrollingBlocker.prototype.exitMediaZoomMode = exitMediaZoomMode;
    siteAspectsRegistry.registerSiteAspect('siteScrollingBlocker', SiteScrollingBlocker);
});
