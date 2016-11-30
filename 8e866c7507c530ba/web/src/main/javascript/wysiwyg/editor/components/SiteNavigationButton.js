/**@class wysiwyg.editor.components.SiteNavigationButton */
define.component('wysiwyg.editor.components.SiteNavigationButton', function (componentDefinition) {
    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('core.components.Button');

    def.skinParts({
        label:{type:'htmlElement'},
        menu:{type:'htmlElement'},
        drag:{type:'htmlElement'},
        homepageIndication:{type:'htmlElement'}
    });

    def.resources(['W.Editor', 'W.Commands', 'W.Preview', 'W.Config']);


    def.traits(['wysiwyg.editor.components.traits.TreeItem']);

    def.binds(['_openPageSettings', '_updatePageName', '_updatePageProps', '_setHomepageState', '_setVisibilityState', '_onSetViewerMode']);

    def.states({
        mouse:      [ "up", "over", "selected", "down", "pressed" ],
        page:       [ "normal", "subPage" ],
        mainPage:   [ "mainPage" ],
        visibility: [ "visibility_true", "visibility_false" ],
        pageType:   [ "normalPage", "wixAppsPage" ],
        controls: ['readOnlyControls', 'normalControls']
    });

    def.dataTypes(['MenuItem']);

    def.fields({
        _triggers:['click'],
        _renderTriggers:[Constants.DisplayEvents.DISPLAYED]
    });

    /**
     * @lends wysiwyg.editor.components.SiteNavigationButton
     */
    def.methods({
        render:function () {
            this.parent();
            if (this._data.getMeta('isHidden')) {
                this._skinParts.label.addClass('hiddenPage');
            } else {
                this._skinParts.label.removeClass('hiddenPage');
            }
        },

        registerDragHandler:function (handler) {
            this._skinParts.drag.addEvent(Constants.CoreEvents.MOUSE_DOWN, handler);
            var dragPart = this._skinParts.drag;
            var skin = this._skinParts.drag.getParent();
            dragPart.setStyle("background-position", "0 -100px");
            skin.addEvent(Constants.CoreEvents.MOUSE_OVER, function(e){
                dragPart.setStyle("background-position", "0 -160px");
            }.bind(this));
            skin.addEvent(Constants.CoreEvents.MOUSE_OUT, function(e){
                dragPart.setStyle("background-position", "0 -100px");
            }.bind(this));
        },

        //Experiment HomepageSettings.New was promoted to feature on Wed Oct 10 12:26:36 IST 2012
        _onAllSkinPartsReady:function () {
            this._addToolTipToSkinPart(this._skinParts.menu, 'Pages_Symbol_ttid');
            this._refId = this._data.get('refId');
            var pageItem = this.injects().Preview.getPreviewManagers().Data.getDataByQuery(this._refId);
            this._label = pageItem.get('title');

            pageItem.addEvent('dataChanged', this._updatePageProps);
            W.Commands.registerCommandListenerByName("WEditorCommands.SetHomepage", this, this._updatePageProps, null);

            var pageId = (this._refId.indexOf('#') === 0) ? this._refId.substr(1) : this._refId;
            this._skinParts.menu.addEvent(Constants.CoreEvents.CLICK, this._openPageSettings);
            this.setCommand("EditorCommands.gotoSitePage", pageId);
            if (W.Preview.getPreviewManagers().Viewer.getCurrentPageId() == pageId) {
                this.setState('selected', 'mouse');
            } else {
                this.setState('up', 'mouse');
            }

            this._updatePageProps();

            this.resources.W.Commands.registerCommandListenerByName("WEditorCommands.SetViewerMode", this, this._onSetViewerMode);
            this._onSetViewerMode(null);
        },

        _onSetViewerMode: function(params){
            var mode = (params && params.mode) || this.resources.W.Config.env.$viewingDevice;
            switch (mode){
                case Constants.ViewerTypesParams.TYPES.MOBILE:
                    this.setState('readOnlyControls', 'controls');
                    break;
                case Constants.ViewerTypesParams.TYPES.DESKTOP:
                    this.setState('normalControls', 'controls');
                    break;
            }
            this._setVisibilityState();
        },

        //Experiment HomepageSettings.New was promoted to feature on Wed Oct 10 12:26:36 IST 2012

        // TODO: Remove this function; replaced by _updatePageProps
        _updatePageName:function () {
            // deprecated
        },

        _addToolTipToSkinPart:function (skinPart, tipId) {
            skinPart.addEvent('mouseenter', function () {
                W.Commands.executeCommand('Tooltip.ShowTip', {id:tipId}, skinPart);
            }.bind(this));
            skinPart.addEvent('mouseleave', function () {
                W.Commands.executeCommand('Tooltip.CloseTip');
            }.bind(this));
        },

        _openPageSettings:function () {
            var commandName = this.getState('controls') === 'normalControls' ?
                "WEditorCommands.PageSettings" : "WEditorCommands.MobilePageSettings";

            this.resources.W.Commands.executeCommand(commandName, {
                pageId: this._refId,
                settingsButtonOverride: true
            });
        },

        isSubItem:function () {
            if (this.getState('page') == 'subPage') {
                return true;
            }
            return false;
        },

        setAsSubItem:function () {
            this.setState('subPage', 'page');
        },

        setAsParentItem:function () {
            this.setState('normal', 'page');
        },

        //Experiment HomepageSettings.New was promoted to feature on Wed Oct 10 12:26:36 IST 2012
        _updatePageProps:function () {
            this._setTitle();
            this._setHomepageState();
            this._setVisibilityState();
            this._setPageTypeState();
        },

        _setPageTypeState: function () {
            var page = W.Preview.getPreviewManagers().Data.getDataByQuery(this._data.get("refId"));
            var pageData = page.getData();
            var self = this;
            this._getPageConfigPromise(pageData).then(function (config) {
                var pageIcon = config.getPageIcon();
                if (pageIcon) {
                    self._skinParts.pageTypeIcon.setStyle("background-image", "url('" + pageIcon + "')");
                    self.setState("wixAppsPage", "pageType");
                }
                else {
                    self.setState("normalPage", "pageType");
                }
            });
        },

        _getPageConfigPromise: function (pageData) {
            return W.Editor.getPageConfigPromise(pageData);
        },

        //Experiment HomepageSettings.New was promoted to feature on Wed Oct 10 12:26:36 IST 2012
        _setTitle:function () {
            this._label = this._getPageDataItem().get('title');
            this._skinParts.label.set('html', this._label || '');
        },

        //Experiment HomepageSettings.New was promoted to feature on Wed Oct 10 12:26:36 IST 2012
        _setHomepageState:function () {
            if (this._getCurrentPageId() === this._getCurrentHomepageId()) {
                this.setState('mainPage', 'mainPage');
            } else {
                this.removeState('mainPage', 'mainPage');
            }
        },

        //Experiment HomepageSettings.New was promoted to feature on Wed Oct 10 12:26:36 IST 2012
        _setVisibilityState:function () {
            var visibilityState = "";
            var mode = this.resources.W.Config.env.$viewingDevice;
            switch (mode){
                case Constants.ViewerTypesParams.TYPES.MOBILE:
                    visibilityState = this._getPageDataItem().get('mobileHidePage').toString();
                    break;
                case Constants.ViewerTypesParams.TYPES.DESKTOP:
                    visibilityState = this._getPageDataItem().get('hidePage').toString();
                    break;
            }
            this.setState('visibility_' + visibilityState, 'visibility');
        },

        //Experiment HomepageSettings.New was promoted to feature on Wed Oct 10 12:26:36 IST 2012
        _getCurrentHomepageId:function () {
            return this._getSiteStructure().get('mainPage').replace('#', '');
        },

        //Experiment HomepageSettings.New was promoted to feature on Wed Oct 10 12:26:36 IST 2012
        _getCurrentPageId:function () {
            return this.getDataItem().getData().refId.replace('#', '');
        },

        //Experiment HomepageSettings.New was promoted to feature on Wed Oct 10 12:26:36 IST 2012
        _getPageDataItem:function () {
            return this.injects().Preview.getPreviewManagers().Data.getDataByQuery(this._refId);
        },

        //Experiment HomepageSettings.New was promoted to feature on Wed Oct 10 12:26:36 IST 2012
        _getSiteStructure:function () {
            return this.injects().Preview.getPreviewManagers().Data.getDataMap().SITE_STRUCTURE;
        }
    });

});
