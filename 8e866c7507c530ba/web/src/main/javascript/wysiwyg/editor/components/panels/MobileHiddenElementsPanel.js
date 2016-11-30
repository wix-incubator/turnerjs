define.component('wysiwyg.editor.components.panels.MobileHiddenElementsPanel', function(componentDefinition){
    /**@type core.managers.component.ComponentDefinition*/
    var def = componentDefinition;

    def.inherits('wysiwyg.editor.components.panels.SideContentPanel');

    def.utilize(['core.components.image.ImageUrlNew']);

    def.skinParts({
        button                 : {type: 'wysiwyg.editor.components.MobileAddHiddenComponentButton', autoCreate: false},
        reorderButton          : {type: 'wysiwyg.editor.components.WButton', autoBindDictionary: 'MOBILE_HIDDEN_ELEMENTS_REORDER_LABEL', command: 'WEditorCommands.ReorderCurrentMobilePageLayout', commandParameter: {scope: 'currentPage'}},
        discardReorderButton   : {type: 'wysiwyg.editor.components.WButton', autoBindDictionary: 'MOBILE_HIDDEN_ELEMENTS_DISCARD_REORDER_LABEL', command: 'WEditorCommands.DiscardReorderCurrentMobilePageLayout', commandParameter: {scope: 'currentPage'}},
        reorderTitle           : {type: 'htmlElement', autoBindDictionary: 'MOBILE_HIDDEN_ELEMENTS_REORDER_TITLE'},
        reorderDescription     : {type: 'htmlElement', autoBindDictionary: 'MOBILE_HIDDEN_ELEMENTS_REORDER_DESCRIPTION'},
        scrollableArea         : {type: 'htmlElement'},
        allPagesLabel          : {type: 'htmlElement', autoBindDictionary: 'MOBILE_HIDDEN_ELEMENTS_ALL_PAGES_LABEL'},
        pageLabel              : {type: 'htmlElement'},
        allPagesComps          : {type: 'htmlElement'},
        pageComps              : {type: 'htmlElement'}
    });

    def.resources(['W.Preview', 'W.Resources', 'W.Editor', 'W.Commands', 'W.Utils', 'W.Data', 'W.Theme', 'W.Config']);

    def.binds(['_onBeforePageChange', '_populateCompLists', '_disableDiscardReorder', '_onPanelHide']);

    def.fields({
        _panelName   : "MOBILE_HIDDEN_ELEMENTS_PANEL_TITLE",
        MAX_TEXT_SIZE: 50
    });

    def.methods({
        initialize: function(compId, viewNode, args){
            this.parent(compId, viewNode, args);

            //Language
            this._titleKey = "MOBILE_HIDDEN_ELEMENTS_PANEL_TITLE";
//            this._descriptionKey = "MOBILE_HIDDEN_ELEMENTS_PANEL_DESCRIPTION";

            //Defaults
            this._buttonList = {allPages: [], page: []};
            this._buttonListContainer = {allPages: null, page: null};
            this._iconSize = {width: 23, height: 23, x: 23, y: 23};
            this._iconsMap = this.resources.W.Data.getDataByQuery('#COMP_ICONS');

            //TinyMenu special treatment
            this._tinyMenuId = 'TINY_MENU';
            this._tinyMenuClassName = 'wysiwyg.viewer.components.mobile.TinyMenu';

            //Registrations
            this._imageSrcBuilder = new this.imports.ImageUrlNew();
            this._deleteCommand = this.resources.W.Commands.getCommand("WEditorCommands.DeletedComponentsListUpdated");
            this._compPosSizeCommand = this.resources.W.Commands.getCommand("WEditorCommands.SetSelectedCompPositionSize");
            this.resources.W.Preview.getPreviewManagersAsync(function(previewManagers) {
                this._previewManagers = previewManagers;
            }, this);
        },

        /**
         * Override original getDescription to add an eye icon
         */
        getDescription: function(){
            var pre = this.resources.W.Resources.get('EDITOR_LANGUAGE', 'MOBILE_HIDDEN_ELEMENTS_PANEL_DESCRIPTION_PRE');
            var post = this.resources.W.Resources.get('EDITOR_LANGUAGE', 'MOBILE_HIDDEN_ELEMENTS_PANEL_DESCRIPTION_POST');
            var imageUrl = this.resources.W.Theme.getProperty("WEB_THEME_DIRECTORY") + 'mobile/reshow_eye.png';

            return pre + ' <img src="' + imageUrl + '" /> ' + post;

        },

        canGoBack : function() {
            return true;
        },

        _onPanelShow: function(){
            this.parent();
            //Populate the list once on every show.
            this._populateCompLists();
            this.resources.W.Editor.addEvent(Constants.EditorEvents.SITE_PAGE_CHANGED, this._onBeforePageChange);
            //Listen to delete list updates and to page change event.
            this.resources.W.Preview.getMultiViewersHandler().on('pageChanged', this, this._handlePageChange);
            this._deleteCommand.registerListener(this, this._handleDeletedCompMapUpdated);
            //Listen to change commands to disable "discard reorder"
            this._compPosSizeCommand.registerListener(this, this._disableDiscardReorder);
        },

        _onPanelHide: function(){
            this.parent();
            this.resources.W.Editor.removeEvent(Constants.EditorEvents.SITE_PAGE_CHANGED, this._onBeforePageChange);
            //Stop listening to delete list updates and to page change event when not visible.
            this.resources.W.Preview.getMultiViewersHandler().off('pageChanged', this, this._handlePageChange);
            this._deleteCommand.unregisterListener(this);
            //Stop listening to change commands to disable "discard reorder" when not visible.
            this._compPosSizeCommand.unregisterListener(this);
        },

        _onBeforePageChange: function() {
            this._disableDiscardReorder();
        },

        _handleDeletedCompMapUpdated: function(args){
            var updatedMap = args.updatedMap;
            var currentPageId = this._previewManagers.Viewer.getCurrentPageId();
            this._populateAllPagesCompList(updatedMap['masterPage']);
            this._populatePageCompList(updatedMap[currentPageId]);
        },

        _disableDiscardReorder: function(){
            var discardCommand = this.resources.W.Commands.getCommand("WEditorCommands.DiscardReorderCurrentMobilePageLayout");
            //Make this testable and check for command existence.
            discardCommand && discardCommand.disable();

        },

        _createFields: function(){
            //Do nothing, no autopanel components in this panel.
        },

        render: function(){
            this.parent();
            this._disableDiscardReorder();
        },

        /**
         * Create button component and return it's node
         * Created button logic is added to this._buttonList Array
         * @param Component comp
         * @returns htmlElement
         * @private
         */
        _getNewButtonComp: function(serializedComp, componentCommands, listName){
            var args, el;
            var sprite = this._getIconProperties(serializedComp, componentCommands);
            var compPageId = listName === 'page' ? this._previewManagers.Viewer.getCurrentPageId() : 'masterPage';

            args = {
                label           : this._getButtonLabel(serializedComp, componentCommands),
                command         : 'WEditorCommands.ReaddDeletedMobileComponent',
                commandParameter: {id: serializedComp.id, pageId: compPageId}
            };

            args = _.merge(args, sprite);

            el = this._createInnerComponent('button');
            el.$logic.setParameters(args, true);
            return el;
        },

        _getAddTinyMenuButtonComp: function(){
            var args, el;

            args = {
                spriteOffset    : this._getSpriteOffsetFromMap(this._tinyMenuClassName),
                spriteSize      : this._iconSize,
                spriteSrc       : this._iconsMap.get('src'),
                label           : this.resources.W.Resources.get('EDITOR_LANGUAGE', 'MOBILE_MENU'),
                command         : 'WEditorCommands.ReaddDeletedMobileComponent',
                commandParameter: {id: this._tinyMenuId, pageId: 'masterPage'}
            };

            el = this._createInnerComponent('button');
            el.$logic.setParameters(args);
            return el;
        },

        _isTinyMenuDeleted: function(){
            var viewerMode = this.resources.W.Config.env.$viewingDevice;
            var allMobileDeletedComponentsIds = this.resources.W.Preview.getMultiViewersHandler().getViewerModePageDeletedComponents('masterPage', viewerMode);
            return allMobileDeletedComponentsIds.contains(this._tinyMenuId);
        },

        _getImageSrc: function(ref, comp){
            var originalSize, uri, imageRef, src;
            var viewerDataManager = this._previewManagers.Data;
            var imageData = this._getSerializedCompDataItem(comp);

            if (ref !== '*'){
                imageRef = imageData.get(ref);
                imageData = viewerDataManager.getDataByQuery(imageRef);
            }

            if (imageData && imageData.get('type') === 'ImageList'){
                imageRef = imageData.get('items')[0];
                if (!imageRef){
                    return null;
                }
                imageData = viewerDataManager.getDataByQuery(imageRef);

            } else if (!imageData || imageData.get('type') !== 'Image'){
                throw new Error('item is not of type Image');
            }

            uri = imageData.get('uri');
            originalSize = {x: imageData.get('width'), y: imageData.get('height')};
            src = this._imageSrcBuilder.getImageUrlExactSize(this._iconSize, uri, originalSize);

            return src;
        },

        _getIconProperties: function(serializedComp, componentCommands){
            var src = null;
            var offset = {x: 0, y: 0};
            var size = this._iconSize;
            var compClassName = serializedComp.componentType;

            if (componentCommands.mobile && componentCommands.mobile.previewImageDataRefField){
                src = this._getImageSrc(componentCommands.mobile.previewImageDataRefField, serializedComp);
            }

            if (!src){
                src = this._iconsMap.get('src');
                offset = this._getSpriteOffsetFromMap(compClassName);
            }

            return {
                spriteOffset: offset,
                spriteSize  : size,
                spriteSrc   : src
            };
        },

        _getSpriteOffsetFromMap: function(compClassName){
            compClassName = this._previewManagers.Components.getNameOverride(compClassName);
            var offsets = this._iconsMap.get('spriteOffsets');
            return (compClassName in offsets) ? offsets[compClassName] : offsets['default'];
        },

        /**
         * Get the human readable name of a component
         * If the component is a Rich Text component, append an excerpt of the text.
         * @param Component currentComp
         * @returns String
         * @private
         */
        _getButtonLabel: function(serializedComp, componentCommands){
            var name = this._getSerializedComponentFriendlyName(serializedComp);
            var previewText = '';

            if (componentCommands.mobile && componentCommands.mobile.previewTextDataField){
                previewText = this._getSerializedCompText(serializedComp, componentCommands.mobile.previewTextDataField);
            }

            if (previewText){
                name += ': ' + previewText;
            }
            return this._parseTextForPreview(name);
        },

        _getSerializedComponentFriendlyName: function(serializedComp) {
            var componentData, componentName;
            if (serializedComp.dataQuery) {
                componentData = W.Preview.getPreviewManagers().Data.getDataByQuery(serializedComp.dataQuery);
            }
            componentName = this._previewManagers.Components.getNameOverride(serializedComp.componentType);
            return this.resources.W.Editor.getComponentFriendlyName(componentName, componentData);
        },

        _getSerializedCompText: function(serializedComp, previewTextDataField) {
            var serializedCompData = this._getSerializedCompDataItem(serializedComp);
            return serializedCompData && serializedCompData.get(previewTextDataField);
        },

        _getSerializedCompDataItem: function(serializedComp) {
            var dataQuery = serializedComp.dataQuery;
            return dataQuery && this._previewManagers.Data.getDataByQuery(dataQuery);
        },

        _parseTextForPreview: function(text){
            var parsedText = text;

            parsedText = this.resources.W.Utils.removeHtmlTagsFromString(parsedText); //Clear all HTML tags
            parsedText = this.resources.W.Utils.removeBreaklinesFromString(parsedText); //Remove /n and /r
            parsedText = parsedText.substring(0, this.MAX_TEXT_SIZE); //Cut to reasonable length
            return parsedText;
        },

        _getDeletedScopeSerializedComps: function(viewerMode, pageId, pageDeletedCompIds){
            var pageDeletedCompIds = pageDeletedCompIds || this.resources.W.Preview.getMultiViewersHandler().getViewerModePageDeletedComponents(pageId, viewerMode);
            return this._getPageSerializedDeletedComponents(pageId, pageDeletedCompIds);
        },

        _getPageSerializedDeletedComponents: function(pageId, currentPageDeletedCompIds) {
            currentPageDeletedCompIds = this._filterOutMobileOnlyComponents(currentPageDeletedCompIds);
            var mainSerializedStructure = this.resources.W.Preview.getMultiViewersHandler().getSerializedStructure(Constants.ViewerTypesParams.TYPES.DESKTOP);
            var serializedPage = pageId === 'masterPage' ? mainSerializedStructure[pageId] : mainSerializedStructure.pages[pageId];
            return _(currentPageDeletedCompIds)
                .map(function(compId) {return this._findSerializedDeletedCompInPage(serializedPage, compId)}, this)
                .compact()
                .value();
        },

        _filterOutMobileOnlyComponents: function(pageDeletedCompIds) {
            var multiViewersHandler = this.resources.W.Preview.getMultiViewersHandler();
            return _.reject(pageDeletedCompIds, multiViewersHandler.isMobileOnlyComponent, multiViewersHandler);
        },

        _findSerializedDeletedCompInPage: function(serializedPage, deletedCompId) {
            var serializedDeletedComp = null, serializedCompChildren = serializedPage.components || serializedPage.children;
            if (deletedCompId === serializedPage.id) {
                return serializedPage;
            }
            else if (serializedCompChildren) {
                for (var i=0; i<serializedCompChildren.length; i++) {
                    serializedDeletedComp = this._findSerializedDeletedCompInPage(serializedCompChildren[i], deletedCompId);
                    if (serializedDeletedComp) {
                        return serializedDeletedComp;
                    }
                }
            }
            return null;
        },

        _getDeletedPageSerializedComps: function(pageId, deletedCompIds){
            var viewerMode = this.resources.W.Config.env.$viewingDevice;
            return this._getDeletedScopeSerializedComps(viewerMode, pageId, deletedCompIds);
        },

        _getDeletedAllPagesSerializedComps: function(deletedComps){
            var viewerMode = this.resources.W.Config.env.$viewingDevice;
            return this._getDeletedScopeSerializedComps(viewerMode, 'masterPage', deletedComps);
        },

        /**
         * Dispose all buttons in the list, clear the list and the container and initialize a new one
         * @param String subList 'allPages', 'page'
         * @private
         */
        _clearButtonList: function(subList){
            if (!this._buttonList[subList]){
                return;
            }
            for (var i = 0; i < this._buttonList[subList].length; i++){
                if (this._buttonList[subList][i]){
                    this._buttonList[subList][i].dispose();
                }
            }

            if (this._buttonListContainer[subList] && this._buttonListContainer[subList].parentNode){
                this._buttonListContainer[subList].parentNode.removeChild(this._buttonListContainer[subList]);

            }

            this._buttonList[subList] = [];
            this._buttonListContainer[subList] = document.createElement('div');

        },

        _handlePageChange: function() {
            this._populatePageCompList();
        },

        _populateCompLists: function(){
            this._populatePageCompList();
            this._populateAllPagesCompList();
        },

        _populateCompListByName: function(listName, serializedComps, shouldAddTinyMenu, listNode){
            this._clearButtonList(listName);

            if (!_.isEmpty(serializedComps)){
                _.forEach(serializedComps, function(serializeComp, index) {
                    this._createAndAddCompButtonToList(serializeComp, listName);
                    if (index + 1 === serializedComps.length) {//buttons are ready
                        if (shouldAddTinyMenu) {
                            this._addTinyMenu();
                        }
                    }
                }, this);
            }
            else if (shouldAddTinyMenu) {
                this._addTinyMenu();
            }
            else {
                this._buttonListContainer[listName].innerHTML = this.resources.W.Resources.get('EDITOR_LANGUAGE', 'MOBILE_HIDDEN_ELEMENTS_EMPTY');
                this._buttonListContainer[listName].addClass('empty');
            }

            this._buttonListContainer[listName].insertInto(listNode);
        },

        _addTinyMenu: function() {
            var listName = 'allPages';
            this._buttonListContainer[listName].insertBefore(this._getAddTinyMenuButtonComp(), this._buttonListContainer[listName].firstChild);
        },

        _createAndAddCompButtonToList: function(serializedComp, listName) {
            this._getComponentEditorMetaData(serializedComp.componentType, function(componentCommands){
                componentCommands = componentCommands || {};
                var compButton = this._getNewButtonComp(serializedComp, componentCommands, listName);
                this._buttonListContainer[listName].appendChild(compButton);
                this._buttonList[listName].push(compButton.$logic);
            }.bind(this));
        },

        _getComponentEditorMetaData: function(componentClassName, callback) {
            var componentManager = this._previewManagers.Components;
            componentClassName = componentManager.getNameOverride(componentClassName);
            componentManager.getComponent(componentClassName, function(componentConstructor){
                callback(componentConstructor.EDITOR_META_DATA);
            });
        },

        /**
         * Populate the button list for a given page.
         * @param pageId
         * @private
         */
        _populatePageCompList: function(deletedCompIds){
            var pageId = this._previewManagers.Viewer.getCurrentPageId();
            var listName = 'page';
            var serializedComponents = this._getDeletedPageSerializedComps(pageId, deletedCompIds);
            this._populateCompListByName(listName, serializedComponents, false, this._skinParts.pageComps);
            this._setPageListLabelToPageTitle(pageId);
        },

        /**
         * Populate the button list for the header.
         * @private
         */
        _populateAllPagesCompList: function(deletedComps){
            var listName = 'allPages';
            var serializedComponents = this._getDeletedAllPagesSerializedComps(deletedComps);
            var shouldAddTinyMenu = this._isTinyMenuDeleted();
            this._populateCompListByName(listName, serializedComponents, shouldAddTinyMenu, this._skinParts.allPagesComps);
        },

        /**
         * Get the a page title text
         * @param pageId
         * @returns String
         * @private
         */
        _getPageTitle: function(pageId){
            var currentPageData = this._previewManagers.Data.getDataByQuery('#' + pageId);
            if (!currentPageData) {
                return ''; //throw error?
            }
            var pageTitle = currentPageData.get('title');
            return pageTitle;
        },

        /**
         * Add page 'title' to the panel's name.
         * @param pageId
         * @private
         */
        _setPageListLabelToPageTitle: function(pageId){
            var pageTitle = this._getPageTitle(pageId);
            this._skinParts.pageLabel.set('text', pageTitle + ' ' + this._translate('MOBILE_HIDDEN_ELEMENTS_PAGE_LABEL'));
        }
    });
});
