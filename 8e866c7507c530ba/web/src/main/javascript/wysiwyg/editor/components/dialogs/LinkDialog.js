define.component('wysiwyg.editor.components.dialogs.LinkDialog', function (componentDefinition) {


    /** @type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('wysiwyg.editor.components.panels.base.AutoPanel');
    def.utilize(['wysiwyg.common.utils.LinkRenderer']); // import linkable constants
    def.resources(['W.UndoRedoManager', 'W.Resources', 'W.Utils', 'W.Data', 'W.Preview', "W.Editor"]);
    def.binds(['_setState', '_onDialogClosing', '_initValidators', '_onRemoveLink', 'validateEmail', 'validateWebUrl', '_createFields', '_onBackBtnClick', '_generateSortedPageArray','_generatePageArray','_sortPageArray',
        '_getInitialComboBoxPageId','_createPageComboBox', '_updateDataOnAnchorChange', '_updateCurrentAnchorComboboxLogic', '_bindAnchorsToComboBox']);
    def.traits(['core.editor.components.traits.DataPanel']);
    def.skinParts({
        back: {type: 'wysiwyg.editor.components.WButton'},
        content: {type: 'htmlElement'}
    });

    def.statics({
        LINK_TARGET: {
            NEW_WINDOW: "_blank",
            SAME_WINDOW: "_self"
        },
        EVENTS: {
            ON_DIALOG_CLOSE: "onDialogClosing"
        },
        DIALOG_CLOSE_STATES: {
            OK: "ok",
            REMOVE: "remove"
        },
        HELP_NODES: {
            ANCHOR: "/node/21781"
        },
        SITE_STRUCTURE: "SITE_STRUCTURE",
        ANCHOR_NAMESPACE: "wysiwyg.common.components.anchor.viewer.Anchor",
        DIALOG_TEXTS: {
            AnchorLink: {
                title: 'LINK_DIALOG_ANCHOR_TITLE',
                desc: 'Anchor_LINK_DIALOG_INFO'
            },
            AnchorLink_bottom: {
                title: 'Anchor_DIALOG_PAGE_BOTTOM_TITLE',
                desc: 'Anchor_DIALOG_PAGE_BOTTOM_DETAILS',
                content: '',//will be populated in initialize
                name: '',//will be populated in initialize
                id: 'SCROLL_TO_BOTTOM'
            },
            AnchorLink_top: {
                title: 'Anchor_DIALOG_PAGE_TOP_TITLE',
                desc: 'Anchor_DIALOG_PAGE_TOP_DETAILS',
                content: '',//will be populated in initialize
                name: '',//will be populated in initialize
                id: 'SCROLL_TO_TOP'
            }
        }
    });

    def.methods({
        initialize: function (compId, viewNode, args) {
            this.parent(compId, viewNode, args);
            this._dialogParts = [];
            this._closeDialogCB = args.closeCallback;
            this._previewData = args.data;
            this._dialogWindow = args.dialogWindow;
            this._linkDataId = args.linkDataId || null;  //Rich Text component passes pre-generated id
            this._viewerDataManager = this._getViewerDataManager();
            this._dataTypes = this._getSchemaDataTypes();
            this._state = this._getPreviewState();
            this.webInput = null;

            this.DIALOG_TEXTS.AnchorLink_bottom.content = this.resources.W.Resources.getCur('Anchor_DIALOG_PAGE_BOTTOM_DESC');
            this.DIALOG_TEXTS.AnchorLink_bottom.name = this.resources.W.Resources.getCur('LINK_DLG_SCROLL_TO_BOTTOM');
            this.DIALOG_TEXTS.AnchorLink_top.content = this.resources.W.Resources.getCur('Anchor_DIALOG_PAGE_BOTTOM_DESC');
            this.DIALOG_TEXTS.AnchorLink_top.name = this.resources.W.Resources.getCur('LINK_DLG_SCROLL_TO_TOP');

            this._initValidators();

            //Bind the close handler (args.callback) to the window close event
            if (this._onDialogClosing) {
                this._dialogWindow.addEvent(this.EVENTS.ON_DIALOG_CLOSE, this._onDialogClosing);
            }
        },

        _onAllSkinPartsReady: function () {
            this.parent();
            this._skinParts.back.setIcon('icons/sidepanel_top_arrows.png', null, {x: 0, y: 0});
            this._skinParts.back.setLabel(this.resources.W.Resources.getCur('LINK_DLG_BACK_TO_OPTIONS'));
            this._skinParts.back.addEvent(Constants.CoreEvents.CLICK, this._onBackBtnClick);
        },

        _onDialogClosing: function (e) {
            var dataItem = null;

            if (e.result && e.result.toLowerCase() !== this.DIALOG_CLOSE_STATES.REMOVE) {
                dataItem = this._updateLinkOnDialogClose();
                dataItem = (dataItem) ? dataItem.dataObject : null;
            }

            //Clear dialog data
            this._data = null;

            if (this._closeDialogCB) {
                this._closeDialogCB(this._state, dataItem, e);
            }
        },

        _getSchemaDataTypes: function () {
            var dataTypesData = this.resources.W.Data.getDataByQuery("#LINK_BUTTONS_TYPE");
            var dataTypes = dataTypesData._data.dataSchemaByType;
            return dataTypes;
        },

        _getPreviewState: function () {
            var previewLinkDataItem = this._getPreviewLinkDataItem(),
                anchorDataId;

            if(!previewLinkDataItem || !this._dataTypes){
                return Constants.LinkState.NO_LINK;
            }

            anchorDataId = previewLinkDataItem.get('anchorDataId');

            switch(anchorDataId){
                case 'SCROLL_TO_TOP':
                    return this._dataTypes.ANCHOR_TOP;
                case 'SCROLL_TO_BOTTOM':
                    return this._dataTypes.ANCHOR_BOTTOM;
                default:
                    return previewLinkDataItem.getType();
            }
        },

        _updateLinkOnDialogClose: function () {
            var linkDataObj = this._getLinkData();
            if(!linkDataObj){
                return null;
            }
            var addedItem = this._addNewLinkDataItem(linkDataObj, this._viewerDataManager);
            if (!addedItem) {
                return null;
            }
            var undoRedoManager = this.resources.W.UndoRedoManager;
            if (undoRedoManager.isActionSupportedByURM) {
                undoRedoManager.startTransaction();
                this._setLinkIdAsRefToData(addedItem.id);
                undoRedoManager.endTransaction();
            } else {
                var idRefToSet = addedItem.id || "";
                this._setLinkIdAsRefToData(idRefToSet);
                undoRedoManager.isActionSupportedByURM = true;
            }
            return addedItem;
        },

        _getLinkData:function(){
            var dialogDataItem = this.getDataItem();
            if (!dialogDataItem) {
                return null;
            }
            if(dialogDataItem.getType() === 'AnchorLink' && dialogDataItem.get('anchorDataId') === 'XXX'){
                return null;
            }
            var linkDataObj = dialogDataItem ? dialogDataItem.getData() : null;
            if(!this._isLinkDataVerified(linkDataObj)){
                this._removeLink();
                return null;
            } else if (this.webInput && linkDataObj.url) {
                this.webInput.setValue(linkDataObj.url, false);
            }
            return linkDataObj;
        },

        _addNewLinkDataItem: function (linkDataObj, viewerDataManager) {
            var addedItem = null;
            if(this._linkDataId) {  //Rich Text component passes pre-generated id
                var dataObj = viewerDataManager.addDataItem(this._linkDataId, linkDataObj);
                addedItem = {'id': this._linkDataId, 'dataObject': dataObj};
            }
            else {
                addedItem = viewerDataManager.addDataItemWithUniqueId("", linkDataObj);
            }
            return addedItem;
        },

        _isLinkDataVerified:function(linkDataObj){
            if(!linkDataObj){
                return false;
            }
            var isVerified = true;
            switch(linkDataObj.type){
                case this._dataTypes.PAGE:
                    isVerified = !!linkDataObj.pageId;
                    break;
                case this._dataTypes.WEBSITE:
                    isVerified = !!linkDataObj.url;
                    if(isVerified){
                        this._addHttpProtocolToUrlAndEncode(linkDataObj);
                    }
                    break;
                case this._dataTypes.DOCUMENT:
                    isVerified = !!linkDataObj.docId;
                    break;
                case this._dataTypes.EMAIL:
                    isVerified = !!linkDataObj.recipient;
                    break;
                default:
                    break;
            }
            return isVerified;
        },

        _setLinkIdAsRefToData: function (linkId) {
            if (!linkId) {
                return null;
            }
            linkId = this._fixLinkReferenceIfNeeded(linkId);
            this._previewData.set("link", linkId, false);
        },

        _onRemoveLink: function () {
            this._removeLink();
            this._dialogWindow.endDialog(this.DIALOG_CLOSE_STATES.REMOVE);
        },

        _removeLink:function(){
            this._setState(Constants.LinkState.NO_LINK);
            var dontFireDataChangeEvent = false;
            this._previewData.set("link", null, dontFireDataChangeEvent);
        },

        _onBackBtnClick: function() {
            var dialogDataItem = this.getDataItem();
            this._existingAnchorComboBoxLogic = null;
            this._resetAnchorMap(null);
            this._setState(Constants.LinkState.NO_LINK);
        },

        _setState: function (newState) {
            if (!newState) { return; }
            this._state = newState;
            this._createFields();
        },

        _getViewerDataManager: function () {
            return this.resources.W.Preview.getPreviewManagers().Data;
        },

        _addRemoveLinkButtonToGroup: function (group) {
            group.addBreakLine('20px');
            group.addButtonField("", this.resources.W.Resources.getCur('LINK_DLG_REMOVE_LINK'), null, null, 'linkRight')
                .addEvent(Constants.CoreEvents.CLICK, this._onRemoveLink);
        },

        _createFields: function () {
            this._clearDialogParts();

            switch (this._state) {
                case this._dataTypes.PAGE:
                    this._createPageDialog();
                    break;
                case this._dataTypes.WEBSITE:
                    this._createWebSiteDialog();
                    break;
                case this._dataTypes.DOCUMENT:
                    this._createDocumentDialog();
                    break;
                case this._dataTypes.EMAIL:
                    this._createEmailDialog();
                    break;
                case this._dataTypes.LOGIN:
                    this._createLoginToWixDialog();
                    break;
                case this._dataTypes.ANCHOR:
                    this._clearDialogParts();
                    this._createAnchorDialog();
                    break;
                case this._dataTypes.ANCHOR_BOTTOM:
                    this._clearDialogParts();
                    this._createSingleAnchorDialog(this._state);
                    break;
                case this._dataTypes.ANCHOR_TOP:
                    this._clearDialogParts();
                    this._createSingleAnchorDialog(this._state);
                    break;
                case Constants.LinkState.NO_LINK:
                    this._createLinkDialog();
                    break;
                default:  //When clicking the back button - state is the click event object
                    this._createLinkDialog();
                    break;
            }
        },

        _initValidators: function () {
            this._validators = {};
            this._validators.WEBSITE = [this.validateWebUrl];
            this._validators.EMAIL = [this.validateEmail];
        },

        _showBackButton: function () {
            this._skinParts.back.uncollapse();
        },

        _hideBackButton: function () {
            //this._disableOkButton();
            this._skinParts.back.collapse();
        },

        _createLinkDialog: function () {
            this._dialogWindow.setTitle(this.resources.W.Resources.getCur('LINK_DIALOG_DEFAULT_TITLE'));
            this._dialogWindow.setDescription(this.resources.W.Resources.getCur('LINK_DIALOG_DESCRIPTION'));

            this._hideBackButton();

            var dialog = this;
            var content = this.addInputGroupField(function (panel) {
                this.resources.W.Data.getDataByQuery("#LINK_BUTTONS_TYPE", function (dialogButtons) {
                    var items = dialogButtons.get('items');
                    var btn, label;

                    this.setNumberOfItemsPerLine(2, '5px');
                    items.forEach(function (item) {
                        label = this.resources.W.Resources.getCur(item.buttonLabel);
                        btn = this.addButtonField(null, label, null, {
                                iconSrc: 'icons/link_icons.png',
                                iconSize: {width: 16, height: 18},
                                spriteOffset: item.spriteOffset
                            }, null, '95px'
                        ).addEvent(Constants.CoreEvents.CLICK, function () {
                                var linkType = item.linkType;
                                panel._setState(dialog._dataTypes[linkType]);
                            }.bind(this));

                        if (item.onCreateCB) {
                            item.onCreateCB.apply(panel, [btn]);
                        }
                    }.bind(this));

                    //If the component data contains a link or a link was created by the dialog and not saved yet - show "remove link" button
                    if (dialog._isPreviewDataHasLink() || this._data) {
                        this.addBreakLine('20px');
                        this.setNumberOfItemsPerLine(1);
                        this.addButtonField("", this.resources.W.Resources.getCur('LINK_DLG_REMOVE_LINK'), null, null, 'linkRight')
                            .addEvent(Constants.CoreEvents.CLICK, panel._onRemoveLink);
                    }
                }.bind(this));
            });

            this._dialogParts.push(content);
        },

        _createPageDialog: function () {
            this._presetPageDialogData();
            this._setDialogTitleAndDescription(this._dialogWindow, 'LINK_DIALOG_PAGE_TITLE', '');

            this._enableOkButton();
            this._showBackButton();

            var self = this;
            this._getAllPageConfigurationsPromise()
                .then(function (pageConfigs) {
                    var pages = [];
                    var pagesOrder = self._getPagesOrder();
                    _.each(pageConfigs, function (config) {
                        if (config.canBeLinkedTo()) {
                            pages.push({
                                label: config.getPageTitle(),
                                value: "#" + config.getPageId()
                            });
                        }
                    });
                    pages.sort(function (a, b) {
                        var aI = pagesOrder.indexOf(a.value);
                        var bI = pagesOrder.indexOf(b.value);
                        return aI - bI;
                    });
                    pages.unshift({ label:"", value:"" });
                    var content = self.addInputGroupField(function (panel) {
                        var pagesCombo = this.addComboBoxField(self.resources.W.Resources.getCur('LINK_DLG_SELECT_PAGE'), pages).bindToField("pageId");
                        pagesCombo.setFocus();

                        // if there is no link, don't show "remove link" button
                        if (panel._isPreviewDataHasLink()) {
                            panel._addRemoveLinkButtonToGroup(this);
                        }
                    });
                    self._dialogParts.push(content);
                });
        },

        _createSingleAnchorDialog: function(type){
            this._setDialogTitleAndDescription(this._dialogWindow, this.DIALOG_TEXTS[type].title, this.DIALOG_TEXTS[type].desc);
            this._enableOkButton();
            this._showBackButton();

            this._data = this._createLinkDataItemByType(this._dataTypes.ANCHOR);
            this._data.set("pageId", '#' + this.SITE_STRUCTURE);
            this._data.set("anchorDataId", this.DIALOG_TEXTS[type].id);
            this._data.set("anchorName", this.DIALOG_TEXTS[type].name);

            this._dialogParts.push(
                this.addInputGroupField(function(panel){
                    this.addLabel(panel.DIALOG_TEXTS[type].content);
                })
            );
        },
        _createAnchorDialog: function () {
            var that = this;

            this._presetAnchorDialogData();
            this._setDialogTitleAndDescription(this._dialogWindow, this.DIALOG_TEXTS.AnchorLink.title, this.DIALOG_TEXTS.AnchorLink.desc);

            this._enableOkButton();
            this._showBackButton();

            this._getAllPageConfigurationsPromise()
                .then(function (pageConfigs) {
                    that._dialogParts.push(
                        that.addInputGroupField(function (panel) {
                            var currentEditingPageId = '#' + that.resources.W.Editor.getScopeNode().id,
                                pages = that._generateSortedPageArray(pageConfigs, currentEditingPageId),
                                initialComboBoxPageId = that._getInitialComboBoxPageId(currentEditingPageId, pages);

                            that._resetAnchorMap(pages);
                            that._createPageComboBox(this, initialComboBoxPageId, pages);
                            that._fetchAnchorsInPage(this, initialComboBoxPageId);

                            this.addBreakLine(10);
                            this.addInlineTextLinkField(null, null, that.resources.W.Resources.getCur('LINK_DLG_WHATS_AN_ANCHOR'), null, null, null, null, 'WEditorCommands.ShowHelpDialog', that.HELP_NODES.ANCHOR);
                        })
                    );

                    if (that.getDataItem().get('href')) {
                        that._addRemoveLinkButtonToGroup(this);
                    }
                })
                .done();
        },

        _getLinkablePagesData: function(){
            var pages = [
                {label: '', value: ''}
            ];

            var pagesData = W.Preview.getPreviewManagers().Data.getDataByQuery("#MAIN_MENU");
            var items = pagesData.getItems();
            var i, j, k, l, subItems;

            for (i = 0, l = items.length; i < l; i++) {
                this._insertItem(items[i], pages);
                subItems = items[i].get('items');
                for (j = 0, k = subItems.length; j < k; j++) {
                    this._insertItem(subItems[j], pages);
                }
            }
            return pages;
        },

        _createLoginToWixDialog: function() {
            this._presetLoginToWixDialogData();
            this._setDialogTitleAndDescription(this._dialogWindow, 'LINK_DIALOG_LOGIN_TITLE', '');

            this._showBackButton();

            var content = this.addInputGroupField(function (panel) {
                this.addInputField(panel.injects().Resources.getCur('LINK_DLG_TYPE_POST_LOGIN_URL'), '', undefined, undefined, null)
                    .bindToField("postLoginUrl");


                this.addInputField(panel.injects().Resources.getCur('LINK_DLG_TYPE_POST_SIGNUP_URL'), '', undefined, undefined, null)
                    .bindToField("postSignupUrl");

                this.addComboBoxField("Start With", [
                        { label: panel.injects().Resources.getCur('LINK_DLG_LOGIN_OPT_LOGIN_TAB'), value: "login" },
                        { label: panel.injects().Resources.getCur('LINK_DLG_LOGIN_OPT_SIGNUP_TAB'), value: "createUser" }
                    ],
                        "login", 2)
                    .bindToField("dialog");

            });

            this._dialogParts.push(content);
        },

        _presetPageDialogData: function () {
            var pageId = null;
            this._data = this._createLinkDataItemByType(this._dataTypes.PAGE);

            var previewLinkDataItem = this._getPreviewLinkDataItem();
            if (previewLinkDataItem) {
                pageId = previewLinkDataItem.get('pageId');
                if(!pageId){
                    return;
                }
                this._data.set("pageId", pageId);
            }
        },

        _presetWebsiteDialogData: function () {
            this._data = this._createLinkDataItemByType(this._dataTypes.WEBSITE);

            var previewLinkDataItem = this._getPreviewLinkDataItem();
            if (previewLinkDataItem) {
                var url = this._getRenderedExternalLink(previewLinkDataItem);
                var target = previewLinkDataItem.get("target");

                this._data.set("url", url);
                this._data.set("target", target);
            }
        },

        _presetDocumentDialogData: function () {
            this._data = this._createLinkDataItemByType(this._dataTypes.DOCUMENT);

            var docTitle = "";
            var previewLinkDataItem = this._getPreviewLinkDataItem();
            if (previewLinkDataItem) {
                docTitle = previewLinkDataItem.get("name") || docTitle;

                this._data.set("docId", previewLinkDataItem.get("docId") || '');
                this._data.set("name", docTitle);
            }

            return docTitle;
        },

        _presetEmailDialogData: function () {
            this._data = this._createLinkDataItemByType(this._dataTypes.EMAIL);

            var previewLinkDataItem = this._getPreviewLinkDataItem();
            if (previewLinkDataItem) {
                this._data.set("recipient", previewLinkDataItem.get('recipient') || '');
                this._data.set("subject", previewLinkDataItem.get('subject') || '');
            }
        },

        _presetLoginToWixDialogData: function() {
            this._data = this._createLinkDataItemByType(this._dataTypes.LOGIN);

            var previewLinkDataItem = this._getPreviewLinkDataItem();
            if (previewLinkDataItem) {
                this._data.set("postLoginUrl", previewLinkDataItem.get('postLoginUrl') || '');
                this._data.set("postSignupUrl", previewLinkDataItem.get('postSignupUrl') || '');
                this._data.set("dialog", previewLinkDataItem.get('dialog') || 'login');
            }
        },

        /**
         * Create a combobox for pages, attach it to inputGroupField and set pageId of DataItem to initialComboBoxPageId
         * */
        _createPageComboBox: function(inputGroupField, initialComboBoxPageId, pages){
            var that = this,
                pageComboBox = inputGroupField.addComboBoxField(this.resources.W.Resources.getCur('LINK_DLG_SELECT_PAGE_WITH_ANCHORS'), pages).bindToField("pageId").setFocus();

            this._currentSelectedPageId = initialComboBoxPageId;
            pageComboBox.addEvent(Constants.CoreEvents.INPUT_CHANGE, function (data) {
                var pageId = data.value;
                that._currentSelectedPageId = pageId;
                that._fetchAnchorsInPage(inputGroupField, pageId);
            });

            this.getDataItem().set('pageId', initialComboBoxPageId);
        },
        _generateSortedPageArray: function(pageConfigs, currentEditingPageId){
            return this._sortPageArray(this._generatePageArray(pageConfigs, currentEditingPageId));
        },

        _generatePageArray: function(pageConfigs, currentEditingPageId){
            var pages = [],
                that = this,
                isCompShownOnAllPages = currentEditingPageId === '#' + this.SITE_STRUCTURE,
                currentPageString = this.resources.W.Resources.getCur('LINK_DLG_CURRENT_PAGE');

            _.each(pageConfigs, function (config) {
                var pageId = '#' + config.getPageId(),
                    pageTitle = config.getPageTitle(),
                    pageTitlePostfix = pageId === currentEditingPageId ? ' (' + that.resources.W.Resources.getCur('LINK_DLG_YOU_ARE_HERE') + ')' : '';

                if (config.canBeLinkedTo()) {
                    pages.push(that._createComboBoxItem(pageTitle + pageTitlePostfix, pageId, {pageTitle: pageTitle}));
                }
            });

            return pages;
        },

        _getPagesOrder: function(){
            return _.map(this.resources.W.Preview.getPreviewManagers().Data.getDataByQuery('#MAIN_MENU').getAllItemRefIds(), function (o) {
                return "#" + o;
            });
        },

        _sortPageArray: function(pages){
            var pagesOrder = this._getPagesOrder();

            pages.sort(function (a, b) {
                var aI = pagesOrder.indexOf(a.value),
                    bI = pagesOrder.indexOf(b.value);
                return aI - bI;
            });

            return pages;
        },

        /**
         * Return the id of the page to be pre-selected in the combobox according.
         * 1. Give first priority to the page id of the current anchor link, if it exists.
         * 2. Give second priority to the current page in edit mode.
         * 3. Fallback to the first page in the list of pages.
         *
         * @param currentEditingPageId
         * @returns {string}
         * @private
         */
        _getInitialComboBoxPageId: function(currentEditingPageId, allPages){
            var currentLinkPageId = this.getDataItem().get('pageId');

            if(currentLinkPageId && currentLinkPageId !== '#' + this.SITE_STRUCTURE){
                return currentLinkPageId;
            }

            if(currentEditingPageId && currentEditingPageId !== '#' + this.SITE_STRUCTURE){
                return currentEditingPageId;
            }

            return allPages[0].value;
        },

        /**
         * If there's an existing anchor link,
         * preset the dialog's data item with its data.
         * */
        _presetAnchorDialogData: function () {
            var previewLinkDataItem = this._getPreviewLinkDataItem(),
                pageId = null,
                anchorDataId = null,
                anchorName;

            this._data = this._createLinkDataItemByType(this._dataTypes.ANCHOR);
            if (previewLinkDataItem && previewLinkDataItem.getType() === this._dataTypes.ANCHOR) {
                pageId = previewLinkDataItem.get('pageId');
                anchorDataId = previewLinkDataItem.get('anchorDataId');
                anchorName = previewLinkDataItem.get('anchorName');
                if(!this._doesPageExist(pageId)){
                    return;
                }
                this._data.set("pageId", pageId);
                this._data.set("anchorDataId", anchorDataId);
                this._data.set("anchorName", anchorName);
            }
        },
        _resetAnchorMap: function(pages){
            this.ANCHORS_MAP = {};
            if(pages){
                pages.forEach(function(page){
                    this.ANCHORS_MAP[page.value] = [];
                }.bind(this));
            }
        },

        /**
         * Lazy load list of anchors in a page.
         * If the list exists already, use it;
         * Else, load it asynchronously.
         *
         * Either way, replace the data in the anchor combobox with the one from the list.
         * */
        _fetchAnchorsInPage: function(inputGroupField, pageId){
            var pageNode, pageIdNoPrefix = pageId.substr(1), viewer = W.Preview.getPreviewManagers().Viewer,
                anchorsInCurrentPage = this._getAnchorMapForPage(pageId);

            if(anchorsInCurrentPage && anchorsInCurrentPage.length > 0){
                this._updateAnchorComboBox(inputGroupField, pageId);
                return;
            }

            pageNode = W.Preview.getCompByID(pageIdNoPrefix);
            viewer.loadPageById(pageIdNoPrefix, pageNode, function(pageData){
                var pageDom = pageData.pageNode,
                    anchorDomList = this._getAnchorDomByPage(pageDom);
                this._loadAnchorsListFromDom(inputGroupField, pageId, anchorDomList);
            }, this);
        },

        _loadAnchorsListFromDom: function(inputGroupField, pageId, anchorDomList){
            var anchorCount = anchorDomList.length,
                currentDataItem, currentName, currentId, i;

            for (i = 0; i < anchorCount; i++) {
                currentDataItem = anchorDomList[i].getLogic().getDataItem();
                currentName = currentDataItem.get('name');
                currentId = "#" + currentDataItem.getData().id;

                this._getAnchorMapForPage(pageId).splice(1, 0, this._createComboBoxItem(currentName, currentId));
            }

            this._updateAnchorComboBox(inputGroupField, pageId);
        },

        /**
         * Populate the anchor combobox with page's anchor.
         * */
        _updateAnchorComboBox: function (inputGroupField, pageId) {
            var that = this,
                anchorComboBox,
                currentLinkAnchorDataId = this.getDataItem().get('anchorDataId'),
                anchors = this._getAnchorMapForPage(pageId) || [this._createComboBoxItem()],
                firstAnchor = anchors[0] || this._createComboBoxItem();

            if (!currentLinkAnchorDataId) {
                this.getDataItem().set('anchorDataId', firstAnchor.value);
                this.getDataItem().set('anchorName', firstAnchor.extra.anchorTitle || firstAnchor.label);
            }

            if(!this._existingAnchorComboBoxLogic){
                anchorComboBox = inputGroupField.addComboBoxField(this.resources.W.Resources.getCur('LINK_DLG_SELECT_ANCHOR'), anchors).bindToField("anchorDataId");
                anchorComboBox.addEvent(Constants.CoreEvents.INPUT_CHANGE, this._updateDataOnAnchorChange);
                anchorComboBox.runWhenReady(function(logic){
                    that._updateCurrentAnchorComboboxLogic(logic);
                    that._bindAnchorsToComboBox(anchors);
                });

            } else {
                this._bindAnchorsToComboBox(anchors);
            }
        },
        _createComboBoxItem: function (label, value, extra) {
            return {label: label || '', value: value || '', extra: extra || {}};
        },
        _getNoAnchorsDataProvider: function(){
            this._noAnchorsDataProvider = this._noAnchorsDataProvider || this._createDataProvider([this._createComboBoxItem(this.resources.W.Resources.getCur('Anchor_NO_LINKS'),'XXX')]);
            return this._noAnchorsDataProvider;
        },
        _bindAnchorsToComboBox: function(anchors){
            window.setTimeout(function(){
                if(anchors.length === 0){
                    this._existingAnchorComboBoxLogic.bindToDataProvider(this._getNoAnchorsDataProvider());
                    this._existingAnchorComboBoxLogic.selectItemAtIndexAndUpdate(0);
                    this._existingAnchorComboBoxLogic.disable();
                } else {
                    this._existingAnchorComboBoxLogic.bindToDataProvider(this._createDataProvider(anchors));
                    this._existingAnchorComboBoxLogic.selectItemAtIndexAndUpdate(0);
                    this._existingAnchorComboBoxLogic.enable();
                }
            }.bind(this), 50);

        },

        /**
         * The Anchor combobox is bound to anchorDataId;
         * However, we also need to save the anchor's name,
         * So we listen to the combobox's INPUT_CHANGE event and update the Data Item accordingly
         * */
        _updateDataOnAnchorChange: function(data){
            var item = this._getAnchorInCurrentPageByValue(data.value);
            if(typeof item === 'object'){
                this.getDataItem().set('anchorName', item.extra.anchorTitle || item.label);
            }
        },
        _getAnchorMapForPage: function(pageId){
            return this.ANCHORS_MAP[pageId || this._currentSelectedPageId] || [];
        },
        _getAnchorMapKeyAtIndex: function(index){
            return Object.keys(this.ANCHORS_MAP)[index];
        },

        _getAnchorInPageByValue: function(pageId, anchorValue){
            var anchorsInPage = this._getAnchorMapForPage(pageId),
                anchor = _.find(anchorsInPage, function(item) {
                    return item.value === anchorValue;
                }) || anchorValue;

            return anchor;
        },

        _getAnchorInCurrentPageByValue: function(anchorValue){
            return this._getAnchorInPageByValue(null, anchorValue);
        },

        _updateCurrentAnchorComboboxLogic: function(logic){
            this._existingAnchorComboBoxLogic = logic;
        },

        _getPageDomById: function (pageId) {
            return this.resources.W.Preview.getCompByID(pageId);
        },

        _getAnchorDomShownOnAllPages: function(){
            var that = this,
                siteNode = this.resources.W.Preview.getSiteNode(),
                headerNode = this.resources.W.Preview.getHeaderContainer(),
                footerNode = this.resources.W.Preview.getFooterContainer(),

                anchorsInHeader = this._getAnchorDomByPage(headerNode),
                anchorsInFooter = this._getAnchorDomByPage(footerNode),
                anchorsShownAllAllPages = _.filter(siteNode.getChildren(), function(node){
                    return node.getAttribute('comp') === that.ANCHOR_NAMESPACE;
                }),

            //anchorsInHeader and anchorsInFooter are NodeLists so we need to convert them to arrays first
                allAnchors = _.union(_.toArray(anchorsInHeader), _.toArray(anchorsInFooter), anchorsShownAllAllPages);

            return allAnchors;
        },

        _getAnchorDomByPage: function (pageDom) {
            return pageDom ? pageDom.querySelectorAll('[comp="'+this.ANCHOR_NAMESPACE+'"]') : [];
        },

        _createDataProvider: function (compArgs) {
            var dataProvider = this.resources.W.Data.createDataItem({items: compArgs, type: "list"});
            return dataProvider;
        },

        _getScrollToStrings: function(){
            this.SCROLL_TO_STRINGS = this.SCROLL_TO_STRINGS || {
                top: {
                    name: this.resources.W.Resources.getCur('LINK_DLG_SCROLL_TO_TOP'),
                    ofName: this.resources.W.Resources.getCur('LINK_DLG_SCROLL_TO_TOP_OF'),
                    id: 'SCROLL_TO_TOP'
                },
                bottom: {
                    name: this.resources.W.Resources.getCur('LINK_DLG_SCROLL_TO_BOTTOM'),
                    ofName: this.resources.W.Resources.getCur('LINK_DLG_SCROLL_TO_BOTTOM_OF'),
                    id: 'SCROLL_TO_BOTTOM'
                }
            };

            return this.SCROLL_TO_STRINGS;
        },

        _setDialogTitleAndDescription: function (dialog, titleKey, description) {
            dialog.setTitle(this.resources.W.Resources.getCur(titleKey, ' '));
            dialog.setDescription(this.resources.W.Resources.getCur(description, ' '));
        },
        
        _createLinkDataItemByType: function (linkType) {
            return this.resources.W.Data.createDataItem({
                type: linkType
            }, linkType);
        },

        _getAllPageConfigurationsPromise: function () {
            var pagesData = this.resources.W.Preview.getPreviewManagers().Viewer.getPagesData();
            var configPromises = _.map(pagesData, function (page) {
                return this.resources.W.Editor.getPageConfigPromise(page.getData());
            }.bind(this));
            // wait for all page config promises to resolve
            return Q.all(configPromises).then(function (pagesConfigArr) {
                // zip the configs and their IDs
                return _.object(_.map(pagesConfigArr, function (config) { return config._pageData.id; }), pagesConfigArr);
            });
        },

        _getRenderedExternalLink: function (previewLinkDataItem) {
            var presetLinkValue = '';
            if (previewLinkDataItem && previewLinkDataItem.get("type") === this._dataTypes.WEBSITE) {
                presetLinkValue = (new this.imports.LinkRenderer()).renderExternalLink(previewLinkDataItem);
            }
            return presetLinkValue;
        },

        /**
         * Insert item into pages array
         * @param item
         * the item in #MAIN_MENU
         * @param pages
         * an initialized array to insert into
         */
        _insertItem: function (item, pages) {
            var ref = item.get('refId');
            var refItem = this.injects().Preview.getPreviewManagers().Data.getDataByQuery(ref);

            var title = refItem.get('title');
            var uriSeo = refItem.get('pageUriSEO');
            var id = refItem.get('id');

            // link example
            // #!My Gallery|gallery_page
            // [  /page SEO title or title   ]|[id]
            var val = '#!' + uriSeo + '/' + id;
            pages.push({label: title, value: val});
        },

        _createWebSiteDialog: function () {
            this._presetWebsiteDialogData();
            this._setDialogTitleAndDescription(this._dialogWindow, 'LINK_DIALOG_WEB_TITLE', '');

            this._showBackButton();
            var self = this;
            var content = this.addInputGroupField(function (panel) {
                self.webInput = this.addInputField(
                    panel.resources.W.Resources.getCur('LINK_DLG_TYPE_URL'),
                    panel.resources.W.Resources.getCur('LINK_DLG_URL_EXAMPLE'),
                    null,
                    "1200",
                    {validators: panel._validators.WEBSITE}
                ).bindToField("url");

                self.webInput.setFocus();
                self.webInput.setValue(this._data.get('url'), false);

                var options = [
                    {
                        label: panel.resources.W.Resources.getCur('LINK_DLG_OPT_OPEN_IN_NEW'),
                        value: panel.LINK_TARGET.NEW_WINDOW
                    },
                    {
                        label: panel.resources.W.Resources.getCur('LINK_DLG_OPT_OPEN_IN_SAME'),
                        value: panel.LINK_TARGET.SAME_WINDOW
                    }
                ];
                this.addRadioButtonsField("", options, panel.LINK_TARGET.NEW_WINDOW, "webSiteWindow").bindToField("target");

                // if there is no link, don't show "remove link" button
                if (panel._isPreviewDataHasLink()) {
                    panel._addRemoveLinkButtonToGroup(this);
                }
            });

            this._dialogParts.push(content);
        },

        _createDocumentDialog: function () {
            this._presetDocumentDialogData();
            this._setDialogTitleAndDescription(this._dialogWindow, 'LINK_DIALOG_DOC_TITLE', '');

            this._showBackButton();
            this._enableOkButton();

            var mgCallback = function(rawData) {
                this.getDataItem().setFields({
                    docId: rawData.uri,
                    name: rawData.title
                });
            };

            var content = this.addInputGroupField(function (panel) {
                this.addLabel(null, null, null, null, null, null, null, {'text-overflow':'ellipsis', 'overflow':'hidden', 'white-space':'nowrap', 'width':'100%'})
                    .bindToField('name')
                    .bindHooks(
                    function(data) { return data; },  //InputToData - Never used
                    function(docName) { return docName || panel._translate('NO_DOCUMENT_SELECTED'); }  //DataToInput - if no docName - show "No document selected"
                );

                this.addUserDocField(null, this._translate('CHOOSE_DOCUMENT'), mgCallback.bind(panel));

                // if there is a link, show "remove link" button
                if (panel._isPreviewDataHasLink()) {
                    panel._addRemoveLinkButtonToGroup(this);
                }
            });

            this._dialogParts.push(content);
        },

        _createEmailDialog: function () {
            this._presetEmailDialogData();
            this._setDialogTitleAndDescription(this._dialogWindow, 'LINK_DIALOG_EMAIL_TITLE', '');

            this._showBackButton();

            var content = this.addInputGroupField(function (panel) {
                var emailInput = this.addInputField(panel.resources.W.Resources.getCur('LINK_DLG_TYPE_EMAIL'),
                    panel.resources.W.Resources.getCur('LINK_DLG_EMAIL_EXAMPLE'),
                    undefined,
                    "1200",
                    {validators: panel._validators.EMAIL}).bindToField("recipient");
                emailInput.setFocus();

                this.addInputField(panel.resources.W.Resources.getCur('LINK_DLG_EMAIL_TITLE'),
                    panel.resources.W.Resources.getCur('LINK_DLG_EMAIL_TITLE_EXAMPLE'),
                    undefined,
                    "1200").bindToField("subject");

                // if there is no link, don't show "remove link" button
                if (panel._isPreviewDataHasLink()) {
                    panel._addRemoveLinkButtonToGroup(this);
                }
            });

            this._dialogParts.push(content);
        },

        _isPreviewDataHasLink: function () {
            return !!this._getPreviewLinkDataItem();
        },

        _getPreviewLinkDataItem: function () {
            var linkRef = (this._previewData && this._previewData.get("link")) || null;
            if (linkRef) {
                linkRef = this._fixLinkReferenceIfNeeded(linkRef);
                return this._viewerDataManager.getDataByQuery(linkRef);
            }
            return null;
        },

        _fixLinkReferenceIfNeeded: function (linkRef) {
            if (linkRef.indexOf("#") !== 0) {
                linkRef = "#" + linkRef;
            }
            return linkRef;
        },

        _clearDialogParts: function () {
            for (var i = 0; i < this._dialogParts.length; i++) {
                this._dialogParts[i].dispose();
            }
            this._dialogParts = [];
        },

        validateWebUrl: function (value) {
            if (this.resources.W.Utils.isValidUrl(value)) {
                this._enableOkButton();
                return false;
            }

            //this._disableOkButton();
            return this.injects().Resources.getCur('LINK_DLG_BAD_URL');
        },

        _enableOkButton: function () {
            if (this._dialogWindow && this._dialogWindow._buttonsMap.OK) {
                this._dialogWindow._buttonsMap.OK.getLogic().enable();
            }
        },

        validateEmail: function (value) {
            var isEmail = this.resources.W.Utils.isValidEmail(value);
            if (isEmail) {
                this._enableOkButton();
                return false;
            }

            //this._disableOkButton();
            return this.injects().Resources.getCur('LINK_DLG_BAD_EMAIL');
        },

        _addHttpProtocolToUrlAndEncode: function (dataItem) {
            var url = encodeURI((dataItem.url || '').trim());
            if (url && !/^(?:https?|ftp):\/\//.test(url)) {  // if no protocol
                dataItem.url = 'http://' + url;
            }
        },

        _verifyEmailProtocol: function (dataItem) {
            var href = dataItem.get('href');
            var title = dataItem.get('text');
            href = href.trim();
            title = title.trim();
            if (!href) {
                return;
            }
            var regExp = /^(mailto:)/;
            if (!regExp.test(href)) {  // if no protocol
                href = 'mailto:' + href;
            }
            if (title) {
                href = href + '?subject=' + encodeURIComponent(title);
            }
            dataItem.set('href', href);
        },

        _doesPageExist: function(pageId){
            var prefix = '#';
            if (pageId.indexOf(prefix) === 0){
                pageId = pageId.substr(1);
            }
            return !!this._getPageDomById(pageId);
        }
    });

});
