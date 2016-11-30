define.experiment.Class('wysiwyg.common.utils.LinkRenderer.CustomSiteMenu', function (classDefinition, experimentStrategy) {
    /** @type bootstrap.managers.classmanager.ClassDefinition */
    var def = classDefinition,
        strategy = experimentStrategy;

    def.methods({

        initialize: strategy.after(function (viewerManager, dataManager) {
            this._viewerManager = viewerManager;
            this._dataManager = dataManager;
        }),

        renderLinkDataItemForCustomMenu: function (linkDataItem) {
            var linkType = (linkDataItem && linkDataItem.getType) ? linkDataItem.getType().toLowerCase() : '';

            switch (linkType) {
                case "externallink":
                    return this._renderExternalLinkForCustomMenu(linkDataItem);
                case "pagelink":
                    return this._renderPageLinkForCustomMenu(linkDataItem);
                case "anchorlink":
                    return this._renderAnchorLinkForCustomMenu(linkDataItem);
                case "emaillink":
                    return this._renderEmailLinkForCustomMenu(linkDataItem);
                case "documentlink":
                    return this._renderDocumentLinkForCustomMenu(linkDataItem);
                case "logintowixlink":
                    return this._renderLoginToWixLinkForCustomMenu();
                default:
                    return '';
            }
        },

        _renderExternalLinkForCustomMenu: function(linkDataItem){
            return this.renderExternalLink(linkDataItem);
        },

        _renderPageLinkForCustomMenu: function(linkDataItem) {
            var pageId = linkDataItem.get("pageId"),
                pageData = this._getDataByQuery(pageId);

            if (pageData) {
                return pageData.get("title");
            }

            return this.renderPageLink(linkDataItem);
        },

        _renderAnchorLinkForCustomMenu: function(linkDataItem) {
            var anchorDataId = linkDataItem.get("anchorDataId"),
                anchorData = anchorDataId.indexOf('SCROLL') < 0 && this._getDataByQuery(anchorDataId);

            return anchorData ? anchorData.get('name') : linkDataItem.get("anchorName");
        },

        _renderEmailLinkForCustomMenu: function(linkDataItem) {
            return linkDataItem.get('recipient').trim();
        },

        _renderDocumentLinkForCustomMenu: function(linkDataItem) {
            return linkDataItem.get("name");
        },

        _renderLoginToWixLinkForCustomMenu: function() {
            return "Login / Signup Dialog";
        },

        _getViewerManager: function() {
            if(this._viewerManager){
                return this._viewerManager;
            }

            if(this.resources.W.Config.env.$isEditorFrame) {
                return W.Preview.getPreviewManagers().Viewer;
            }

            return W.Viewer;
        },

        _getPreviewDataManager: function() {
            if(this._dataManager){
                return this._dataManager;
            }
            return W.Preview.getPreviewManagers().Data;
        },

        _getDataByQuery: function(id){
            return this._getPreviewDataManager().getDataByQuery(id);
        },

        renderLink: function (node, linkDataItem, compLogic, handleAll) {
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
            this._setLinkTarget(node, linkDataItem, handleAll);
            this._setLinkState(!!renderedURL, node, compLogic);

            if(compLogic && compLogic._NO_LINK_PROPAGATION) {
                node.addEvent("click", this._disableLinkClickPropagation);
            }
        },

        _setLinkTarget: function(node, linkDataItem, handleAll) {
            var target = null;
            var linkType = linkDataItem.getType();
            linkType = (linkType) ? linkType.toLowerCase() : '';
            var isViewerInsideEditor = this._isViewerInsideEditor();

            switch (linkType) {
                case "externallink":
                    if (isViewerInsideEditor && this._isExternalLinkWithSameTabTarget(linkDataItem)) {
                        this._handleExternalLinkInPreviewFrame(node);
                    } else {
                        if(handleAll){
                            node.addEvent(Constants.CoreEvents.CLICK, this._genericLinkOnClickHandler);
                        }
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
                    if(handleAll){
                        node.addEvent(Constants.CoreEvents.CLICK, this._genericLinkOnClickHandler);
                    }
                    target = this.SAME_TAB_TARGET;
                    break;
                case "documentlink":
                    if(handleAll){
                        node.addEvent(Constants.CoreEvents.CLICK, this._genericLinkOnClickHandler);
                    }
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

        _genericLinkOnClickHandler: function(ev){
            var linkNode = ev.event.currentTarget || this._getParentLinkNode(ev.target),
                href = linkNode.getAttribute('href'),
                target = linkNode.getAttribute('target');

            if(href){
                window.open(href, target);
            }
        },

        _handleExternalLinkInPreviewFrame: function (node) {
            node.removeAttribute("href");
            node.removeAttribute("target");

            node.addEvent('click', this._externalLinkInPreviewClickHandler);
            node.removeEvent('click', this._genericLinkOnClickHandler);
        }
    });
});
