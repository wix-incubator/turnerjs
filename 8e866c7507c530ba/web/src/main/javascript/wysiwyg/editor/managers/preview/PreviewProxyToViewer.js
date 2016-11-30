/**
 * @class wysiwyg.editor.managers.preview.PreviewProxyToViewer
 */
define.Class('wysiwyg.editor.managers.preview.PreviewProxyToViewer', function(classDefinition){
    /** @type bootstrap.managers.classmanager.ClassDefinition */
    var def = classDefinition;

    def.methods(/** @lends wysiwyg.editor.managers.WPreviewManager */{

        /**
         *
         * @param pageId
         */
        goToPage: function(pageId) {
            if (!this._previewReady) {
                LOG.reportError(wixErrors.PREVIEW_NOT_READY, "PreviewManager", "goToPage", "");
                return;
            }
            // _targetPageId is used to prevent event echoing
            this._targetPageId = pageId;
            this._preview.contentWindow.W.Viewer.goToPage(pageId);
        },

        /**
         *
         * @returns {W}
         */
        getPreviewManagers: function() {
            if (!this._previewReady) {
                return null;
            }
            return this._preview.contentWindow.W;
        },

        /**
         *
         * @param callback
         * @param context - aka 'scope'
         */
        getPreviewManagersAsync: function(callback, context) {
            var managers = this.getPreviewManagers();
            if(managers){
                callback.call(context || this, managers);
                return;
            }
            var that = this;
            var commands= this.injects().Commands;
            commands.registerCommandListenerByName('EditorCommands.SiteLoaded', this, function(){
                var cmd = commands.getCommand('EditorCommands.SiteLoaded');
                cmd.unregisterListener(that);
                callback.call(context || that, that._preview.contentWindow.W);
            });
        },

        /**
         *
         * @param pageId
         * @param viewerDeviceMode
         * @returns {*}
         */
        getPageComponents: function(pageId, viewerDeviceMode){
            return this.getPreviewManagers().Viewer.getPageComponents(pageId, viewerDeviceMode);
        },

        /**
         *
         * @param viewerDeviceMode
         * @returns {*}
         */
        getMasterComponents: function(viewerDeviceMode){
            return this.getPreviewManagers().Viewer.getMasterComponents(viewerDeviceMode);
        },

        /**
         *
         * @param id
         * @param [viewerDeviceMode]
         * @returns {Node}
         */
        getCompByID: function(id, viewerDeviceMode){
            return this.getPreviewManagers().Viewer.getCompByID(id, viewerDeviceMode);
        },

        /**
         *
         * @param id
         * @param viewerDeviceMode
         * @returns {NodeList}
         */
        getAllCompsWithID: function(id, viewerDeviceMode){
            return this.getPreviewManagers().Viewer.getAllCompsWithID(id, viewerDeviceMode);
        },

        /**
         *
         * @param id
         * @param viewerDeviceMode
         * @returns {?$logic}
         */
        getCompLogicById: function(id, viewerDeviceMode){
            var compNode = this.getCompByID(id, viewerDeviceMode);
            return compNode ? compNode.$logic : null;
        },

        /**
         *
         * @param selector
         * @returns {Node}
         */
        getElementBySelector: function(selector){
            return this.getPreviewManagers().Viewer.getElementBySelector(selector);
        },

        /**
         *
         * @param selector
         * @returns {?$logic}
         */
        getCompLogicBySelector: function(selector){
            var element = this.getElementBySelector(selector);
            return (element && element.$logic) ? element.$logic : null;
        },

        /**
         *
         * @returns {Node} the $view for wysiwyg.viewer.components.WSiteStructure
         */
        getSiteNode: function(){
            return this.getPreviewManagers().Viewer.getSiteNode();
        },

        /**
         *
         * @returns {wysiwyg.viewer.components.PageGroup} the actual logic of the page group
         */
        getPageGroup: function () {
            return this.getPreviewManagers().Viewer.getPageGroup();
        },

        /**
         *
         * @returns {Node} the $view for wysiwyg.viewer.components.PageGroup
         */
        getPageGroupElement: function () {
            return this.getPreviewManagers().Viewer.getPageGroupElement();
        },

        /**
         *
         * @returns {Node} the $view for wysiwyg.viewer.components.PagesContainer
         */
        getPagesContainer: function(){
            return this.getPreviewManagers().Viewer.getPagesContainer();
        },
        /**
         *
         * @returns {Node} the $view for wysiwyg.viewer.components.FooterContainer
         */
        getFooterContainer: function(){
            return this.getPreviewManagers().Viewer.getFooterContainer();
        },

        /**
         *
         * @returns {Node} the $view for wysiwyg.viewer.components.HeaderContainer
         */
        getHeaderContainer: function(){
            return this.getPreviewManagers().Viewer.getHeaderContainer();
        },

        /**
         *
         * @returns {window} window of the preview
         */
        getPreviewSite: function() {
            if (!this._previewReady) {
                LOG.reportError(wixErrors.PREVIEW_NOT_READY, "PreviewManager", "getPreviewSite", "");
                return;
            }
            return this._preview.contentWindow;
        },

        getPreviewThemeProperty: function(property) {
            if (!this._previewReady) {
                LOG.reportError(wixErrors.PREVIEW_NOT_READY, "PreviewManager", "getPreviewThemeProperty", "");
                return;
            }
            return this._preview.contentWindow.W.Theme.getProperty(property);
        },

        /**
         * get the pages and execute callback with the pages data
         * @param callback
         */
        getPages: function(callback){
            var that = this;
            this.getPreviewManagers().Data.getDataByQuery('#SITE_STRUCTURE', function(data) {
                that.getPreviewManagers().Data.getDataByQueryList(data.get('pages'), function(data) {
                    callback(data);
                });
            });
        },

        /**
         *
         * @returns {String}
         */
        getPreviewCurrentPageId: function() {
            if (!this._previewReady) {
                LOG.reportError(wixErrors.PREVIEW_NOT_READY, "PreviewManager", "getPreviewCurrentPageId", "")();
                return;
            }
            return this._preview.contentWindow.W.Viewer.getCurrentPageId();
        },

        /**
         * A wrapper for the basic selector in the preview
         * @param id
         * @returns {Node}
         */
        getHtmlElement: function(id){
            return this._preview.contentWindow.$(id);
        },

        /**
         *
         * @returns {boolean}
         */
        isPreviewDataChanged: function() {
            if (!this._previewReady) {
                LOG.reportError(wixErrors.PREVIEW_NOT_READY, "PreviewManager", "isPreviewDataChanged", "");
                return;
            }
            var isPreviewDataChanged = this._preview.contentWindow.W.Data.isDataChange() ||
                this._preview.contentWindow.W.Theme.isDataChange() ||
                this._preview.contentWindow.W.ComponentData.isDataChange();
            return isPreviewDataChanged;
        },

        /**
         *
         */
        clearPreviewDataChange: function() {
            if (!this._previewReady) {
                LOG.reportError(wixErrors.PREVIEW_NOT_READY, "PreviewManager", "clearPreviewDataChange", "");
                return;
            }
            var PW = this._preview.contentWindow.W;
            PW.Data.clearDataChange();
            PW.ComponentData.clearDataChange();
            PW.Theme.clearDataChange();

            PW.Data.clearDirtyObjectsMap();
            PW.ComponentData.clearDirtyObjectsMap();
            PW.Theme.clearDirtyObjectsMap();
        }
    });
});