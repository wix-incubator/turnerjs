define.component('wysiwyg.editor.components.dialogs.WAddPageDialog', function (componentDefinition) {

    /** @type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('mobile.core.components.base.BaseComponent');
    def.resources(['W.Preview', 'W.Config', 'W.Utils']);
    def.binds(['_onDialogClosing', '_onKeyUp', '_setPageTypesList', '_setSubPage', '_setDefaultSelected']);
    def.traits(['wysiwyg.editor.components.traits.FiltersDataByTags']);
    def.skinParts(
        {
        'contentLabel'     : {'type': 'htmlElement'},
        'content'          : {'type': 'htmlElement'},
        'nameYourPageInput': {'type': 'wysiwyg.editor.components.inputs.Input'},
        'newPageSettings'  : {'type': 'htmlElement'},
        'nameYourPageTitle': {'type': 'htmlElement'},
        'pageDescription'  : {'type': 'htmlElement'},
        'namePageLabel'    : {'type': 'htmlElement'},
        'subPage'          : {'type': 'htmlElement'},
        'subPageTitle'     : {'type': 'htmlElement'},
        'subPageCheckBox'  : {'type': 'wysiwyg.editor.components.inputs.CheckBox'}
        }
    );
    def.methods({
        /**
         *  Function: initialize
         */
        initialize: function(compId, viewNode, arg){
            this.parent(compId, viewNode);

            this._dialogWindow = arg.dialogWindow;
            this._dialogOptionsSet = false;
            this._selectedPageId = "#" + this.injects().Preview.getPreviewManagers().Viewer.getCurrentPageId();
            this._defaultPage = 'ADD_PAGE_ABOUT1_NAME';

            //fetches the menu data in order to set the dialog up correctly.
            //if selected page is a sub page, the checkbox should be selected automatically and new page should receive same parent
            var menuData = W.Preview.getPreviewManagers().Data.getDataByQuery("#MAIN_MENU");
            this._isCurrentPageSubPage = menuData.isSubItemByRefId(this._selectedPageId);
            if (this._isCurrentPageSubPage){
                var currentPageParent = menuData.getItemParentByRedId(this._selectedPageId);
                this._currentPageParentRef = currentPageParent.get('refId');
                this._isSubPage = true;
            } else {
                this._isSubPage = false;
            }

            //create an unbound callback function so we can get the "currentTarget"
            var that = this;
            this._linkListener = function(ev){
                if (ev.type === 'click'){
                    that._onItemClick(this);
                }
                else {
                    that._onItemDoubleClick(this);
                }
            };

            this._dialogWindow.addEvent('onDialogClosing', this._onDialogClosing);

            //Get page types list from editor-data
            this.filterEditorDataListByTags('#PAGE_TYPES', 'pagesFilterTags', 'tags', this._setPageTypesList);


        },

        _onAllSkinPartsReady: function(){
            this.parent();
            this._skinParts.contentLabel.set('text', this.injects().Resources.get('EDITOR_LANGUAGE', 'ADD_PAGE_CONTENT_LABEL'));
            this._skinParts.namePageLabel.set('text', this.injects().Resources.get('EDITOR_LANGUAGE', 'NAME_YOUR_PAGE'));
            this._skinParts.subPageTitle.set('text', this.injects().Resources.get('EDITOR_LANGUAGE', 'ADD_AS_SUB_PAGE'));

            this._skinParts.nameYourPageInput.addEvent(Constants.CoreEvents.KEY_UP, this._onKeyUp);
            this._skinParts.nameYourPageInput.setMaxLength(Constants.Page.NAME_MAX_LENGTH);
            this._skinParts.subPageCheckBox.setChecked(this._isSubPage);
            this._skinParts.subPageCheckBox.addEvent('inputChanged', this._setSubPage);
            this._skinParts.content.addEvent(Constants.CoreEvents.MOUSE_WHEEL,this.resources.W.Utils.stopMouseWheelPropagation);
        },

        /**
         *  Function: _prepareForRender
         *  updates the component that both the data and skin are ready and that one of them has been updated.
         */
        _prepareForRender: function(){
            if (this._dialogOptionsSet){
                return true;
            }
            this._clearSelection();
            this._refreshLinkList(function(){
                this._dialogOptionsSet = true;
                this._renderIfReady();
            }.bind(this));

            return this._dialogOptionsSet;
        },

        _setPageTypesList: function(list){
            // Get Current page size from editor manager (PageGroup)
            var acceptablePageApplicationType = this.injects().Config.getApplicationType();
            var mode = this.injects().Config.getDebugMode();
            // Filter page types list by page width
            this._pageTypes = list.filter(function(pageType){
                var noDebugModeAndGroupIsDebug = mode !== 'debug' && pageType.group === 'ADD_PAGE_DEBUG_GROUPNAME';
                return (pageType.applicationType === acceptablePageApplicationType && !noDebugModeAndGroupIsDebug);
            });
        },

        setDialogOptions: function(){
            this._view.fireEvent("dialogOptionsSet", this);
        },

        _refreshLinkList: function(listReadyCallBack){
            if (!this._skinParts || !this._skinParts.content){
                return;
            }

            this._skinParts.content.empty();
            var resources = this.injects().Resources;

            var presentedGroups = [];
            var i = 0;
            for (i; i < this._pageTypes.length; i++){

                // add a group label to the content: if first verifies that group label was not added before, then
                // it adds it as an html element:
                var group = resources.get('EDITOR_LANGUAGE', this._pageTypes[i].group);
                if (!presentedGroups.contains(group)){
                    var label = new Element('strong', {'text': group, 'class': 'sectionTitle'});
                    this._skinParts.content.adopt(label);
                    presentedGroups.push(group);
                }

                this._pageTypes[i].isReady = false;

                //var that = this;
                this._createItem(this._pageTypes[i], function(pageItem){
                    pageItem.isReady = true;
                    this._checkPageListReady(listReadyCallBack);
                }.bind(this), this._setDefaultSelected);
            }

        },

        _setDefaultSelected: function(compLogic){
            var pageName = compLogic.getDataItem().get('additionalObj').name;
            if (pageName === this._defaultPage){
                this._onItemClick(compLogic.getViewNode());
            }

        },

        _checkPageListReady: function(callback){
            var isListReady = true;
            var i = 0;
            for (i; i < this._pageTypes.length; i++){
                if (!this._pageTypes[i].isReady){
                    isListReady = false;
                    break;
                }
            }

            if (isListReady && callback){
                callback();
            }
        },


        _createItem: function(pageItem, itemReadyCallback, componentReadyCallback){
            var resources = this.injects().Resources;
            var linkData = {
                'type'         : 'Page',
                'linkType'     : 'FREE_LINK',
                'title'        : resources.get('EDITOR_LANGUAGE', pageItem.name),
                'target'       : '',
                'additionalObj': pageItem,
                'icon'         : ''
            };
            var newData = this.injects().Data.createDataItem(linkData);
            var btn = this.injects().Components.createComponent('core.components.MenuButton', 'wysiwyg.editor.skins.dialogs.WAddPageItemSkin', newData, {listSubType: "PAGES"}, itemReadyCallback(pageItem), componentReadyCallback);
            btn.addEvent(Constants.CoreEvents.CLICK, this._linkListener);
            btn.addEvent('dblclick', this._linkListener);

            btn.insertInto(this._skinParts.content);
        },

        _onDialogClosing: function(event){
            if (event.result === "OK"){
                this._reportSelectedLink();
            }
        },

        _reportSelectedLink: function () {
            var pageData = Object.clone (this._selectedItem._data.get('additionalObj'));
            var name = this._skinParts.nameYourPageInput.getValue() || W.Resources.get('EDITOR_LANGUAGE', pageData.group);

            var command = pageData.command ||  "WEditorCommands.AddPage";
            var params;
            if (pageData.commandParameter) {
                params = pageData.commandParameter;
                params.name = name;
            } else {
                pageData.name = name;
                params = {page: pageData};
                if (this._isSubPage && !this._selectedItem._data.get('additionalObj').onlyPrimaryPage) {
                    if (this._isCurrentPageSubPage) {
                        params.parent = this._currentPageParentRef;
                    } else {
                        params.parent = this._selectedPageId;
                    }
                }
            }

            W.Commands.executeCommand(command, params);

            //report bi event
            try {
                var logParams = {
                    c1: pageData.previewPic.replace('.png',''),
                    c2: pageData.group.replace('ADD_PAGE_','').replace('_GROUPNAME',''),
                    g1: pageData.name,
                    i1: this._isSubPage
                };
                LOG.reportEvent(wixEvents.PAGE_ADDED, logParams);
            }
            catch (e) {
                LOG.reportEvent(wixEvents.PAGE_ADDED, {c1: 'error'});
            }
        },

        _onItemClick: function(item){
            if (this._selectedItem === item.getLogic()){
                return;
            }
            var resources = this.injects().Resources;
            var lastItemName = (this._selectedItem && resources.get('EDITOR_LANGUAGE', this._selectedItem._data.get('additionalObj').name)) || '';
            var inputText = this._skinParts.nameYourPageInput.getValue();
            var userModifiedName = (inputText !== lastItemName);
            this._clearSelection();
            this._selectedItem = item.getLogic();
            item.getLogic().setState('selected');
            if (this._selectedItem){
                this._skinParts.nameYourPageInput.enable();
                this._dialogWindow.enableButton(this.injects().EditorDialogs.DialogButtons.OK);

                this._skinParts.preview.setStyle('visibility', 'visible');
                this._skinParts.preview.set('src', W.Config.getServiceTopologyProperty('staticSkinUrl') + '/images/wysiwyg/addPageIcons/v4/' + this._selectedItem._data.get('additionalObj').previewPic);

                var desc = resources.get('EDITOR_LANGUAGE', this._selectedItem._data.get('additionalObj').pageDescription);
                this._skinParts.pageDescription.set('html', desc);

                var name = (userModifiedName) ? inputText : resources.get('EDITOR_LANGUAGE', this._selectedItem._data.get('additionalObj').name);
                this._skinParts.nameYourPageInput.setValue(name);

                //From AddBlogPage experiment
                if (this._selectedItem._data.get('additionalObj').onlyPrimaryPage) {
                    this._skinParts.subPageCheckBox.disable();
                    this._skinParts.subPageCheckBox.setValue(false);
                    this._setSubPage({ value: false });
                } else {
                    this._skinParts.subPageCheckBox.enable();
                }
            }
            LOG.reportEvent(wixEvents.ADD_PAGE_ITEM_PREVIEW);
        },

        _onItemDoubleClick: function(item){
            this._clearSelection();
            this._onItemClick(item);
            this._reportSelectedLink();
            this._dialogWindow.closeDialog();
        },
        /**
         *  Function: _clearSelection
         *
         *  unselects the selcted Images.
         *
         */
        _clearSelection   : function(){
            if (this._selectedItem){
                this._selectedItem.setState('idle');
                this._selectedItem = null;
            }

            this._dialogWindow.disableButton(this.injects().EditorDialogs.DialogButtons.OK);
            this._skinParts.preview.setStyle('visibility', 'hidden');
            this._skinParts.nameYourPageInput.setValue("");
            this._skinParts.nameYourPageInput.disable();

            this._skinParts.pageDescription.set('html', "");
        },

        _getPreviewRoot: function(){
            return this.injects().Theme.getProperty('THEME_DIRECTORY') + 'addPage/';
        },

        /**
         * if the user presses the enter key on the nameYourPageInput, it closes the window, and
         * adds the page
         * @param e
         */
        _onKeyUp: function(e){
            e = e || window.event;

            //'enter' code is 13
            if (e.code === 13){
                this._reportSelectedLink();
                this._dialogWindow.closeDialog();
            }
        },

        _setSubPage: function(e){
            this._isSubPage = e.value || false;
        }
    });

});
