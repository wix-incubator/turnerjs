define.Class('wysiwyg.common.utils.LinkRenderer', function (classDefinition) {
    /** @type bootstrap.managers.classmanager.ClassDefinition */
    var def = classDefinition ;

    def.resources(['W.Config', 'W.Commands', 'W.Utils', 'W.Data']) ;

    def.statics({
        KNOWN_LINK_TYPES: ['externallink', 'pagelink', 'anchorlink', 'emaillink', 'documentlink', 'logintowixlink'],
        SAME_TAB_TARGET : "_self",
        NEW_TAB_TARGET : "_blank",
        PAGE_LINK_PREFIX : "#!",
        MAILTO_PREFIX : "mailto:",
        MEDIA_STATIC_URL: ''  //Will be set in initialize
    });

    def.binds(['_disableLinkClickPropagation', '_pageLinkOnClickHandler', '_anchorLinkOnClickHandler', '_externalLinkInPreviewClickHandler']);

    def.methods({
        initialize: function () {
            this.MEDIA_STATIC_URL = this.resources.W.Config.getServiceTopologyProperty('staticDocsUrl') + '/';
        },

        renderLink: function (node, linkDataItem, compLogic) {
            if (!this._verifyNodeAndData(node, linkDataItem, compLogic)) {
                return false;
            }

            //Remove any old 'click' handlers for preview usage.
            this.removeRenderedLinkFrom(node, compLogic);

            var renderedURL = this.renderLinkDataItem(linkDataItem);
            //Set the new rendered URL and target.
            if (renderedURL) {
                node.setAttribute("href", renderedURL);
            }
            this._setLinkTarget(node, linkDataItem);
            this._setLinkState(!!renderedURL, node, compLogic);

            if(compLogic && compLogic._NO_LINK_PROPAGATION) {
                node.addEvent("click", this._disableLinkClickPropagation);
            }
        },

        _setLinkState: function(isLinked, node, compLogic) {
            //WixApps don't send the compLogic
            if(!compLogic || !compLogic.hasState) {
                return;
            }

            if (isLinked) {
                node.setStyle("cursor", "pointer");
                if (compLogic.hasState("noLink", "linkableComponent")) {
//                    compLogic.removeState("noLink", "linkableComponent");
                    compLogic.setState("link", "linkableComponent");
                }
            } else {
                node.setStyle("cursor", "default");
                if (compLogic.hasState("link", "linkableComponent")) {
//                    compLogic.removeState("link", "linkableComponent");
                    compLogic.setState("noLink", "linkableComponent");
                }
            }
        },

        _disableLinkClickPropagation:function (ev) {
            ev.stopPropagation();
        },

        _verifyNodeAndData: function (node, linkDataItem, compLogic) {
            var errorInfo = {
                compName: (compLogic) ? compLogic.className : 'Comp logic NA',
                skinName: (compLogic) ? compLogic.getSkin().className : '',
                data: (linkDataItem && linkDataItem.getData) ? linkDataItem.getData() : 'No data',
                message: ''
            };

            if(!node) {
                errorInfo.message = 'Link DOM element not valid';
                LOG.reportError(wixErrors.LINK_RENDERING_FAILED, "wysiwyg.common.utils.LinkRenderer", "_verifyNodeAndData", JSON.stringify(errorInfo));
                return false;
            }

            if(!linkDataItem) {
                errorInfo.message = 'Data item not provided';
                LOG.reportError(wixErrors.LINK_RENDERING_FAILED, "wysiwyg.common.utils.LinkRenderer", "_verifyNodeAndData", JSON.stringify(errorInfo));
                return false;
            }

            if(typeof linkDataItem.getType !== 'function') {
                errorInfo.message = 'Data item not valid (no getType method)';
                LOG.reportError(wixErrors.LINK_RENDERING_FAILED, "wysiwyg.common.utils.LinkRenderer", "_verifyNodeAndData", JSON.stringify(errorInfo));
                return false;
            }

            var linkType = linkDataItem.getType().toLowerCase();
            if(linkType === 'textlink' && !linkDataItem.get('href')) {
                //This is a link that was created by the WRichText component and was deleted
                //The href value is empty - there is nothing to link it to
                //Error report is not sent since it's not interesting and happens A LOT!
                return false;
            }

            if(this.KNOWN_LINK_TYPES.indexOf(linkType) === -1) {
                errorInfo.message = 'Unknown link type: ' + linkType;
                LOG.reportError(wixErrors.LINK_RENDERING_FAILED, "wysiwyg.common.utils.LinkRenderer", "_verifyNodeAndData", JSON.stringify(errorInfo));
                return false;
            }

            return true;
        },

        renderLinkDataItemForPropertyPanel: function (linkDataItem) {
            var linkType = (linkDataItem && linkDataItem.getType) ? linkDataItem.getType().toLowerCase() : '';
            var dataManager = this._getPreviewDataManager();

            switch (linkType) {
                case "externallink":
                    return this._renderExternalLinkForPropertyPanel(linkDataItem, dataManager);
                case "pagelink":
                    return this._renderPageLinkForPropertyPanel(linkDataItem, dataManager);
                case "anchorlink":
                    return this._renderAnchorLinkForPropertyPanel(linkDataItem, dataManager);
                case "emaillink":
                    return this._renderEmailLinkForPropertyPanel(linkDataItem, dataManager);
                case "documentlink":
                    return this._renderDocumentLinkForPropertyPanel(linkDataItem, dataManager);
                case "logintowixlink":
                    return this._renderLoginToWixLinkForPropertyPanel(linkDataItem, dataManager);
                default:
                    return '';
            }
        },

        renderLinkDataItem: function (linkDataItem) {
            var linkType = (linkDataItem && linkDataItem.getType) ? linkDataItem.getType().toLowerCase() : '';
            var renderedURL = "";

            switch (linkType) {
                case "externallink":
                    renderedURL = this.renderExternalLink(linkDataItem);
                    break;
                case "pagelink":
                    renderedURL = this.renderPageLink(linkDataItem);
                    break;
                case "anchorlink":
                    renderedURL = this.renderAnchorLink(linkDataItem);
                    break;
                case "emaillink":
                    renderedURL = this.renderEmailLink(linkDataItem);
                    break;
                case "documentlink":
                    renderedURL = this.renderDocumentLink(linkDataItem);
                    break;
                case "logintowixlink":
                    renderedURL = this._renderLoginToWixLink(linkDataItem);
                    break;
            }

            return renderedURL;
        },

        removeRenderedLinkFrom: function(node, compLogic) {
            node.removeAttribute("href") ;
            node.removeAttribute("target") ;
            node.removeEvent(Constants.CoreEvents.CLICK, this._pageLinkOnClickHandler);
            node.removeEvent(Constants.CoreEvents.CLICK, this._disableLinkClickPropagation);
            node.removeEvent(Constants.CoreEvents.CLICK, this._externalLinkInPreviewClickHandler);
            this._setLinkState(false, node, compLogic);
        },

        renderExternalLink: function (linkDataItem) {
            var url = linkDataItem.get('url');
            if (!url || !W.Utils.isValidUrl(url)) {
                return '';
            }
            return url;
        },

        _renderExternalLinkForPropertyPanel: function(linkDataItem, dataManager){
            return this.renderExternalLink(linkDataItem);
        },

        renderPageLink: function(linkDataItem, showHomePageHash) {
            var pageId = linkDataItem.get("pageId");
            var pageAddress;
            var pageData;
            var indexOfPageId;
            var externalBaseUrl = this._getSiteUrl();

            if(!pageId){
                var error = 'Link with id "' + linkDataItem.get('id') + '" refers to a non existing page';
                LOG.reportError(wixErrors.LINK_RENDERING_FAILED, "LinkRenderer", "renderPageLink", error);
                return;
            }

            //externalBaseUrl doesn't exist in editor & renderer (preview mode) models
            //If it doesn't exist - just use the relative !#<pageAddress>/<pageId> (same as other pages)
            if(this._isHomePage(pageId) && externalBaseUrl && !showHomePageHash) {
                return externalBaseUrl;
            }

            pageData = this.resources.W.Data.getDataByQuery(pageId);
            if (pageData) {
                pageAddress = pageData.get("pageUriSEO");
            }
            else {  //Check if it's a legacy link. Example: the pageId (previously the href field) holds: #!Services|ca4p
                //Extracting the page id in the old format
                pageId = (pageId.indexOf(this.PAGE_LINK_PREFIX) === 0) ? pageId.substr(2) : pageId;
                indexOfPageId = pageId.lastIndexOf("|");
                pageId = pageId.substr(indexOfPageId + 1);

                if(pageId && pageId.indexOf("#") === 0) {
                    pageId = pageId.substr(1);
                }

                //Tying (again) to get the page address
                pageData = this.resources.W.Data.getDataByQuery('#' + pageId);
                if (pageData) {
                    pageAddress = pageData.get("pageUriSEO");
                }
            }

            if(pageId && pageId.indexOf("#") === 0) {
                pageId = pageId.substr(1, pageId.length) ;
            }

            return this.PAGE_LINK_PREFIX + ((pageAddress) ? (pageAddress + '/') : '') + pageId ;
        },

        renderAnchorLink: function(linkDataItem, showHomePageHash) {
            var pageId = linkDataItem.get("pageId") || '',
                anchorDataId = linkDataItem.get("anchorDataId") || '',
                anchorData = anchorDataId.indexOf('SCROLL') < 0 && this.resources.W.Data.getDataByQuery(anchorDataId),
                anchorName = (!!anchorData && anchorData.get('name')) || linkDataItem.get("anchorName") || '',
                pageData = this.resources.W.Data.getDataByQuery(pageId),
                pageAddress = (!!pageData && pageData.get("pageUriSEO")) || 'Master';

            if(!pageId){
                return;
            }

            if(pageId && pageId.indexOf("#") === 0) {
                pageId = pageId.substr(1, pageId.length) ;
            }

            if(anchorDataId && anchorDataId.indexOf("#") === 0) {
                anchorDataId = anchorDataId.substr(1, anchorDataId.length) ;
            }

            return this.PAGE_LINK_PREFIX + (pageAddress ? (pageAddress + '/') : '') + pageId + "/" + anchorName + "/" + anchorDataId;
        },

        _renderPageLinkForPropertyPanel: function(linkDataItem, dataManager) {
            var pageId = linkDataItem.get("pageId");
            var pageData = dataManager.getDataByQuery(pageId);
            if (pageData) {
                return "Page - " + pageData.get("title");
            } else {
                return this.renderPageLink(linkDataItem);
            }
        },

        _renderAnchorLinkForPropertyPanel: function(linkDataItem, dataManager) {
            var pageId = linkDataItem.get("pageId");
            var pageData = pageId ? dataManager.getDataByQuery(pageId) : null;
            var anchorDataId;
            var anchorData;
            var anchorName;
            var pageName;

            if(pageData){
                anchorDataId = linkDataItem.get("anchorDataId");
                anchorData = anchorDataId.indexOf('SCROLL') < 0 && dataManager.getDataByQuery(anchorDataId);
                anchorName = (anchorData && anchorData.get('name')) || linkDataItem.get("anchorName");
                pageName = pageData.get('title');

                return 'Anchor (' + anchorName + (pageName ? (', Page: ' + pageName) : '') + ')';
            } else {
                return '';
            }
        },

        renderEmailLink: function(linkDataItem) {
            var mailAddress = linkDataItem.get('recipient').trim() || '';
            var subject = linkDataItem.get('subject');
            var body = linkDataItem.get('body');

            if (mailAddress && mailAddress.indexOf(this.MAILTO_PREFIX) != 0) {
                mailAddress = this.MAILTO_PREFIX + mailAddress;
            }
            if (mailAddress && subject) {
                mailAddress += '?subject=' + subject;
            }
            if (mailAddress && body) {
                mailAddress += ((subject) ? '&' : '?') + 'body=' + body;
            }

            return mailAddress;
        },

        _renderEmailLinkForPropertyPanel: function(linkDataItem, dataManager) {
            var mailAddress = linkDataItem.get('recipient').trim();
            if (mailAddress) {
                return 'Email - ' + mailAddress;
            }

            return '';
        },

        renderDocumentLink: function(linkDataItem) {
            var docUri = linkDataItem.get('docId');
            var isPdf = this._isPdfDocument(docUri);

            //Don't send the document name for PDFs - so that will be opened in new tab (instead of downloaded)
            return this.MEDIA_STATIC_URL + docUri + ((isPdf) ? '' : ('?dn=%22' + linkDataItem.get("name") + '%22')); // %22 - encodeURIComponent('"'), this is for filenames with spaces in them
        },

        _renderDocumentLinkForPropertyPanel: function(linkDataItem, dataManager) {
            return "Document - " + linkDataItem.get("name");
        },

        _renderLoginToWixLink: function (linkDataItem){
            return '#';  //renderedURL (there is no url to render for this type of link)
        },

        _renderLoginToWixLinkForPropertyPanel: function(linkDataItem, dataManager) {
            return "Login / Signup Dialog";
        },

        _setLinkTarget: function(node, linkDataItem) {
            var target = null;
            var linkType = linkDataItem.getType();
            linkType = (linkType) ? linkType.toLowerCase() : '';
            var isViewerInsideEditor = this._isViewerInsideEditor();

            switch (linkType) {
                case "externallink":
                    if (isViewerInsideEditor && this._isExternalLinkWithSameTabTarget(linkDataItem)) {
                        this._handleExternalLinkInPreviewFrame(node);
                    } else {
                        target = linkDataItem.get('target') || this.NEW_TAB_TARGET;
                    }
                    break;
                case "pagelink":
                    this._handlePageLink(node, linkDataItem);
                    target = this.SAME_TAB_TARGET;
                    break;
                case "anchorlink":
                    this._handleAnchorLink(node, linkDataItem);
                    break;
                case "emaillink":
                    target = this.SAME_TAB_TARGET;
                    break;
                case "documentlink":
                    target = this.NEW_TAB_TARGET;
                    break;
                case "logintowixlink":
                    this._handleLoginToWixLink(node, linkDataItem);
                    break;
                default:
                    break;
            }

            if (target !== null) {
                this._setNodeTarget(node, target);
            }
        },

        _handlePageLink: function (node, linkDataItem) {
            //We don't want to use the native href because it's slow
            //We want a JS click event handler to do the job (and prevent the default href behaviour)
            node.addEvent(Constants.CoreEvents.CLICK, this._pageLinkOnClickHandler);
        },

        _handleAnchorLink: function (node, linkDataItem) {
            node.addEvent(Constants.CoreEvents.CLICK, this._anchorLinkOnClickHandler);
        },

        _pageLinkOnClickHandler: function (ev) {
            var viewerManager = this._getViewerManager();

            //Get the link node
            var linkNode = (ev.event.currentTarget) ? ev.event.currentTarget : this._getParentLinkNode(ev.target);
            if(!linkNode || !linkNode.getAttribute) {
                return true;  //Nothing we can do - continue to bubble the event
            }
            var href = linkNode.getAttribute('href');
            var pageId;
            var siteUrl = this._getSiteUrl();

            if(href === siteUrl) {
                pageId = viewerManager.getHomePageId();
            }
            else if(href && href.indexOf('#!') === 0) {  //Hash of page
                if(href.indexOf('/') > -1) {
                    pageId = href.substr(href.lastIndexOf('/') + 1);  //Removing the page address
                }
                else if(href.indexOf('|') > -1) {
                    pageId = href.substr(href.lastIndexOf('|') + 1);  //Legacy links format
                }
                else {  //No page address
                    pageId = href.substr(2);  //Remove the !#
                }
            }

            if(pageId){
                if(pageId[0] === '#') {
                    pageId = pageId.substr(1);
                }
                viewerManager.goToPage(pageId);
            }

            ev.preventDefault();
        },

        _anchorLinkOnClickHandler: function (ev) {
            var viewerManager = this._getViewerManager(),
                linkNode = ev.event.currentTarget || this._getParentLinkNode(ev.target);

            if(!linkNode || !linkNode.getAttribute) {
                return true;
            }
            var href = linkNode.getAttribute('href'),
                pageId, anchorDataId,
                siteUrl = this._getSiteUrl(),
                hrefParts,
                currentPageId = this._getViewerManager().getCurrentPageId();

            if(href === siteUrl) {
                pageId = viewerManager.getHomePageId();
            } else if(href && href.indexOf('#!') === 0) {  //Hash of page
                hrefParts = href.split('/');
                if(hrefParts.length === 4) {
                    pageId = hrefParts[1];
                    anchorDataId = hrefParts[3];
                } else {  //No page address
                    pageId = hrefParts[0].substr(2);  //Remove the !#
                }
            }

            if(pageId){
                if(pageId[0] === '#') {
                    pageId = pageId.substr(1);
                }

                sessionStorage.setItem('anchorDataId', anchorDataId);

                if(pageId === currentPageId || pageId === 'SITE_STRUCTURE'){
                    this.resources.W.Commands.executeCommand('WViewerCommands.SamePageScrollAnchor', {});
                } else {
                    viewerManager.goToPage(pageId);
                }
            }

            ev.preventDefault();
        },

        _getParentLinkNode: function (node) {
            //stupid IE8 doesn't have currentTarget, and stupid mootools doesn't add it.
            //So we go up the DOM tree and look for the first anchor node (with href attribute)
            //We know it must exist - otherwise the _pageLinkOnClickHandler wouldn't have been called
            var parentLinkNode = node;
            while(!parentLinkNode.getAttribute('href')) {
                parentLinkNode = parentLinkNode.parentNode;
            }
            return parentLinkNode;
        },

        _handleLoginToWixLink: function (node, linkDataItem){
            node.addEvent("click", function() {
                if (!window['animateForm']) {  //AnimatedForm is defined in login.js
                    return;
                }

                var postLoginUrl = linkDataItem.get('postLoginUrl') || '';
                var postSignupUrl = linkDataItem.get('postSignupUrl') || '';
                var type = linkDataItem.get('dialog');
                var htmlDimming = "HTML";

                if (postSignupUrl.indexOf('ifcontext') !== -1){
                    var paramObj = this.resources.W.Utils.getQueryStringParamsAsObject();
                    var target = '';
                    _.forOwn(paramObj, function(value, key) {
                        if (key.toLowerCase() === 'ifcontext') {
                            target = value.replace('#', '');
                            if (/^[a-zA-Z0-9]+$/.test(target)) {
                                postSignupUrl = postSignupUrl.replace('{ifcontext}', target);
                            } else {
                                postSignupUrl = postSignupUrl.replace('{ifcontext}', 'illegalContextValue');
                            }
                        }
                    });
                }

                var isSessionValid = window['userApi'] ? window["userApi"].isSessionValid() : false ;
                if (!isSessionValid) {
                    window['animateForm']['callForm']([ postSignupUrl, postLoginUrl, type, htmlDimming]);
                } else if (postLoginUrl) {
                    window.location.href = postLoginUrl;
                    return false;
                }
            }.bind(this));
        },

        _handleExternalLinkInPreviewFrame: function (node) {
            node.removeAttribute("href");
            node.removeAttribute("target");

            node.addEvent('click', this._externalLinkInPreviewClickHandler);
        },

        _externalLinkInPreviewClickHandler: function (ev) {
            ev.preventDefault();
            var params = { component: ev.target };
            this.resources.W.Commands.executeCommand('linkableComponent.navigateSameWindow', params, this);
        },

        _isViewerInsideEditor: function () {
            return this.resources.W.Config.env.$isEditorViewerFrame;
        },

        _getPreviewDataManager: function() {
            return W.Preview.getPreviewManagers().Data;
        },

        _getViewerManager: function() {
            if(this.resources.W.Config.env.$isEditorFrame) {
                return W.Preview.getPreviewManagers().Viewer;
            } else {
                return W.Viewer;
            }
        },

        _getSiteUrl: function () {
            return this.resources.W.Config.getExternalBaseUrl();
        },

        _isExternalLinkWithSameTabTarget: function (linkDataItem) {
            var linkType = linkDataItem.getType() || "";
            linkType = linkType.toLowerCase();
            var linkTarget = linkDataItem.get('target');
            return (linkType === "externallink" && linkTarget === this.SAME_TAB_TARGET);
        },

        _setNodeTarget: function(node, target) {
            node.setAttribute("target", target) ;
        },

        _isPdfDocument: function (documentUri) {
            var documentUriArray = documentUri.split('.'),
                fileExtension = documentUriArray[documentUriArray.length - 1];

            return (fileExtension && fileExtension.toLowerCase() === 'pdf');
        },

        _isHomePage: function(pageId) {
            var viewerManager = this._getViewerManager();

            var pageIdWithoutHash = (pageId.indexOf('#') === 0) ? pageId.substr(1) : pageId;

            return (viewerManager.getHomePageId() === pageIdWithoutHash);
        },

        //TODO: there is probably already a method that knows how to do this..
        sanitizeExternalLink: function(link){
            var linkUrl = link.get('href');
            if(linkUrl) {
                // if url has no valid prefix
                if (linkUrl.indexOf('http://') !== 0 && linkUrl.indexOf('https://') !== 0) {
                    if (linkUrl.indexOf('telnet://') !== 0 && linkUrl.indexOf('ftp://') !== 0 && linkUrl.indexOf('mailto:') !== 0) {

                        if (linkUrl.indexOf('@') > 0)
                            link.set('href','mailto:' + linkUrl);

                        else if (linkUrl.indexOf('www') === 0 || (linkUrl.indexOf('www') !== 0 && linkUrl.indexOf("#") !== 0))
                            link.set('href','http://' + linkUrl);

                    }
                }
            }
        }
    });
});
