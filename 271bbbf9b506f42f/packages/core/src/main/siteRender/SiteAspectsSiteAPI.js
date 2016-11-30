define(['lodash', 'core/siteRender/SiteAPI'], function (_, SiteAPI) {
    'use strict';

    /**
     * @typedef {SiteAspectsSiteAPI} core.SiteAspectsSiteAPI
     */

    /**
     * @constructor
     * @extends {core.SiteAPI}
     * @param site
     */
    function SiteAspectsSiteAPI(site) {
        SiteAPI.call(this, site, "Site Aspect");
    }

    //not sure if object create works on all browsers..
    SiteAspectsSiteAPI.prototype = _.create(SiteAPI.prototype, {
        'constructor': SiteAspectsSiteAPI
    });

    /**
     * @param {string} id
     * @returns {ReactCompositeComponent}
     * @param rootId
     */
    SiteAspectsSiteAPI.prototype.getComponentById = function (id, rootId) {
        var comp = null;
        var compRootId = rootId || this.getRootOfComponentId(id);

        if (compRootId){
            comp = this.getComponentsByPageId(compRootId)[id];
        }

        if (!comp){
            comp = this._site.getAspectsContainer().refs[id];
        }

        if (!comp && (id === 'SITE_BACKGROUND' || id === 'WIX_ADS')) {
            comp = this._site.refs[id];
        }

        return comp || null;

    };

    /**
     *
     * @param {string} id
     * @returns {string|null} returns the id of the pagesData root the the component belongs to (masterPage/primaryPage/popup)
     * if the component isn't rendered ot doesn't exist will return null
     */
    SiteAspectsSiteAPI.prototype.getRootOfComponentId = function(id){
        var root = this._site.getPageOfComp(id);
        var rootId = root && root.props.rootId;

        //not sure that we should check on other current non visible pages...
        var masterPage = this._site.getMasterPage();
        if (!rootId && masterPage && masterPage.refs.SITE_PAGES) {
            _.forEach(masterPage.refs.SITE_PAGES.refs, function (page, refName) {
                if (page.refs && page.refs[id]) {
                    rootId = refName;
                    return false;
                }
            });
        }
        return rootId || null;
    };

    /**
     * @deprecated
     * @returns {ReactCompositeComponent}
     */
    SiteAspectsSiteAPI.prototype.getCurrentPage = function () {
        return this._site.getPrimaryPage();
    };

    SiteAspectsSiteAPI.prototype.getCurrentPopup = function(){
        return this._site.getCurrentPopup();
    };

    SiteAspectsSiteAPI.prototype.getAllRenderedRoots = function () {
        return _.map(this.getAllRenderedRootIds, this.getPageById, this);
    };

    /**
     *
     * @returns {ReactCompositeComponent}
     */
    SiteAspectsSiteAPI.prototype.getMasterPage = function () {
        return this._site.getMasterPage();
    };

    SiteAspectsSiteAPI.prototype.getPageById = function (pageId) {
        return this._site.getPageById(pageId);
    };

    /**
     *
     * @param {function(Event)} callback
     */
    SiteAspectsSiteAPI.prototype.registerToMessage = function (callback) {

        this._site.registerAspectToEvent(this._site.supportedEvents.message, callback);
    };

    /**
     *
     * @param {function(Event)} callback
     */
    SiteAspectsSiteAPI.prototype.registerToSiteReady = function (callback) {

        this._site.registerAspectToEvent(this._site.supportedEvents.siteReady, callback);
    };

    /**
     *
     * @param {function(Event)} callback
     */
    SiteAspectsSiteAPI.prototype.registerToScroll = function (callback) {

        this._site.registerAspectToEvent(this._site.supportedEvents.scroll, callback);
    };

    /**
     *
     * @param {function(Event)} callback
     */
    SiteAspectsSiteAPI.prototype.registerToResize = function (callback) {

        this._site.registerAspectToEvent(this._site.supportedEvents.resize, callback);
    };

    /**
     *
     * @param {function(Event)} callback
     */
    SiteAspectsSiteAPI.prototype.registerToOrientationChange = function (callback) {
        this._site.registerAspectToEvent(this._site.supportedEvents.orientationchange, callback);
    };

    /**
     *
     * @param {function(Event)} callback
     */
    SiteAspectsSiteAPI.prototype.registerToModeChange = function (callback) {

        this._site.registerAspectToEvent(this._site.supportedEvents.modeChange, callback);
    };

    /**
     *
     * @param {function(Event)} callback
     */
    SiteAspectsSiteAPI.prototype.registerToSlideChange = function (callback) {

        this._site.registerAspectToEvent(this._site.supportedEvents.slideChange, callback);
    };

    /**
     *
     * @param {function()} callback
     */
    SiteAspectsSiteAPI.prototype.registerToComponentDidMount = function (callback) {

        this._site.registerAspectToEvent(this._site.supportedEvents.mount, callback);
    };

    SiteAspectsSiteAPI.prototype.registerToSiteWillMount = function (callback) {
        this._site.registerAspectToEvent(this._site.supportedEvents.willMount, callback);
    };

    SiteAspectsSiteAPI.prototype.registerToSiteWillUpdate = function (callback) {
        this._site.registerAspectToEvent(this._site.supportedEvents.willUpdate, callback);
    };

    /**
     *
     * @param {function()} callback
     */
    SiteAspectsSiteAPI.prototype.registerToDidLayout = function (callback) {

        this._site.registerAspectToEvent(this._site.supportedEvents.didLayout, callback);
    };

    SiteAspectsSiteAPI.prototype.unRegisterFromDidLayout = function (callback) {

        this._site.unregisterAspectFromEvent(this._site.supportedEvents.didLayout, callback);
    };

    SiteAspectsSiteAPI.prototype.registerToWillUnmount = function (callback) {
        this._site.registerAspectToEvent(this._site.supportedEvents.unmount, callback);
    };

    SiteAspectsSiteAPI.prototype.registerToUrlPageChange = function (callback) {

        this._site.registerAspectToEvent(this._site.supportedEvents.urlPageChange, callback);
    };

    /**
     *
     * @param {function(Array<string>, Array<string>)} callback, the callback will receive the added and removed roots
     */
    SiteAspectsSiteAPI.prototype.registerToRenderedRootsChange = function (callback) {
        this._site.registerAspectToEvent(this._site.supportedEvents.renderedRootsChanged, callback);
    };

    /**
     *
     * @param {function(Array<string>)} callback, the callback will receive the added roots after they didLayout
     */
    SiteAspectsSiteAPI.prototype.registerToAddedRenderedRootsDidLayout = function (callback) {
        this._site.registerAspectToEvent(this._site.supportedEvents.addedRenderedRootsDidLayout, callback);
    };

    /**
     *
     * @param {function(Event)} callback
     */
    SiteAspectsSiteAPI.prototype.registerToKeyDown = function (callback) {

        this._site.registerAspectToEvent(this._site.supportedEvents.keydown, callback);
    };

    /**
     * @param {string} type - event type
     * @param {function} callback - callback to call
     */
    SiteAspectsSiteAPI.prototype.registerToWindowTouchEvent = function (type, callback) {

        this._site.registerAspectToEvent(this._site.supportedEvents[type.toLowerCase()], callback);
    };

    /**
     * @param {string} event - event type
     * @param {function} callback - callback to call
     */
    SiteAspectsSiteAPI.prototype.registerToFocusEvents = function (event, callback) {

        this._site.registerAspectToEvent(this._site.supportedEvents[event], callback);
    };

    /**
     * @param {function} callback - callback to call
     */
    SiteAspectsSiteAPI.prototype.registerToVisibilityChange = function (callback) {

        this._site.registerAspectToEvent(this._site.supportedEvents.visibilitychange, callback);
    };

    /**
     * @param {function} callback - callback to call
     */
    SiteAspectsSiteAPI.prototype.registerToDocumentClick = function (callback) {

        this._site.registerAspectToEvent(this._site.supportedEvents.click, callback);
    };

    /**
     *
     * @param {function(Event)} callback
     */
    SiteAspectsSiteAPI.prototype.registerToOrientationChange = function (callback) {

        this._site.registerAspectToEvent(this._site.supportedEvents.orientationchange, callback);
    };


    /**
     *
     * @param {function(Event)} callback
     */
    SiteAspectsSiteAPI.prototype.registerToSvSessionChange = function (callback) {
        this._site.registerAspectToEvent(this._site.supportedEvents.svSessionChange, callback);
    };

    /**
     *
     * @returns {core.SiteAPI}
     */
    SiteAspectsSiteAPI.prototype.getSiteAPI = function () {
        return this._site.siteAPI;
    };

    /**
     * get the context object of the site - window by default.
     * @returns {window|HTMLElement}
     */
    SiteAspectsSiteAPI.prototype.getSiteContainer = function () {
        return this._site.props.getSiteContainer();
    };

    /**
     * Scroll the site by x,y pixels
     * @param {number} x
     * @param {number} y
     */
    SiteAspectsSiteAPI.prototype.scrollSiteBy = function (x, y) {
        this.getSiteContainer().scrollBy(x, y);
    };

    /**
     * Scroll the site to position x,y pixels
     * @param {number} x
     * @param {number} y
     */
    SiteAspectsSiteAPI.prototype.scrollSiteTo = function (x, y) {
        this.getSiteContainer().scrollTo(x, y);
    };

    /**
     * Get the window height / width measurements
     * @returns {{height: (number), width: (number)}}
     */
    SiteAspectsSiteAPI.prototype.getWindowSize = function () {
        var siteContainer = this.getSiteContainer();
        return {
            height: siteContainer.innerHeight,
            width: siteContainer.innerWidth
        };
    };

    /**
     * Get the document size
     * @returns {{height: (number), width: (number)}}
     */
    SiteAspectsSiteAPI.prototype.getDocumentSize = function () {
        return {
            height: window.document.documentElement.clientHeight || window.document.body.clientHeight,
            width: window.document.documentElement.clientWidth || window.document.body.clientWidth
        };
    };

    /**
     * Get the current scroll amount of the site
     * @returns {{x: (number), y: (number)}}
     */
    SiteAspectsSiteAPI.prototype.getSiteScroll = function () {
        var siteContainer = this.getSiteContainer() || {};
        return {
            x: siteContainer.pageXOffset || siteContainer.scrollX || 0,
            y: siteContainer.pageYOffset || siteContainer.scrollY || 0
        };
    };

    /**
     * Get the scroll amount of the current popup
     * @returns {{x: (number), y: (number)}}
     */
    SiteAspectsSiteAPI.prototype.getCurrentPopupScroll = function () {
        var popupRootDOMNode = window.document.getElementById('POPUPS_ROOT');

        return {
            x: _.get(popupRootDOMNode, 'scrollLeft', 0),
            y: _.get(popupRootDOMNode, 'scrollTop', 0)
        };
    };

    SiteAspectsSiteAPI.prototype.getBrowserFlags = function() {
        return this.getSiteAPI().getSiteData().browserFlags();
    };

    /**
     * Is current document visible (https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API)
     * @returns {{hidden: boolean}}
     */
    SiteAspectsSiteAPI.prototype.getVisibilityState = function () {
        var doc = typeof document !== 'undefined';
        return {hidden: doc && window.document.hidden};
    };

    SiteAspectsSiteAPI.prototype.getAspectComponentByRef = function (ref) {
        var container = this._site.refs.siteAspectsContainer;
        return container.refs[ref];
    };

    SiteAspectsSiteAPI.prototype.setSiteRootHiddenState = function (isHidden, callback) {
        this._site.setState({
            siteRootHidden: isHidden
        }, callback);
    };

    SiteAspectsSiteAPI.prototype.notifyAspects = function (event) {
        this._site.notifyAspects(event);
    };

    return SiteAspectsSiteAPI;
});
