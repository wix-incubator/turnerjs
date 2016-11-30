(function(){
    if(!window.publicModel || !window.rendererModel){
        return;
    }

    if (!window.MobileUtils){
    //for case there was a problem in server's vm which brings the mobile_utils.js
        return;
    }

    var isMobile = getQueryParam('showMobileView') || MobileUtils.isMobile();
    if(!isMobile){
        return;
    }

    var isMobileOptimizedOn = window.publicModel.adaptiveMobileOn;
    var isEnablePreloader = window.rendererModel.siteMetaData && window.rendererModel.siteMetaData.preloader &&
        window.rendererModel.siteMetaData.preloader.enabled;
    //isEnablePreloader is not undefined if ActivateInitFromStatic was open during publish in the editor
    //(meaning the screenshotter was called)

    if (!isMobileOptimizedOn || (isMobileOptimizedOn && (isEnablePreloader === undefined))){
        return;
    }

    var staticPrefix = 'static_';
    var domIdPrefix = staticPrefix + 'mobile_';
    var viewerPreloaderId = 'viewer_preloader';

    var url = getQueryParam('staticdocur');
    if(!url){
        url = getCurrentRenderedHtmlUrl();
    }
    if(!url){//for the case where this isn't the mainPage
        if (isEnablePreloader){
            showOldPreLoader();
        } else {
            addFixedPreloader(true);
        }
        return;
    }

    var currentPageId = getCurrentPageId();
    var isLocal = url && url.indexOf('wysiwyg') >= 0;

    resource.getResourceValue('scriptLoader', function(scriptLoader){
        logLoadStaticHtml('start loading');
        if(isLocal){
            scriptLoader.getWithJSONP({'url': url}, {'onLoad': loadStaticHtml, 'onFailed': loadFailed});
        } else{
            scriptLoader.getWithCORS({'url': url}, {'onLoad': loadStaticHtml, 'onFailed': loadFailed});
        }
    });

    function loadFailed(xhr, resource, e){
        if (isEnablePreloader){
            showOldPreLoader();
        } else {
            addFixedPreloader(true);
        }
        logLoadStaticHtml('end loading', 'failed');
    }

    function loadStaticHtml(data){
        logLoadStaticHtml('end loading');
        window.loadedFromStatic = true;
        adoptToMobileView();
        insertHtml(document.head, data.headHtml);
        addFixedPreloader(false);
        insertHtml(document.body, data.bodyHtml);
        window.onload = adjustMobileBgNodeHeight; //we need to wait for all style sheets to be loaded
        // before adjusting the bg size (on this phase we can't use mootools domReady event yet
        // and also our site ready event is too late)
        window.onhashchange = onHashChange;
        postDataToTpaGalleries(data.tpaGalleriesData);
        logLoadStaticHtml('dom ready', null, !!data.tpaGalleriesData);
    }

    function addFixedPreloader(addOnlyToMobileDevice){
        var shouldAdd = false;
        if (!addOnlyToMobileDevice || (MobileUtils.isMobile() && MobileUtils.isViewportOpen())){
            shouldAdd = true;
        }
        if (shouldAdd){
            var fixedPreloader = document.createElement('div');
            fixedPreloader.setAttribute('id', staticPrefix + viewerPreloaderId);
            fixedPreloader.classList.add('fixed_position_preloader');
            document.body.appendChild(fixedPreloader);
        }
    }

    function showOldPreLoader () {
        if (MobileUtils.isMobile() && MobileUtils.isViewportOpen()){
            var preloader = document.getElementById(viewerPreloaderId);
            if (preloader) {
                preloader.style.display = "block";
            }
        }
    }

    function adoptToMobileView(){
        MobileUtils.fixViewportScale();
        window.addEventListener("orientationchange", MobileUtils.fixViewportScale, false);
    }

    function insertHtml(parentNode, htmlString){
        var div = document.createElement('div');
        div.innerHTML = htmlString;
        var bodyFirst = parentNode.firstChild;
        var elementToAppend;
        while (div.hasChildNodes()) {
            elementToAppend = getChildElementToAppend(div);
            parentNode.insertBefore(elementToAppend, bodyFirst);
        }

    }

    function getChildElementToAppend(parentNode){
        var element = parentNode.removeChild(parentNode.firstChild);
        if(element.nodeName.toLowerCase() !== 'script'){
            return element;
        }
        var scriptElement = document.createElement('script');
        var attributes = element.attributes;
        for(var i = 0; i <  attributes.length; i++){
            var attr = attributes[i];
            scriptElement.setAttribute(attr.name, attr.value);
        }
        return scriptElement;
    }

    function adjustMobileBgNodeHeight(){
        window.onload = null; //removing the event
        var newHeight = Math.max(document.body.clientHeight, document.documentElement.clientHeight);
        newHeight += 'px' ;
        var mobile_bg_node = document.getElementById(staticPrefix + "mobile_bgNode");
        if(mobile_bg_node) {
            //we calculate an equivalent function to document.getHeight() in WsiteStructure's _updateSiteBgSize
            // because Mootools is not necessarily loaded yet
            mobile_bg_node.style.height = newHeight ;
        } else {
            mobile_bg_node = document.getElementById(staticPrefix + "mobileBgNode");
            _handleBackgroundPerPageNodes(mobile_bg_node, newHeight);
        }
    }

    function _handleBackgroundPerPageNodes(mobileBgNode, newHeight) {
        if (mobileBgNode) {
            var skinPartsToSetHeight = ['bgViewPort', 'primary', 'secondary'];
            for (var i = 0; i < skinPartsToSetHeight.length; i++) {
                var part = mobileBgNode.querySelector("[skinpart='" + skinPartsToSetHeight[i] + "']");
                if(part) {
                    part.style.height = newHeight ;
                }
            }
        }
    }

    function postDataToTpaGalleries(galleriesData){
        if(!galleriesData){
            return;
        }
        for(var compDomId in galleriesData){
            var compNode = document.getElementById(compDomId);
            var iframe = compNode.querySelector('iframe');
            var messageData = {intent:"addEventListener", eventType:'', params:{}};
            messageData.params = galleriesData[compDomId];
            messageData.eventType = 'SETTINGS_UPDATED';
            try {
                var msgStr = JSON.stringify(messageData);
                iframe.addEventListener('load', function(msgStr){
                    return function(event){
                        event.srcElement.contentWindow.postMessage(msgStr, "*");
                    };
                }(msgStr));
            } catch (e) {
                return;
            }
        }
    }

    function getQueryParam(name) {
        var qs = window.location.search;
        var parts = qs.split('&');
        for(var i = 0; i< parts.length; i++){
            var param = parts[i].replace('?', '');
            if(param.indexOf(name) === 0){
                return decodeURIComponent(param.split('=')[1]);
            }
        }
        return null;
    }

    function getCurrentRenderedHtmlUrl() {
        var mainPageId = window.publicModel.pageList.mainPageId;
        var currentPageId = getCurrentPageId();
        if (currentPageId !== mainPageId) {
            return null;
        }
        var pages = window.publicModel.pageList.pages;
        var pageDataUrl;
        var i;
        for (i = 0; i < pages.length; i++) {
            if (pages[i].pageId === mainPageId) {
                pageDataUrl = pages[i].urls[0];
                break;
            }
        }

        var splittedPageDataUrl = pageDataUrl.split('/');
        var urlPrefix = "";
        for (i = 0; i < splittedPageDataUrl.length - 1; i++) {
            urlPrefix += splittedPageDataUrl[i] + '/';
        }
        urlPrefix = urlPrefix.replace('sites', 'rendered-pages');
        var currPageId = splittedPageDataUrl[splittedPageDataUrl.length - 1].split('?')[0].split('.')[0];

        var splittedMatserPageDataUrl = publicModel.pageList.masterPage[0].split('/');
        var masterPageId = splittedMatserPageDataUrl[splittedMatserPageDataUrl.length - 1].split('?')[0];

        return urlPrefix + currPageId + '-' + masterPageId;
    }

    function getCurrentPageId(){
        var hash = window.location.hash;
        if(!hash){
            return window.publicModel.pageList.mainPageId;
        }
        var hashParts = [];
        var hashPartsFirstStep = hash.split('|');
        for(var i =0; i < hashPartsFirstStep.length; i++){
            hashParts = hashParts.concat(hashPartsFirstStep[i].split('/'));
        }
        return hashParts[1];
    }

    function onHashChange(){
        var nextPageId = getCurrentPageId();
        if(currentPageId === nextPageId){
            return;
        }
        var pageNode = document.getElementById(domIdPrefix + currentPageId);
        if(pageNode && pageNode.className.indexOf(' hidden') === -1){
            pageNode.className += " hidden";
            currentPageId = nextPageId;
        }
    }

    resource.getResourceValue('W.Utils', function(utils){
        var hash = utils.hash;
        var interval = setInterval(function(){
            hash = utils.hash;
            if(hash){
                window.clearInterval(interval);
                hash.addEvent('change', onHashChange);
            }
        }, 50);
    });

    resource.getResourceValue('W.Viewer', function(viewer){
        viewer.addEvent('SiteReady', function(){
            W.Utils.hash.removeEvent('change', onHashChange);
            window.removeEventListener("orientationchange", MobileUtils.fixViewportScale);
        });
    });

    function logLoadStaticHtml(step, error, hasGalleries) {
        deployStatus('loadStaticHtml', {
            'step': step,
            'time': LOG.getSessionTime(),
            'errorDesc': error,
            'hasGalleries': hasGalleries
        });
    }



}());