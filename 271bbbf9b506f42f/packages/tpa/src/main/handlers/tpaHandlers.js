/*eslint identifier:0*/
define([
    'zepto',
    'lodash',
    'react',
    'core',
    'utils',
    'animations',
    'tpa/utils/sitePages',
    'tpa/services/pageService',
    'tpa/services/clientSpecMapService',
    'tpa/utils/tpaUtils',
    'tpa/utils/tpaStyleUtils',
    'tpa/bi/errors',
    'reactDOM',
    'tpa/handlers/anchorHandlers',
    'experiment',
    'wixUrlParser'
], function(
    $,
    _,
    React,
    core,
    utils,
    animations,
    sitePages,
    pageService,
    clientSpecMapService,
    tpaUtils,
    tpaStyleUtils,
    tpaErrors,
    ReactDOM,
    anchorHandlers,
    experiment,
    wixUrlParser
) {

    'use strict';

    var logger = utils.logger;

    var WIDGET_MAX_HEIGHT = 1000000;
    var TPAActivity = core.activityTypes.TPAActivity,
        activityService = core.activityService;

    var SCOPE = {
        APP: 'APP',
        COMPONENT: 'COMPONENT'
    };

    var siteInfo = function (siteAPI, msg, callback) {
        var info = {};
        var pageData = siteAPI.getSiteData().getDataByQuery(siteAPI.getSiteData().getCurrentUrlPageId());
        var siteTitle = siteAPI.getSiteData().getCurrentUrlPageTitle();

        if (tpaUtils.sdkVersionIsAtLeast(msg.version, '1.42.0')) {
            info.pageTitle = siteTitle;
        } else {
            info.siteTitle = siteTitle;
            info.pageTitle = pageData.title;
        }

        info.siteDescription = pageData.descriptionSEO;
        info.siteKeywords = pageData.metaKeywordsSEO;

        var currentUrl = siteAPI.getSiteData().currentUrl;
        info.url = currentUrl.full;
        info.baseUrl = siteAPI.getSiteData().getExternalBaseUrl();
        //TODO get referrer from siteAPI
        info.referer = window.document.referrer;
        callback(info);
    };

    var setPageMetadata = function (siteAPI, msg) {
        var comp = siteAPI.getComponentById(msg.compId);

        if (comp && tpaUtils.isTPASection(comp) && _.get(comp, 'props.pageId') === siteAPI.getSiteData().getCurrentUrlPageId()) {
            var pageData = siteAPI.getPageData();
            var newTitle = _.get(msg, 'data.title') || _.get(pageData, 'title', '');
            var newDescription = _.get(msg, 'data.description') || _.get(pageData, 'descriptionSEO', '');
            siteAPI.setRunTimePageTitle(_.unescape(newTitle), newDescription);
        }
    };

    var heightChanged = function (siteAPI, msg) {
        var height = typeof msg.data === "number" ? msg.data : msg.data.height;
        if (height > WIDGET_MAX_HEIGHT){
            //a very great height causes the site to render slowly.
            var params = {
                height: height
            };
            logger.reportBI(siteAPI.getSiteData(), tpaErrors.SDK_SET_HEIGHT_ERROR, params);
        }
        var compState = {
            height: height,
            ignoreAnchors: msg.data.overflow
        };

        var comp = siteAPI.getComponentById(msg.compId);

        comp.registerReLayout();
        comp.setState(compState);
    };

    var getCurrentPageId = function (siteAPI, msg, callback) {
        callback(siteAPI.getSiteData().getCurrentUrlPageId());
    };

    var getSitePages = function (siteAPI, msg, callback) {
        var options = {
            filterHideFromMenuPages: true,
            includePagesUrl: _.get(msg, 'data.includePagesUrl', false)
        };

        callback(sitePages.getSitePagesInfoData(siteAPI.getSiteData(), options));
    };

    var setSectionUrlStateByPageId = function (siteAPI, pageId, state) {
        var pageComps = siteAPI.getComponentsByPageId(pageId);
        var pageSectionComp = _.find(pageComps, 'isTPASection');

        if (pageSectionComp) {
            pageSectionComp.setState({sectionUrlState: state});
        }
    };

    var navigateToSection = function(siteAPI, appData, msg, appPages, callback) {

        if (appData) {
            var pageId,
                tpaPageId,
                noTransition = false,
                state = msg.data;

            if (_.isObject(msg.data)) {
                state = msg.data.state;
                tpaPageId = _.get(msg.data.sectionIdentifier, 'sectionId');
                noTransition = _.get(msg.data.sectionIdentifier, 'noTransition');
            }

            if (_.isUndefined(appPages) || _.isEmpty(appPages)) {
                reportNavigateToSectionBIError(siteAPI, appData.appDefinitionName, tpaPageId);
                callback({
                    error: {
                        message: 'Page with app "' + appData.appDefinitionName + '" was not found.'
                    }
                });
            } else {
                if (_.isUndefined(tpaPageId)) {
                    pageId = appPages[0].pageId;
                } else {
                    var page = _.find(appPages, {tpaPageId: tpaPageId});

                    if (_.isUndefined(page)) {
                        reportNavigateToSectionBIError(siteAPI, appData.appDefinitionName, tpaPageId);
                        callback({
                            error: {
                                message: 'App page with sectionId "' + tpaPageId + '" was not found.'
                            }
                        });
                        return;
                    }

                    pageId = page.pageId;
                }

                setSectionUrlStateByPageId(siteAPI, pageId, state);

                var navInfo = {
                    pageId: pageId,
                    pageAdditionalData: state
                };

                if (noTransition) {
                    navInfo.transition = 'none';
                }

                navigateWithoutClosingPopupIfPossible(siteAPI, navInfo);
            }
        } else {
            reportNavigateToSectionBIError(siteAPI);
            callback({
                error: {
                    message: 'Component was not found.'
                }
            });
        }
            };

    var navigateToSectionPage = function (siteAPI, msg, callback) {
        var comp = siteAPI.getComponentById(msg.compId);
        var appData, appPages;
        if (comp) {
            var tpaPages = pageService.mapPageToWidgets(siteAPI);
            appData = comp.getAppData();
            appPages = appData && tpaPages[appData.applicationId];
        }

        navigateToSection(siteAPI, appData, msg, appPages, callback);
    };

    function navigateWithoutClosingPopupIfPossible(siteAPI, navInfo, shouldSkipHistory, shouldReplaceHistory){
        if (navInfo.pageId === siteAPI.getSiteData().getPrimaryPageId()){
            siteAPI.updatePageNavInfo(navInfo, shouldSkipHistory, shouldReplaceHistory);
        } else {
            siteAPI.navigateToPage(navInfo, shouldSkipHistory, shouldReplaceHistory);
        }
    }

    var reportNavigateToSectionBIError = function(siteAPI, appDefinitionName, tpaPageId) {
        var params = {
            appDefinitionName: appDefinitionName || '',
            sectionId: tpaPageId || ''
        };
        logger.reportBI(siteAPI.getSiteData(), tpaErrors.SDK_NAVIGATION_TO_SECTION_ERROR, params);
    };

    var scrollBy = function (siteAPI, msg) {
        siteAPI.scrollSiteBy(msg.data.x, msg.data.y);
    };

    var scrollTo = function (siteAPI, msg) {
        siteAPI.scrollSiteTo(msg.data.x, msg.data.y);
    };

    var navigateToPage = function (siteAPI, msg, callback) {
        var pageId = _.get(msg, 'data.pageId');
        var noTransition = _.get(msg, 'data.noTransition');
        var anchorId = _.get(msg, 'data.anchorId');
        if (siteAPI.getSiteData().getPrimaryPageId() === pageId) {
            if (anchorId) {
                anchorHandlers.navigateToAnchor(siteAPI, msg, callback);
            }
        } else {
            navigateToPageImpl(siteAPI, pageId, noTransition, function () {
                if (anchorId) {
                    anchorHandlers.navigateToAnchor(siteAPI, msg, callback);
                }
            }, callback);
        }
    };

    function navigateToPageImpl(siteAPI, pageId, noPageTransition, onNavigationComplete, onError) {
        if (_.includes(siteAPI.getSiteData().getAllPageIds(), pageId)) {
            var actionsAspect = siteAPI.getSiteAspect('actionsAspect');
            actionsAspect.registerNavigationComplete(onNavigationComplete);
            var navInfo = {pageId: pageId};
            if (noPageTransition) {
                navInfo.transition = 'none';
            }
            siteAPI.navigateToPage(navInfo);
        } else if (onError) {
            onError({
                error: {
                    message: 'Page id "' + pageId + '" was not found.'
                }
            });
        }
    }

    var navigateToComponent = function(siteAPI, msg, callback) {
        var pageId = msg.data.pageId;
        var compId = msg.data.compId;
        var siteData = siteAPI.getSiteData();
        var focusedPageId = siteData.getFocusedRootId();

        var comp = siteAPI.getComponentById(compId);
        if (comp && comp.props.structure.componentType === 'wysiwyg.viewer.components.tpapps.TPAGluedWidget') {
            callback({
                error: {
                    message: 'Navigation to glued widget not supported.'
                }
            });
            return;
        }

        if (!_.isEmpty(pageId) && pageId !== focusedPageId) {
            navigateToPageImpl(siteAPI, pageId, msg.data.noPageTransition, scrollToComponent.bind(null, siteAPI, comp, compId, pageId, callback), callback);
        } else {
            scrollToComponent(siteAPI, comp, compId, pageId, callback);
        }
    };

    var scrollToComponent = function(siteAPI, comp, compId, pageId, callback) {
        pageId = pageId || siteAPI.getSiteData().getFocusedRootId();
        comp = comp || getComponentByPageId(siteAPI, compId, pageId);

        if (!comp || (!isCompOnAllPages(comp) && comp.props.rootId !== pageId)) {
            var errorMessage = _.isEmpty(pageId) ? 'Current page' : 'Page id "' + pageId + '"';
            callback({
                error: {
                    message: errorMessage + ' does not contain the component id "' + compId + '".'
                }
            });
            return;
        }

        var componentPosition = calcCompOffset(comp, siteAPI);

        animations.animate('BaseScroll', siteAPI.getSiteContainer(), 1, 0, {y: componentPosition.y, x: componentPosition.x, callbacks: {onComplete: callback}});
    };

    var isCompOnAllPages = function(comp) {
        return comp.props.rootId === 'masterPage';
    };

    var getComponentByPageId = function(siteAPI, compId, pageId) {
        var pageComps = siteAPI.getComponentsByPageId(pageId);
        return pageComps[compId];
    };

    var calcCompOffset = function(comp, siteAPI){
        var siteData = siteAPI.getSiteData();

        var compDOMode = ReactDOM.findDOMNode(comp);
        var siteContainerTopOffset = siteData.measureMap.siteMarginTop || 0;
        var boundingRectObject = utils.domMeasurements.getElementRect(compDOMode);
        var compYOffset = boundingRectObject.top + siteContainerTopOffset;

        if (_.get(siteData, 'measureMap.custom.SITE_HEADER.isFixedPosition')) {
            compYOffset -= siteData.measureMap.height.SITE_HEADER;
        }

        var scrollToY = utils.scrollAnchors.normalizeYOffset(compYOffset, siteData);
        var scrollToX = boundingRectObject.left;

        return {x: scrollToX, y: scrollToY};
    };

    var boundingRectAndOffsets = function (siteAPI, msg, callback) {
        var siteData = siteAPI.getSiteData();
        var comp = siteAPI.getComponentById(msg.compId);
        var compDOMNode = ReactDOM.findDOMNode(comp);
        var headerIsFixedPosition = _.get(siteData, 'measureMap.custom.SITE_HEADER.isFixedPosition');
        var headerHeight = 0;
        if (headerIsFixedPosition) {
            headerHeight = siteData.measureMap.height.SITE_HEADER;
        }
        var siteScale = _.get(siteData, 'renderFlags.siteScale', 1);

        callback({
            rect: buildBoundingRectObject(compDOMNode, headerHeight),
            offsets: transformOffset($(compDOMNode).offset(), headerHeight),
            scale: siteScale
        });
    };

    var buildBoundingRectObject = function (node, headerHeight) {
        var boundingRect = node.getBoundingClientRect();
        var boundingRectObj = _(boundingRect)
            .pick(['left', 'right', 'top', 'bottom', 'height', 'width'])
            .mapValues(function (value) {
                return Math.floor(value);
            })
            .value();

        if (headerHeight) {
            boundingRectObj.top -= headerHeight;
        }

        return boundingRectObj;
    };

    var transformOffset = function (offset, headerHeight) {
        return {
            x: offset.left,
            y: offset.top - headerHeight
        };
    };

    var openModal = function (siteAPI, msg, callback) {
        var comp = siteAPI.getComponentById(msg.compId);
        var tpaModalAspect = siteAPI.getSiteAspect('tpaModalAspect');
        tpaModalAspect.showModal(getCompDataFrom(msg, comp), callback);
    };

    var openPopup = function (siteAPI, msg, callback) {
        var comp = siteAPI.getComponentById(msg.compId);

        if (!shouldAllowOpenPopup(comp)) {
            var err = new Error();
            err.name = 'Operation not supported';
            err.message = 'An app can not open a popup from a modal.';
            throw err;
        }

        var tpaPopupAspect = siteAPI.getSiteAspect('tpaPopupAspect');
        tpaPopupAspect.showPopup(getCompDataFrom(msg, comp), callback);
    };

    var shouldAllowOpenPopup = function(comp) {
        var notAllowedTypes = [
            'wysiwyg.viewer.components.tpapps.TPAModal'
        ];

        return !_.includes(notAllowedTypes, comp.props.structure.componentType);
    };

    var closeWindow = function (siteAPI, msg) {
        var comp = siteAPI.getComponentById(msg.compId);
        if (comp && comp.hide) {
            comp.hide(msg.data);
        }
    };

    var isPercentValue = function (value) {
        return _.isString(value) && /^[0-9]+%$/.test(value);
    };

    var shouldAllowResizeWindow = function (comp) {
        var allowedTypes = [
            'wysiwyg.viewer.components.tpapps.TPAGluedWidget',
            'wysiwyg.viewer.components.tpapps.TPAPopup',
            'wysiwyg.viewer.components.tpapps.TPAModal'
        ];

        return comp && comp.resizeWindow && _.includes(allowedTypes, comp.props.structure.componentType);
    };

    var resizeWindow = function (siteAPI, msg, callback) {
        var width = msg.data.width;
        var height = msg.data.height;

        if (!isPercentValue(width)) {
            width = parseFloat(width);
        }

        if (!isPercentValue(height)) {
            height = parseFloat(height);
        }

        var comp = siteAPI.getComponentById(msg.compId);

        if (shouldAllowResizeWindow(comp)) {
            comp.resizeWindow(width, height, callback);
        }
    };

    var getCompDataFrom = function (msg, comp) {
        var compData = _.merge(msg.data, {origCompId: msg.compId});
        //TODO - once we have the offset value on the comp remove this
        var node = ReactDOM.findDOMNode(comp);
        compData.origCompStyle = $(node).offset();
        var clientRect = node.getBoundingClientRect();
        compData.origCompStyle.actualTop = clientRect.top;
        compData.origCompStyle.actualLeft = clientRect.left;
        compData.position = _.defaults(compData.position || {}, {
            origin: 'FIXED',
            placement: 'CENTER',
            x: 0,
            y: 0
        });
        compData.position.x = cleanupPositionFor(compData.position.x);
        compData.position.y = cleanupPositionFor(compData.position.y);
        compData.windowSize = {
            width: $(window).width(),
            height: $(window).height()
        };
        compData.applicationId = comp.props.compData.applicationId;
        compData.tpaData = getCompTpaData(comp);

        return compData;
    };

    var getCompTpaData = function(comp) {
        return comp.props.compData.tpaData;
    };

    var cleanupPositionFor = function (val) {
        if (_.isString(val)) {
            var x = parseInt(val, 10);
            if (!_.isNaN(x)) {
                return x;
            }
            return 0;
        } else if (_.isNumber(val)) {
            return val;
        }
        return 0;
    };

    var registerEventListener = function (siteAPI, msg) {
        var eventKey = msg.data.eventKey;
        var comp = siteAPI.getComponentById(msg.compId);

        //in change gallery we change the gallery type but leave the id, so the comp might not be a tpa comp
        if (comp && comp.isCompListensTo && !comp.isCompListensTo(eventKey)) {
            comp.startListen(eventKey);
        }
    };

    var removeEventListener = function (siteAPI, msg) {
        var eventKey = msg.data.eventKey || msg.data;
        var comp = siteAPI.getComponentById(msg.compId);

        if (comp) {
            comp.stopListen(eventKey);
        }
    };

    var appStateChanged = function (siteAPI, msg) {
        var state = typeof msg.data === "string" ? msg.data : msg.data.state,
            comp = siteAPI.getComponentById(msg.compId),
            parsedState;

        var rootId = siteAPI.getRootOfComponentId(msg.compId);
        var navInfo = siteAPI.getSiteData().getExistingRootNavigationInfo(rootId);
        var pageId = navInfo ? navInfo.pageId : rootId; //if the root isn't rendered at this point there won't be navInfo
        try {
            parsedState = JSON.parse(state);
            switch (parsedState.cmd) {
                case 'zoom':
                    comp.processImageClick(parsedState);
                    break;
                case 'componentReady':
                    comp.setComponentInIframeReady();
                    break;
                case 'navigateToDynamicPage':
                    var linkData = parsedState.args[0];
                    var url = wixUrlParser.getUrl(siteAPI.getSiteData(), linkData);
                    var navigationInfo = wixUrlParser.parseUrl(siteAPI.getSiteData(), url);
                    if (parsedState.args[1]) {
                        navigationInfo.anchorData = parsedState.args[1];
                    }
                    siteAPI.handleNavigation(navigationInfo, parsedState.args[2]);
                    break;
                case 'navigateToAnchor':
                    var navigatePageId = parsedState.args[0];
                    var anchorData = parsedState.args[1];
                    //we have anchors only on the primary page for now..
                    if (siteAPI.getSiteData().getPrimaryPageId() === navigatePageId) {
                        if (anchorData) {
                            siteAPI.scrollToAnchor(anchorData);
                        }
                    } else {
                        siteAPI.navigateToPage({
                            pageId: navigatePageId,
                            pageAdditionalData: null,
                            anchorData: anchorData
                        });
                    }
                    break;
                default :
                    pushStateToSection(siteAPI, comp, pageId, state);

            }

        } catch (e) {
            pushStateToSection(siteAPI, comp, pageId, state);
        }
    };

    var pushStateToSection = function (siteAPI, comp, pageId, state) {
        if (tpaUtils.isTPASection(comp)) {
            comp.setState({
                pushState: state
            });
            navigateWithoutClosingPopupIfPossible(siteAPI, {
                pageId: pageId,
                pageAdditionalData: state,
                transition: 'none'
            });
        }
    };

    var replaceSectionState = function (siteAPI, msg) {
        var comp = siteAPI.getComponentById(msg.compId);
        var state = msg.data.state;
        var rootId = siteAPI.getRootOfComponentId(msg.compId);
        var skipHistory = false;
        var replaceHistory = true;

        if (tpaUtils.isTPASection(comp)) {
            comp.setState({
                pushState: state
            });

            navigateWithoutClosingPopupIfPossible(siteAPI, {
                pageId: rootId,
                pageAdditionalData: state,
                transition: 'none'
            }, skipHistory, replaceHistory);

        }
    };

    var getSectionUrl = function (siteAPI, msg, callback) {
        var comp = siteAPI.getComponentById(msg.compId);
        if (comp) {
            var tpaPages = pageService.mapPageToWidgets(siteAPI);
            var appData = siteAPI.getSiteData().getClientSpecMap()[comp.props.compData.applicationId];
            var tpaId = appData.applicationId;
            if (_.isEmpty(tpaPages) || _.isUndefined(tpaPages[tpaId])) {
                callback({
                    error: {
                        message: 'Page with app "' + appData.appDefinitionName + '" was not found.'
                    }
                });
            } else {
                var pages = tpaPages[tpaId];
                var tpaPageId = msg.data.sectionIdentifier;

                var page = _.find(pages, {tpaPageId: tpaPageId}) || pages[0];

                var pageId;
                if (page) {
                    pageId = page.pageId;
                }

                if (_.isUndefined(pageId)) {
                    callback({error: {message: 'Page was not found.'}});
                } else {
                    var url = siteAPI.getPageUrlFor(pageId);
                    if (_.isUndefined(url)) {
                        callback({error: {message: 'Page was not found.'}});
                    } else {
                        callback({url: url});
                    }
                }
            }
        } else {
            callback({error: {message: 'Component was not found.'}});
        }

    };

    var sendSiteMemberDataToWidget = function (comp, msg, siteMemberAspect, callback) {
        var memberData = siteMemberAspect.getMemberDetails();
        if (memberData !== null) {
            callback(memberData);
        }
        if (comp) {
            comp.setSiteMemberDataState(memberData ? null : {callback: callback});
        }
    };

    var smRequestLogin = function (siteAPI, msg, callback) {
        var comp = siteAPI.getComponentById(msg.compId);
        var siteMemberAspect = siteAPI.getSiteAspect('siteMembers');
        var isLoggedIn = siteMemberAspect.isLoggedIn();

        if (isLoggedIn) {
            sendSiteMemberDataToWidget(comp, msg, siteMemberAspect, function (memberData) {
                callback({
                    authResponse: true,
                    data: memberData
                });
            });
        } else {
            var mode = _.get(msg, 'data.mode');
            var showLoginDialog = mode && (mode === 'login');
            var language = _.get(msg, 'data.language', 'en');
            var cancelCallback;
            if (_.get(msg, 'data.callOnCancel')) {
                cancelCallback = function () {
                    callback({
                        wasCancelled: true
                    });
                };
            }

            siteMemberAspect.showAuthenticationDialog(function (memberData) {
                callback({
                    authResponse: true,
                    data: memberData
                });
            }, language, showLoginDialog, cancelCallback);
        }
    };

    var logOutCurrentMember = function (siteAPI, msg, callback) {
        var siteMemberAspect = siteAPI.getSiteAspect('siteMembers');
        var isLoggedIn = siteMemberAspect.isLoggedIn();

        if (isLoggedIn) {
            var language = _.get(msg, 'data.language');
            siteMemberAspect.logout(language);
        } else {
            callback({
                onError: 'No member is logged in'
            });
        }
    };

    var smCurrentMember = function (siteAPI, msg, callback) {
        var comp = siteAPI.getComponentById(msg.compId);
        var siteMemberAspect = siteAPI.getSiteAspect('siteMembers');
        var isLoggedIn = siteMemberAspect.isLoggedIn();

        if (isLoggedIn) {
            sendSiteMemberDataToWidget(comp, msg, siteMemberAspect, function (memberData) {
                callback(memberData);
            });
        } else {
            callback(null);
        }
    };

    var postActivity = function (siteAPI, msg) {
        var data = msg.data,
            comp = siteAPI.getComponentById(msg.compId),
            siteData = siteAPI.getSiteData(),
            activityInfo = {
                hubSecurityToken: siteData.getHubSecurityToken(),
                svSession: siteData.getSvSession(),
                metaSiteId: siteData.getMetaSiteId(),
                currentUrl: siteData.getCurrentUrl()
            },
            appData = tpaUtils.getAppData(siteAPI, msg.compId),
            instance = appData.instance,
            activityData = {
                type: data.activity.type || 'TPA',
                appDefinitionId: appData.appDefinitionId || 'TPA',
                info: data.activity.info || {},
                details: data.activity.details || {},
                contactUpdate: data.activity.contactUpdate || {},
                instance: instance
            },
            onSuccess = function (response) {
                if (response.userSessionToken) {
                    siteAPI.setUserSession(response.userSessionToken);
                }
                sendResponseToComp({
                    status: true,
                    response: response
                });
            },
            onError = function (response) {
                var res = {
                    status: response.status,
                    statusText: response.statusText,
                    responseText: response.responseText
                };
                sendResponseToComp({
                    status: false,
                    response: res
                });
            },
            sendResponseToComp = function (params) {
                comp.sendPostMessage({
                    intent: 'TPA_RESPONSE',
                    compId: msg.compId,
                    callId: msg.callId,
                    type: msg.type,
                    status: params.status,
                    res: {
                        response: {
                            activityId: params.response.activityId,
                            contactId: params.response.contactId
                        },
                        status: params.status
                    }
                });
            };

        var activity = new TPAActivity(activityInfo, activityData);
        activityService.reportActivity(activity, onSuccess, onError);
    };

    var getUserSession = function (siteAPI, msg, callback) {
        callback(siteAPI.getUserSession());
    };

    var appIsAlive = function (siteAPI, msg, callback) {
        var comp = siteAPI.getComponentById(msg.compId);
        if (comp && comp.setAppIsAlive) {
            comp.setAppIsAlive();
        }
        //in change gallery we change the gallery type but leave the id, so the comp might not be a tpa comp
        if (_.get(comp, 'hasOrigComponent')) {
            callback(tpaStyleUtils.getStyleDataToPassIntoApp(siteAPI, comp));
        }
    };

    var getStyleDataToPassIntoApp = function (siteAPI, comp) {
        return tpaStyleUtils.getStyleDataToPassIntoApp(siteAPI, comp);
    };

    var getCtToken = function (siteAPI, msg, callback) {
        if (_.isFunction(callback)) {
            callback(siteAPI.getSiteData().getCTToken());
        }
    };

    var postCountersReport = function (siteAPI, msg, callback) {
        msg.data.messageId = Date.now();
        var params = {
            ctToken: siteAPI.getSiteData().getCTToken()
        };
        var payload = _.omit(msg.data, 'version');
        var query = '?' + utils.urlUtils.toQueryString(params);
        //TODO - get this from topology
        var url = '//player-counters.wix.com/collector/rest/collect-js' + query;

        var onSuccess = function (response) {
            callback({
                status: 'success',
                response: response
            });
        };

        var onError = function (response) {
            var responseText = response && response.responseText;
            callback({
                status: 'error',
                response: responseText
            });
        };

        utils.ajaxLibrary.ajax({
            type: 'OPTIONS',
            url: url,
            data: JSON.stringify(payload),
            dataType: 'json',
            contentType: 'application/json',
            success: onSuccess,
            error: onError
        });
    };

    var getExternalId = function (siteAPI, msg, callback) {
        var comp = siteAPI.getComponentById(msg.compId);
        if (comp) {
            callback(comp.props.compData.referenceId);
        }
    };

    var dummyForBIEvents = function () {
    };

    var getViewMode = function(siteAPI, msg, callback) {
        var siteData = siteAPI.getSiteData();
        var viewMode = siteData.isViewerMode() ? 'site' : siteData.renderFlags.componentViewMode;
        callback({editMode: viewMode});
    };

    var getValue = function(siteAPI, msg, callback) {
        var key = msg.data.key;
        var scope = msg.data.scope;
        var siteData = siteAPI.getSiteData();
        var comp = siteAPI.getComponentById(msg.compId);
        var compData = comp.props.compData;
        var result;

        if (scope === SCOPE.APP) {
            result = getKeyValueObj(siteData, key, 'tpaData-' + compData.applicationId, 'masterPage');
        } else {
            var rootOfComp = siteAPI.getRootOfComponentId(msg.compId);
            result = getKeyValueObj(siteData, key, compData.tpaData, rootOfComp);
        }

        if (_.isEmpty(result)) {
            callback({
                error: {
                    message: 'key ' + key + ' not found in ' + scope + ' scope'
                }
            });
        } else {
            callback(result);
        }
    };

    var getValues = function(siteAPI, msg, callback){
        var keys = _.uniq(msg.data.keys);
        var siteData = siteAPI.getSiteData();
        var rootId = siteAPI.getRootOfComponentId(msg.compId);
        var comp = siteAPI.getComponentById(msg.compId, rootId);
        var compData = comp.props.compData;
        var scope = msg.data.scope;
        var resultObj;

        if (scope === SCOPE.APP) {
            var globalTpaDataContent = getTpaDataContent(siteData, 'tpaData-' + compData.applicationId, 'masterPage');
            resultObj = _.pick(globalTpaDataContent, keys);
        } else {
            var compTpaDataContent = getTpaDataContent(siteData, compData.tpaData, rootId);
            resultObj = _.pick(compTpaDataContent, keys);
        }

        if (!_.isEmpty(resultObj) && _(resultObj).keys().isEqual(keys)) {
            callback(resultObj);
        } else {
            var resultKeys = _.keys(resultObj);
            var keysNotFound = _(resultKeys).xor(keys).intersection(keys).value();
            callback({
                error: {
                    message: 'keys ' + keysNotFound + ' not found in ' + scope + ' scope'
                }
            });
        }
    };

    var getComponentInfo = function(siteAPI, msg, callback) {
        var comp = siteAPI.getComponentById(msg.compId);
        var compData = comp.props.compData;
        var appData = comp.getAppData();
        var showOnAllPages = isCompOnAllPages(comp);
        var widgetData = compData.widgetId ? appData.widgets[compData.widgetId] : clientSpecMapService.getMainSectionWidgetData(appData);

        var returnObj = {
            compId: msg.compId,
            showOnAllPages: showOnAllPages,
            pageId: showOnAllPages ? '' : comp.props.pageId,
            tpaWidgetId: _.get(widgetData, 'tpaWidgetId', ''),
            appPageId: _.get(widgetData, 'appPage.id', '')
        };

        callback(returnObj);
    };

    var getKeyValueObj = function(siteData, key, tpaDataQuery, pageId) {
        if (!_.isEmpty(tpaDataQuery)) {
            var tpaDataContent = getTpaDataContent(siteData, tpaDataQuery, pageId);
            if (tpaDataContent) {
                return _.pick(tpaDataContent, key);
            }
        }

        return null;
    };

    var getTpaDataContent = function(siteData, tpaDataQuery, pageId) {
        var tpaData = siteData.getDataByQuery(tpaDataQuery, pageId);
        if (tpaData && tpaData.content) {
            return JSON.parse(tpaData.content);
        }

        return null;
    };

    var getStateUrl = function (siteAPI, msg, callback) {
        var comp = siteAPI.getComponentById(msg.compId);
        if (!comp) {
            return callback({error: {message: 'Component was not found.'}});
        }
        var tpaPages = pageService.mapPageToWidgets(siteAPI);
        var appData = siteAPI.getSiteData().getClientSpecMap()[comp.props.compData.applicationId];
        var tpaId = appData.applicationId;
        if (_.isEmpty(tpaPages) || _.isUndefined(tpaPages[tpaId])) {
            return callback({
                error: {
                    message: 'Page with app "' + appData.appDefinitionName + '" was not found.'
                }
            });
        }
        var pages = tpaPages[tpaId];
        var page = _.find(pages, {tpaPageId: msg.data.sectionId});
        var pageInfo;
        if (page) {
            pageInfo = {
                pageId: page.pageId,
                pageAdditionalData: msg.data.state
            };
        } else {
            pageInfo = {
                pageId: pages[0].pageId
            };
        }
        return callback({url: utils.wixUrlParser.getUrl(siteAPI.getSiteData(), pageInfo, undefined, true)});
    };

    var getStyleId = function(siteAPI, msg, callback){
        var comp = siteAPI.getComponentById(msg.compId);
        callback(comp.props.structure.styleId);
    };

    var getStyleParamsByStyleId = function(siteAPI, msg, callback){
        var siteData = siteAPI.getSiteData();
        var styleId = msg.data.styleId;

        if (_.isUndefined(siteData.getAllTheme()[styleId])){
            callback({
                error: {
                    message: 'Style id "' + styleId + '" was not found.'
                }
            });
        } else {
            var styleItem = tpaStyleUtils.getStylesForSDK(siteData, styleId);
            callback(styleItem);
        }
    };

    return {
        siteInfo: siteInfo,
        heightChanged: heightChanged,
        registerEventListener: registerEventListener,
        navigateToPage: navigateToPage,
        smRequestLogin: smRequestLogin,
        smCurrentMember: smCurrentMember,
        scrollBy: scrollBy,
        scrollTo: scrollTo,
        navigateToComponent: navigateToComponent,
        postActivity: postActivity,
        getCurrentPageId: getCurrentPageId,
        getUserSession: getUserSession,
        boundingRectAndOffsets: boundingRectAndOffsets,
        navigateToSectionPage: navigateToSectionPage,
        getSitePages: getSitePages,
        removeEventListener: removeEventListener,
        appIsAlive: appIsAlive,
        openModal: openModal,
        openPopup: openPopup,
        closeWindow: closeWindow,
        resizeWindow: resizeWindow,
        appStateChanged: appStateChanged,
        getSectionUrl: getSectionUrl,
        getStyleDataToPassIntoApp: getStyleDataToPassIntoApp,
        postCountersReport: postCountersReport,
        getExternalId: getExternalId,
        getViewMode: getViewMode,
        getValue: getValue,
        getValues: getValues,
        getCurrentPageAnchors: anchorHandlers.getCurrentPageAnchors,
        navigateToAnchor: anchorHandlers.navigateToAnchor,
        getStateUrl: getStateUrl,
        getComponentInfo: getComponentInfo,
        getStyleId: getStyleId,
        getStyleParamsByStyleId: getStyleParamsByStyleId,
        replaceSectionState: replaceSectionState,
        logOutCurrentMember: logOutCurrentMember,
        getCtToken: getCtToken,
        setPageMetadata: setPageMetadata,
        navigateToSection: navigateToSection,

        /* Only handlers available for TPA Worker */
        tpaWorker: {
            siteInfo: siteInfo,
            getSitePages: getSitePages,
            removeEventListener: removeEventListener,
            registerEventListener: registerEventListener,
            smCurrentMember: smCurrentMember,
            appIsAlive: appIsAlive,
            navigateToSectionPage: navigateToSectionPage,
            getValue: getValue,
            getValues: getValues,

            /**/
            getViewMode: dummyForBIEvents,
            getDeviceType: dummyForBIEvents,
            getLocale: dummyForBIEvents,
            getInstanceId: dummyForBIEvents,
            getIpAndPort: dummyForBIEvents
        },


        /*Dummy handlers for BI*/
        toWixDate: dummyForBIEvents,
        getCompId: dummyForBIEvents,
        getOrigCompId: dummyForBIEvents,
        getWidth: dummyForBIEvents,
        getLocale: dummyForBIEvents,
        getCacheKiller: dummyForBIEvents,
        getTarget: dummyForBIEvents,
        getInstanceId: dummyForBIEvents,
        getSignDate: dummyForBIEvents,
        getUid: dummyForBIEvents,
        getPermissions: dummyForBIEvents,
        getIpAndPort: dummyForBIEvents,
        getDemoMode: dummyForBIEvents,
        getDeviceType: dummyForBIEvents,
        getInstanceValue: dummyForBIEvents,
        getSiteOwnerId: dummyForBIEvents,
        getImageUrl: dummyForBIEvents,
        getResizedImageUrl: dummyForBIEvents,
        getAudioUrl: dummyForBIEvents,
        getDocumentUrl: dummyForBIEvents,
        getSwfUrl: dummyForBIEvents,
        getPreviewSecureMusicUrl: dummyForBIEvents,
        getStyleParams: dummyForBIEvents,
        getStyleColorByKey: dummyForBIEvents,
        getColorByreference: dummyForBIEvents,
        getEditorFonts: dummyForBIEvents,
        getSiteTextPresets: dummyForBIEvents,
        getFontsSpriteUrl: dummyForBIEvents,
        getStyleFontByKey:dummyForBIEvents,
        getStyleFontByReference: dummyForBIEvents,
        getSiteColors: dummyForBIEvents,
        setUILIBParamValue: dummyForBIEvents
    };
});
