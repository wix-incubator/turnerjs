define(['lodash', 'zepto', 'bluebird', 'tpaIntegration/bootstrap/bootstrap'], function(_, $, Promise, bootstrap) {
    'use strict';
    /* eslint-disable */
    var SDK_CONSOLE_DEFAULT_VERSION = '0.33.0';
    var SDK_LATEST = '1.66.0';
    var SDK_CDN_URL_TPL = 'http://static.parastorage.com/services/js-sdk/{VERSION}/js/wix.min.js';

    var appsReady = {},
        events = {},
        supportedMessages = {
            AppReady : function (event, data, arg1) {
                var msgId = 'AppReady_' + data.compId;
                var eventObject = events[msgId];
                if (eventObject) {
                    delete events[msgId];
                    if (!eventObject.hasOwnProperty('error')) {
                        eventObject.resolve(this);
                    } else {
                        eventObject.reject(new Error('AppReady: ' + eventObject.error), eventObject);
                    }
                }

                appsReady[data.compId] = true;
            },
            AppReturnValue : function (event, data, value) {
                var eventObject = events[data.callbackID];
                if (eventObject) {
                    delete events[data.callbackID];
                    if (!eventObject.hasOwnProperty('error')) {
                        eventObject.resolve(value);
                    } else {
                        eventObject.reject(new Error('AppReturnValue: ' + eventObject.error), eventObject);
                    }
                }

                // Persist data to test onClose callback on popup close
                if (data.args && data.args[0] && data.args[0].onCloseCalled) {
                    appsReady[data.compId] = data.args[0];
                }
            }
        };


    var execute = function (injectedFunction, compId, delay) {

        return new Promise(function(resolve, reject){
            setTimeout(function () {
                var compNode = $('#' + compId);
                var iframe = compNode.find('iframe')[0];
                var callbackID = _.random();

                events[callbackID] = {
                    callbackID: callbackID,
                    appComp: compNode,
                    resolve: resolve,
                    reject: reject,
                    injectedFunction : injectedFunction
                };

                var message = JSON.stringify({
                    cmd : 'exec',
                    compId : compId,
                    inject : injectedFunction.toString(),
                    callbackID : callbackID
                }, null, 2);

                iframe.contentWindow.postMessage(message, '*');
            }, delay || 0);
        });
    };

    var waitForPromised = function (func, description, timeout, pollInterval) {
        timeout = timeout || 1000;
        pollInterval = pollInterval || 100;
        description = description || 'something to happen';

        var maxPolls = Math.ceil(timeout / pollInterval);
        var pollCount = 0;
        function attempt() {
            return Promise.try(func, [].slice.call(arguments, 1)).then(function(result) {
                if (result) {
                    return result;
                }

                if (++pollCount > maxPolls) {
                    throw new Error('Timeout waiting ' + timeout + 'ms for ' + description);
                }

                var d = Promise.pending();
                setTimeout(function(){
                    d.fulfill();
                }, pollInterval);

                return d.promise.then(attempt);
            });
        }

        return attempt().fail(function () {
            if (err) {
                jasmine.getEnv().currentSpec.fail(err);
            }
        });
    };

    var waitForDomElement = function (selector, tries, timeout, errorMessage, options) {
        return new Promise(function (resolve, reject) {
            var checkSelector = setInterval(function () {
                tries--;
                if ($(selector).length) {
                    if (options && options.delay) {
                        _.delay(function () {
                            resolve({
                                result: 'ok',
                                dom: $(selector)
                            });
                        }, options.delay);
                    } else {
                        resolve({
                            result: 'ok',
                            dom: $(selector)
                        });
                    }
                    clearInterval(checkSelector);
                } else if (tries === 0) {
                    reject({
                        result: errorMessage
                    });
                    clearInterval(checkSelector);
                }
            }, timeout);
        });
    };

    var waitForIframeWithUrlSubstring = function (urlSubstringArray) {
        if (_.isString(urlSubstringArray)) {
            urlSubstringArray = [urlSubstringArray];
        }
        if (!_.isArray(urlSubstringArray)) {
            console.error('use string or array of strings to check against iframe url.')
        }
        return new Promise(function(resolve, reject){
            var inter = setInterval(function(){
                var liveIframes = $("iframe");

                var lastOpenedIframe = _(liveIframes).filter(function (iframe) {
                    var iframeSrc = $(iframe).attr('src');
                    for (var i = 0; i < urlSubstringArray.length; i++) {
                        if (!_.includes(iframeSrc, urlSubstringArray[i])) {
                            return false;
                        }
                    }
                    return true;
                }).last();

                if (lastOpenedIframe) {
                    clearInterval(inter);
                    clearTimeout(timeout);

                    var iframeCompId = $(lastOpenedIframe).attr('id').replace('iframe', '');
                    var iframeComp = rendered.getAspectsContainer().refs[iframeCompId];

                    resolve(iframeComp);
                }
            }, 2000);

            var timeout = setTimeout(function(){
                clearInterval(inter);
                reject(new Error('could not find an iframe contains ' + urlSubstringArray.toString()));
            }, 1000 * 2);
        });
    };

    var callHandler = function (compId, data, handlerFunction, callback) {
        var postMessage = bootstrap.getTpaPostMessageAspect();
        var msg = {
            intent: 'TPA2',
            compId: compId,
            type: handlerFunction,
            data: data,
            deviceType: 'desktop'
        };
        postMessage.callHandler(bootstrap.getSiteAPI(), msg, callback);
    };

    var openModal = function (compId, url, width, height, onClose, theme) {
        theme = theme || '';
        var openModalFn = function(send){
            Wix.openModal($url, $width, $height, $onClose, $theme);
            send();
        };

        openModalFn = openModalFn.toString()
            .replace('$url', "'" + url+"'")
            .replace('$width', width)
            .replace('$height', height)
            .replace('$onClose', onClose && onClose.toString())
            .replace('$theme', "'" + theme + "'");

        return new Promise(function(resolve, reject){
            execute(openModalFn, compId)
                .then(function () {
                    return waitForIframeWithUrlSubstring('origCompId=' + compId);
                })
                .then(function (modalComp) {
                    var inter = setInterval(function(){
                        if (appsReady[modalComp.props.id]) {
                            clearInterval(inter);
                            clearTimeout(timeout);
                            resolve(modalComp);
                        }
                    }, 200);

                    var timeout = setTimeout(function(){
                        clearInterval(inter);
                        reject();
                    }, 1000 * 2);
                });
        });
    };

    var openPopupHandler = function(compId, url, width, height, position, onClose, callId) {
        var data = {
            height: height,
            position: position,
            theme: "DEFAULT",
            url: url,
            width: width
        };
        callHandler(compId, data, 'openPopup', onClose);
        return waitForIframeWithUrlSubstring([
            'origCompId=' + compId
        ]);
    };

    var openPopup = function (compId, url, width, height, position, onClose, callId) {
        var openPopupFn = function(send){
            Wix.openPopup($url, $width, $height, $position, $onClose);
            send();
        };

        openPopupFn = openPopupFn.toString()
            .replace('$url', "'" + url + "'")
            .replace('$width', width)
            .replace('$height', height)
            .replace('$position', _.isObject(position) ? JSON.stringify(position) : position)
            .replace('$onClose', onClose && onClose.toString());

        return execute(openPopupFn, compId).then(function () {
            return waitForIframeWithUrlSubstring([
                'origCompId=' + compId,
                'callId=' + callId
            ]);
        });
    };

    var navigateToSection = function (compId, sectionIdentifier, state, onFailure) {
        var _this = this;
        var navigateToSectionFn = function(){
            Wix.Utils.navigateToSection($sectionIdentifier, $state, $onFailure);
        };

        navigateToSectionFn = navigateToSectionFn.toString()
            .replace('$sectionIdentifier', _.isObject(sectionIdentifier) ? JSON.stringify(sectionIdentifier) : sectionIdentifier)
            .replace('$state', "'" + state + "'")
            .replace('$onFailure', onFailure && onFailure.toString());

        execute(navigateToSectionFn, compId);

        return new Promise(function(resolve){
            setTimeout(function () {
                resolve(_this.getCurrentNavigationInfo());
            }, 2000);
        });
    };

    var navigateToSectionHandler = function (compId, state, sectionIdentifier, onFailure) {
        callHandler(compId, {sectionIdentifier: sectionIdentifier, state: state}, 'navigateToSectionPage', onFailure);
    };

    var navigateToPage = function (pageId) {
        bootstrap.getSiteAPI().navigateToPage({pageId: pageId});
    };

    var navigateToPageHandler = function (compId, pageId, pageTitle, anchorId, onFailure) {
        callHandler(compId, { pageId : pageId, anchorId: anchorId}, 'navigateToPage', onFailure);
        return new Promise(function(resolve) {
            var retries = 0;
            var myInterval = setInterval(function () {
                var currentPage = window.location.pathname;
                if (_.endsWith(currentPage, '/' + pageTitle)) {
                    clearInterval(myInterval);
                    resolve(true);
                } else {
                    if (retries === 5) {
                        clearInterval(myInterval);
                        resolve(false);
                    }
                    retries++;
                }
            }, 1000);
        });
    };

    var navigateToComponentHandler = function(compId, targetCompId, pageId, callback) {
        callHandler(compId, { compId: targetCompId, pageId : pageId}, 'navigateToComponent', callback);
    };

    var getCurrentPageAnchors = function (callback) {
        callHandler('', '', 'getCurrentPageAnchors', callback);
    };

    var getSiteInfo = function (compId, callback) {
        callHandler(compId, '', 'siteInfo', callback);
    };

    var getStateUrl = function (compId,sectionId,state,callback) {
        callHandler(compId,{sectionId:sectionId ,state: state}, 'getStateUrl', callback);
    };
    var getSectionUrl = function (compId,sectionId,callback) {
        var args = sectionId? {sectionIdentifier:sectionId }: '';
        callHandler(compId, args, 'getSectionUrl', callback);
    };

    var getPublicDataValue = function (compId, key, scope, callback) {
        callHandler(compId, { key: key, scope: scope}, 'getValue', callback);
    };

    var getPublicDataValues = function (compId, keys, scope, callback) {
        callHandler(compId, { keys: keys, scope: scope}, 'getValues', callback);
    };

    var getSitePages = function (compId, options,callback) {
        callHandler(compId, {includePagesUrl:options}, 'getSitePages', callback);
    };

    var getStyleData = function (compId, callback) {
        callHandler(compId, '', 'appIsAlive', callback);
    };

    var getStyleId = function(compId, callback) {
        callHandler(compId, '', 'getStyleId', callback);
    };

    var getStyleParamsByStyleId = function(compId, styleId, callback) {
        callHandler(compId, { 'styleId': styleId}, 'getStyleParamsByStyleId', callback);
    };

    var callOpenModalHandler = function(compId, url, width, height, onClose) {
        callHandler(compId, { url: url, width: width, height: height}, 'openModal', onClose);

        return waitForIframeWithUrlSubstring('origCompId=' + compId)
    };

    var closeModal = function(compId) {
        callHandler(compId, { }, 'closeWindow');
    };

    var setHeight = function (compId, height, overflow) {
        return new Promise(function(resolve) {
            callHandler(compId, { 'height': height, overflow: overflow }, 'heightChanged', resolve);
        });
    };

    var setPageMetadata = function (compId, title, description) {
        callHandler(compId, {title: title, description: description}, 'setPageMetadata');
    };

    var scrollTo = function(compId, x, y) {
        callHandler(compId, {'x': x, 'y': y}, 'scrollTo');
    };

    var requestLogin = function(compId, options, callback) {
        callHandler(compId, options, 'smRequestLogin', callback);
    };

    var getCurrentNavigationInfo = function () {
        var siteAPI = bootstrap.getSiteAPI();
        var siteData = siteAPI.getSiteData();
        var pageComps = siteAPI.getComponentsByPageId(siteData.getCurrentUrlPageId());
        var pageSectionComp = _.find(pageComps, function (comp) {
            return comp.isTPASection;
        });

        var pageItemInfo = siteData.getExistingRootNavigationInfo(siteData.getCurrentUrlPageId()) || {};
        if (pageSectionComp) {
            pageItemInfo.state = pageSectionComp.state;
        }

        return pageItemInfo;
    };

    var appIsAlive = function (compId, timeout) {

        return new Promise(function(resolve, reject) {

            timeout = _.isUndefined(timeout) ? 3000 : timeout ;
            var inter = setInterval(function(){
                if (appsReady[compId]) {
                    clearInterval(inter);
                    clearTimeout(stop);
                    resolve();
                }
            }, 200);

            var stop = setTimeout(function(){
                clearInterval(inter);
                reject();
            }, timeout);
        });
    };

    var pushState = function (compId, state, timeout) {
        var pushStateFn = function(send){
            Wix.pushState($state);
            send('pushed');
        };

        pushStateFn = pushStateFn.toString().replace('$state', "'" + state + "'");

        return execute(pushStateFn, compId, timeout);
    };

    var resizeWindow = function(compId, width, height) {
        var isString = _.isString(width) || _.isString(height);
        var resizeWindowFn;
        if(isString) {
            resizeWindowFn = function(width, height) {
                Wix.resizeWindow("$width", "$height");
                send();
            };
        } else {
            resizeWindowFn = function(width, height) {
                Wix.resizeWindow($width, $height);
                send();
            };
        }

        resizeWindowFn = resizeWindowFn.toString().replace('$width', width)
            .replace('$height', height);

        return execute(resizeWindowFn, compId);
    };

    var getCurrentPageId = function() {
        var siteData = bootstrap.getSiteAPI().getSiteData();
        return siteData.getCurrentUrlPageId();
    };

    function getHandler(cmd) {
        return supportedMessages[cmd];
    }

    function registerEventReceiversSystem() {
        var _this = this;
        function handleMessage(event) {
            var handler;
            var data = {};

            try {
                data = JSON.parse(event.data);
            } catch (err) {
                _this.log('Error: App Message Parse Error', err);
            }

            if(typeof data === 'number' || data instanceof Number){
                return 'WTF';
            }

            handler = getHandler(data.cmd);

            if (handler) {
                handler(event, data, data.args && data.args[0]);
            }
        }

        window.addEventListener('message', handleMessage, false);
    }

    function getConsoleUrl() {
        var consoleVersion = window._versions && window._versions['sdk-console'] && window._versions['sdk-console'].rc;
        consoleVersion = consoleVersion || SDK_CONSOLE_DEFAULT_VERSION;

        return '//static.parastorage.com/services/sdk-console/${version}/index.html'.replace('${version}', consoleVersion);
    }

    function getGlobal(compId, name, time) {
        var fn = 'function(send){ send(window.$varName); }';
        fn = fn.replace('$varName', name);
        return execute(fn, compId, time);
    }

    function log(str) {
        console.log('Driver logger: ' + str);
    }

    function getBoundingRect(compId) {
        var compNode = document.getElementById(compId);

        return compNode && compNode.getBoundingClientRect();
    }

    function getViewMode (compId, callback) {
        callHandler(compId, '', 'getViewMode', callback);
    }

    var navigateToAnchor = function(anchorId, onFailure){
        callHandler('', {anchorId: anchorId}, 'navigateToAnchor', onFailure);
    };

    function isAnchorInViewport (el) {
        var rect = el.getBoundingClientRect();

        return (
        rect.top >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight)
        );
    }

    var waitForCondition = function(checkCondition, errorMessage){
        return new Promise(function (resolve, reject) {
            var checkWindowPlacement = setInterval(function () {
                if (checkCondition()) {
                    clearInterval(checkWindowPlacement);
                    clearTimeout(testTimeout);
                    resolve();
                }
            }, 100);

            var testTimeout = setTimeout(function () {
                clearInterval(checkWindowPlacement);
                reject(errorMessage);
            }, 2000);
        });
    };

    var replaceState = function (compId, state) {
        callHandler(compId, { state : state}, 'replaceSectionState');
        return new Promise(function(resolve) {
            var retries = 0;
            var myInterval = setInterval(function () {
                var currentPage = window.location.pathname;
                if (_.endsWith(currentPage, state)) {
                    clearInterval(myInterval);
                    resolve(true);
                } else {
                    if (retries === 5) {
                        clearInterval(myInterval);
                        resolve(false);
                    }
                    retries++;
                }
            }, 1000);
        });
    };

    var getSDKUrl = function (version) {
        version = version || SDK_LATEST;
        return SDK_CDN_URL_TPL.replace('{VERSION}', version);
    };

    var getRunnerDependenciesPath = function () {
        if (_.contains(decodeURIComponent(location.href), 'ReactSource=http://localhost')) {
            return 'http://localhost:4578/tpaIntegration/src/main/dependencies/'
        } else {
            return 'http://s3.amazonaws.com/integration-tests-statics/SNAPSHOT/runners/tpaIntegration/src/main/dependencies/'
        }
    };

    registerEventReceiversSystem();

    return {
        waitForIframeWithUrlSubstring: waitForIframeWithUrlSubstring,
        appsReady: appsReady,
        execute: execute,
        waitForPromised: waitForPromised,
        waitForDomElement: waitForDomElement,
        appIsAlive: appIsAlive,
        openModal: openModal,
        openPopup: openPopup,
        openPopupHandler: openPopupHandler,
        getSiteInfo: getSiteInfo,
        getConsoleUrl: getConsoleUrl,
        getStateUrl: getStateUrl,
        getGlobal: getGlobal,
        getBoundingRect: getBoundingRect,
        navigateToSection: navigateToSection,
        navigateToSectionHandler: navigateToSectionHandler,
        navigateToPageHandler: navigateToPageHandler,
        navigateToPage: navigateToPage,
        getCurrentNavigationInfo: getCurrentNavigationInfo,
        pushState: pushState,
        setHeight: setHeight,
        getSitePages: getSitePages,
        resizeWindow: resizeWindow,
        getStyleData: getStyleData,
        navigateToComponentHandler: navigateToComponentHandler,
        getCurrentPageId: getCurrentPageId,
        log: log,
        getViewMode: getViewMode,
        getCurrentPageAnchors: getCurrentPageAnchors,
        navigateToAnchor: navigateToAnchor,
        isAnchorInViewport: isAnchorInViewport,
        waitForCondition: waitForCondition,
        getValue: getPublicDataValue,
        getValues: getPublicDataValues,
        getStyleId: getStyleId,
        getStyleParamsByStyleId: getStyleParamsByStyleId,
        replaceState: replaceState,
        callOpenModalHandler: callOpenModalHandler,
        closeModal: closeModal,
        setPageMetadata: setPageMetadata,
        scrollTo: scrollTo,
        requestLogin: requestLogin,
        getSectionUrl: getSectionUrl,
        getSDKUrl: getSDKUrl,
        getRunnerDependenciesPath: getRunnerDependenciesPath
    };
});
