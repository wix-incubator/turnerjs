/**
 * @class wysiwyg.editor.managers.WPreviewManager
 */
define.Class("wysiwyg.editor.managers.WPreviewManager", function (classDefinition) {
    /**@type bootstrap.managers.classmanager.ClassDefinition*/
    var def = classDefinition;

    def.inherits('bootstrap.utils.Events');

    def.utilize([
        'wysiwyg.editor.managers.preview.MultipleViewersHandler',
        'wysiwyg.editor.managers.preview.FullStructureSerializer',
        'wysiwyg.editor.managers.preview.SiteDataSerializer'
    ]);

    def.traits([
        'wysiwyg.editor.managers.preview.PreviewProxyToViewer',
        'wysiwyg.editor.managers.preview.PreviewMousePositionTrait'
    ]);

    def.binds(['_onSiteResized', '_onWindowScroll', '_handlePreviewFrameResizeOnEditMode', '_handlePreviewFrameResizeOnViewerState',
        '_markPreviewPostionDirty', '_handlePreviewFrameResizeToDefault', '_handlePreviewModeChange']);

    def.fields({
        _siteDataHandlerPromise: null,
        _siteDataHandler: null
    });

    /**
     * @lends wysiwyg.editor.managers.WPreviewManager
     */
    def.methods({
        initialize: function() {
            this._siteId = null;
            this._preview = $('live-preview-iframe');
            this._previewContainer = this._getPreviewContainer();
            this._previewCurrentSizePosition = null;

            this.setPreviewFrameSizePosition(Constants.EditorUI.PREVIEW_SIZE_POSITION.DEFAULT);

            /** @type wysiwyg.editor.managers.preview.MultipleViewersHandler */
            this._multipleViewersHandler = new this.imports.MultipleViewersHandler(this);
            /** @type wysiwyg.editor.managers.preview.FullStructureSerializer */
            this._fullStructureSerializer = new this.imports.FullStructureSerializer(this._multipleViewersHandler);
            /** @type wysiwyg.editor.managers.preview.SiteDataSerializer */
            this._siteDataSerializer = new this.imports.SiteDataSerializer();

            W.Commands.registerCommandAndListener('WEditorCommands.WSetEditMode', this, this._handlePreviewAttribute);
            W.Commands.registerCommandAndListener('WEditorCommands.SetViewerMode', this, this._handleDeviceAttribute);
            W.Commands.registerCommandAndListener('WPreviewCommands.WEditModeChanged', this, this._handlePreviewFrameResizeOnEditMode);
            W.Commands.registerCommandAndListener('WPreviewCommands.ViewerStateChanged', this, this._handlePreviewFrameResizeOnViewerState);

            resource.getResources(["W.Config", "W.Editor", "W.Commands"], function (resources) {
                this._resources = resources;
                this._init();
            }.bind(this));
            this._isWindowReady = false;
            this._isPreviewReadyDeferred = Q.defer();
        },

        _getPreviewContainer: function () {
            var previewContainer = $('live-preview-iframe-wrapper');
            if (!previewContainer) {
                LOG.reportError(wixErrors.PREVIEW_NOT_FOUND);
            }
            return previewContainer ;
        },

        _init: function() {
            this._cachedPreviewPosition = null;
            this._isInPreviewMode = this._resources.W.Config.env.isEditorInPreviewMode() ;
            this._resources.W.Commands.registerCommandAndListener('WPreviewCommands.ResetPreviewSize', this, this._handlePreviewFrameResizeToDefault);
            this._resources.W.Commands.registerCommandAndListener("WEditorCommands.WSetEditMode", this, this._handlePreviewModeChange);
        },

        _handlePreviewAttribute: function(params){
            var editMode = (params && params.editMode) || W.Config.env.$editorMode;
            var previewWindow = this._preview.contentWindow;
            if (editMode === W.Editor.EDIT_MODE.PREVIEW){
                $(document.body).setAttribute('preview', 'view');
                previewWindow.document.body.setAttribute('preview', 'view');
            } else {
                $(document.body).setAttribute('preview', 'edit');
                previewWindow.document.body.setAttribute('preview', 'edit');
            }
        },

        _handleDeviceAttribute: function(params){
            var mode = (params && params.mode) || W.Config.env.$viewingDevice;
            var previewWindow = this._preview.contentWindow;
            if (mode === Constants.ViewerTypesParams.TYPES.MOBILE){
                $(document.body).setAttribute('device', 'mobile');
                previewWindow.document.body.setAttribute('device', 'mobile');
            } else {
                $(document.body).setAttribute('device', 'desktop');
                previewWindow.document.body.setAttribute('device', 'desktop');
            }
        },

        getIFrame: function() {
            return this._preview;
        },

        isSiteReady: function() {
            return this._previewReady;
        },

        isSiteReadyPromise: function() {
            return this._isPreviewReadyDeferred.promise;
        },

        /**
         * @returns {wysiwyg.editor.managers.preview.FullStructureSerializer}
         */
        getMultiViewersHandler: function(){
            return this._multipleViewersHandler;
        },

        /**
         * @returns {wysiwyg.editor.managers.preview.FullStructureSerializer}
         */
        getFullStructureSerializer: function(){
            return this._fullStructureSerializer;
        },
        /**
         * @returns {wysiwyg.editor.managers.preview.SiteDataSerializer}
         */
        getSiteDataSerializer: function(){
            return this._siteDataSerializer;
        },

        loadSite: function(siteId, siteReadyCallback, pageChangedCallback, siteErrorCallback) {

            this._siteId = siteId;
            this._pageChangedCallback = pageChangedCallback;
            this._previewReady = false;
            this._siteReadyCallback = siteReadyCallback;
            this._siteErrorCallback = siteErrorCallback;

            window.setPreloaderState('siteLoading');

            W.Utils.callLater(this._previewLoadedHandler.bind(this), null, null, 50);
        },

        _previewLoadedHandler: function() {
            var editedWindow = this._preview.contentWindow;
            var isWFound = true;
            try{ // Stupid IE9 fix
                isWFound = (editedWindow && editedWindow.W);
            } catch (e) {}
            if (isWFound) {
                // give the loaded site some time to migration and wixefy
                setTimeout(this._isSiteReadyDelay.bind(this), 10);
            } else {
                if(this._loadAttmpet === 3 && this._siteErrorCallback){
                    this._siteErrorCallback("Site preview invalid: W is undefined");
                }
                this._loadAttmpet++;
                this._previewLoadTimeoutId = W.Utils.callLater(this._previewLoadedHandler.bind(this), null, null, 300);
            }
        },

        _isSiteReadyDelay: function () {
            this._loadTime = new Date().getTime();
            var previewViewer;
            try { // Stupid IE9 fix
                previewViewer = this._preview && this._preview.contentWindow && this._preview.contentWindow.W && this._preview.contentWindow.W.Viewer;
            } catch (e) {}
            if(previewViewer && !this._isWindowReady){
                this._onPreviewWindowReady();
                this._isWindowReady = true;
            }
            if (previewViewer && previewViewer.isSiteReady()) {
                this._OnSiteReady();

            } else {
                if (new Date().getTime() - this._loadTime > this._siteReadyTimeout) {
                    this._siteErrorCallback("Site preview took too long");
                    LOG.reportError(wixErrors.PREVIEW_MANAGER_PREVIEW_TOO_LONG);
                }
                setTimeout(this._isSiteReadyDelay.bind(this), 10);
            }
        },

        _onPreviewWindowReady: function(){
            this._handlePreviewAttribute();
            this._handleDeviceAttribute();
        },

        _OnSiteReady: function(){
            this._previewReady = true;
            this._isPreviewReadyDeferred.resolve();

            this.getPreviewManagers().Viewer.setLinkTipFunc(W.LinkTypes.showLinkTip);

            //for debug only purposes (so we can use it instead of getPreviewManagers() )
            //do not use this._managersForDebugOnly in the code!!!!
            if (this._preview && this._preview.contentWindow) {
                this._managersForDebugOnly = this._preview.contentWindow.W;
            }

            setTimeout(function(){
                W.Commands.executeCommand('PreviewIsReady');
            }, 0);



            if (this._siteReadyCallback) {
                this._siteReadyCallback();
            }

            if (this._siteReadyCallback && this._pageChangedCallback) {
                this.getPreviewManagers().Viewer.addEvent('pageTransitionEnded', this._onPreviewNavigation.bind(this));
            }

            // Remove preloader
            window.setPreloaderState('ready');
            //this._preview.uncollapse();
            this._preview.style.visibility = 'visible';
            //Add a stylesheet to the viewer in order to provide preview only rules
            var previewCss = this.getPreviewManagers().Utils.createStyleSheet("PREVIEW_STYLE");
            this.getPreviewManagers().Viewer.addEvent('resize', this._onSiteResized);
            this._onSiteResized(this.getPreviewManagers().Viewer.getSiteHeight());

            window.addEvent('scroll', this._onWindowScroll);

            this._handlePreviewAttribute();
            this._handleDeviceAttribute();

            this.getPreviewManagers().Viewer.addEvent(this.getPreviewManagers().Viewer.SCREEN_RESIZE_EVENT, this._markPreviewPostionDirty);
            this._resources.W.Editor.addEvent(W.Editor.SCREEN_RESIZE_EVENT, this._markPreviewPostionDirty);

            this._initSiteDataHandlerInstance();
        },

        _initSiteDataHandlerInstance: function() {
            // The data resolver is set only on site ready, because beforehand the preview managers are not ready yet
            this._siteDataHandlerPromise = this.getPreviewManagers().Viewer.getSiteDataHandlerPromise();
            this._siteDataHandler = this.getPreviewManagers().Viewer.getSiteDataHandler();
            W.Commands.registerCommandListenerByName('WEditorCommands.DeletePageCompleted', this, this._updateSiteDataHandlerOnPageDeletion);
        },

        getSiteDataHandlerPromise: function() {
            return this._siteDataHandlerPromise;
        },

        _updateSiteDataHandlerOnPageDeletion: function(eventData) {
            var pageDataQuery = eventData.page.get('id');
            this._siteDataHandler.updateDeletedPage(pageDataQuery);
        },

        //W.PageManager._hashes - is used for save serialization, detecting change.. might need to move
        _onPreviewNavigation: function() {
            var pageId = this._preview.contentWindow.W.Viewer.getCurrentPageId();
            if (this._targetPageId !== this._preview.contentWindow.W.Viewer.getCurrentPageId() && this._pageChangedCallback) {
                this._targetPageId = this._preview.contentWindow.W.Viewer.getCurrentPageId();
                this._pageChangedCallback();
            }
        },

        _buildPreviewUrl: function(siteId){
            var url;
            if (window.location){
                url = W.ServerFacade.getPreviewUrl(siteId);
            }
            if (window.location.search) {
                //url += W.ServerFacade._getUrlSearchParameters();
                url += window.location.search;
            }
            // offline mode support
            if (window.location.href.indexOf('OfflineEditor') > 0) {
                url = 'OfflinePreviewNewDeploy.html';
            }
            if(url.indexOf('?')>-1)
            {
                url+='&';
            }else
            {
                url+='?';
            }
            url+='isEdited=true';
            if(W.Utils.getQueryParam('stack') === "true") {
                url += '&stack=true';
            }
            if(W.Utils.getQueryParam('wconsole') === "true") {
                url += '&wconsole=true';
            }
            if(W.Utils.getQueryParam('wix_blob').length > 0) {
                url += '&wix_blob=' + W.Utils.getQueryParam('wix_blob');
            }
            if(W.Config.getLanguage()) {
                url += '&lang=' + W.Config.getLanguage();
            }
            // forward scriptsRoot parameter
            var scriptsRoot = W.Utils.getQueryParam('scriptsRoot');
            if (scriptsRoot) {
                url += '&scriptsRoot=' + scriptsRoot;
            }
            return url;
        },

        //TODO: the getPreviewComponent should use this
        addPreviewsToDom: function(container){
            this.getIFrame().insertInto(container);
        },

        showPreviewTip: function(title, content) {
            var tipDiv;
            if (!this._tipDiv) {
                tipDiv = this._tipDiv = new Element('div');
                tipDiv.addClass('previewTipDiv');
                this._tipDivFX = new Fx.Tween(tipDiv, {
                    duration: '100ms',
                    link: 'cancel',
                    property: 'height'
                });
                this._tipDivFX.onComplete = function() {
                    if (this.closing){
                        tipDiv.setStyle('display', 'none');
                    }
                }.bind(this);
                this._titleSpan = new Element('span');

                this._titleSpan.addClass('previewTipDivTitle');
                this._contentSpan = new Element('span');
                this._contentSpan.addClass('previewTipDivContent');
                this._titleSpan.insertInto(tipDiv);
                this._contentSpan.insertInto(tipDiv);

                var prev = $('previewContainer');
                if (prev) {
                    tipDiv.insertInto(prev);
                }

            } else {
                tipDiv = this._tipDiv;
                this._tipDivFX.cancel();
                tipDiv.uncollapse();
            }
            var myFx = this._tipDivFX;
            this.closing = false;
            this._tipDivFX.start(40, 60);
            if (this.tipDivTimeOut){
                clearTimeout(this.tipDivTimeOut);
            }
            this.tipDivTimeOut = setTimeout(function() {
                this.closing = true;
                myFx.start(40, 0);
            }.bind(this), 3500);
            tipDiv = this._tipDiv;
            this._titleSpan.set('text', title);
            this._contentSpan.set('text', content);

        },

        _onSiteResized: function(size) {
            this.fireEvent('previewResized', size);
        },

        /**
         *
         * @returns htmlElement - return the preview container (viewer)
         */
        getPreviewComponent: function() {
            return this._previewContainer ;
        },

        setInPlaceEditingMode:function(editableComp) {
            this.getPreviewComponent().getLogic().setInPlaceEditingMode(editableComp);
        },

        clone: function() {
            return new this.$class();
        },

        isReady: function() {
            return true;
        },

        _markPreviewPostionDirty: function(){
            this._isPreviewPositionDirty = true;
        },

        _onWindowScroll: function(event) {
            var windowScrollY = window.getScroll().y;
            var previewDocument = this._preview.contentWindow || this._preview.contentDocument.window;

            previewDocument.scrollTo(0, windowScrollY);

            //TODO: 14 Oct 2013: is this still necessary?
            //Icky safari-hack, cannot render position:fixed in side positioned iframes. meh.
//            this._bgNode = this._bgNode || this._previewFrame.contentWindow.document.getElementById('bgNode');
//            if (this._bgNode.style.position === 'fixed') {
//                this.resources.W.Utils.forceBrowserRepaintOnScroll(this._bgNode);
//
//            }
        },

        _handlePreviewFrameResizeOnEditMode: function(mode) {
            this._handlePreviewFrameResize(mode, W.Config.env.$viewingDevice);
        },

        _handlePreviewFrameResizeOnViewerState: function(params) {
            this._handlePreviewFrameResize(W.Config.env.$editorMode, params.viewerMode);
        },

        _handlePreviewFrameResize: function(editorMode, viewingDevice) {
            var defaultStyle = Constants.EditorUI.PREVIEW_SIZE_POSITION.DEFAULT;
            var mobileEditorStyle = Constants.EditorUI.PREVIEW_SIZE_POSITION.MOBILE_EDITOR;
            var mobilePreviewStyle = Constants.EditorUI.PREVIEW_SIZE_POSITION.MOBILE_PREVIEW;

            if (editorMode !== Constants.EditorStates.EDIT_MODE.PREVIEW) {
                switch (viewingDevice) {
                    case Constants.ViewerTypesParams.TYPES.MOBILE:
                        this.setPreviewFrameSizePosition(mobileEditorStyle);
                        break;
                    case Constants.ViewerTypesParams.TYPES.DESKTOP:
                        this.setPreviewFrameSizePosition(defaultStyle);
                        break;
                }
                return;
            }

            switch (viewingDevice) {
                case Constants.ViewerTypesParams.TYPES.MOBILE:
                    this.setPreviewFrameSizePosition(mobilePreviewStyle);
                    break;
                case Constants.ViewerTypesParams.TYPES.DESKTOP:
                    this.setPreviewFrameSizePosition(defaultStyle);
                    break;
            }

        },

        /**
         * Set The preview position and size
         * @param {Object} style
         * @param {Number} [style.width]
         * @param {Number} [style.height]
         * @param {Number} [style.top]
         * @param {Number|String} [style.left] number or 'center'
         * @param {Number} [style.bottom] when width can't be used
         * @param {Number} [style.right] when width can't be used
         */
        setPreviewFrameSizePosition: function(style) {
            var center = (style.left === 'center');
            this._previewCurrentSizePosition = style || {};
            var newStyle = {
                'width' : _.isNumber(style.width)   ? style.width + 'px'  : 'auto',
                'height': _.isNumber(style.height)  ? style.height + 'px' : 'auto',
                'top'   : _.isNumber(style.top)     ? style.top + 'px'    : 'auto',
                'bottom': _.isNumber(style.bottom)  ? style.bottom + 'px' : 'auto',
                'right' : _.isNumber(style.right)   ? style.right + 'px'  : 'auto',
                'left'  : _.isNumber(style.left)    ? style.left + 'px'   : 'auto',
                'margin-left': 'auto'
            };
            if (center){
                var width = style.width || 0;
                newStyle['left'] = -(width / 2) + 'px';
                newStyle['margin-left'] = '50%';
            }

            if(this._previewContainer) {
                this._previewContainer.setStyles(newStyle);
            }
        },

        /**
         * Get the iframe position,
         * Position is cached in order to save DOM calls.
         * Position is marked as 'dirty' upon a resize event of Editor / Viewer.
         * if top and left are defined as numbers returned saved values,
         * else calc from dom (dependent on the fact the iframe position is FIXED)
         * @returns {{
         *   x: Number,
         *   y: Number
         * }}
         */
        getPreviewPosition: function() {
            if (!this._cachedPreviewPosition || this._isPreviewPositionDirty) {
                var position = {x: 0, y: 0};
                if (_.isNumber(this._previewCurrentSizePosition.left)) {
                    position.x = this._previewCurrentSizePosition.left;}
                else{
                    position.x = this.getIFrame().getPosition().x - window.pageXOffset;
                }
                if (_.isNumber(this._previewCurrentSizePosition.top)) {
                    position.y = this._previewCurrentSizePosition.top;
                }
                else {
                    position.y = this.getIFrame().getPosition().y - window.pageYOffset;
                }
                this._cachedPreviewPosition = position ;
                this._isPreviewPositionDirty = false ;
            }

            return this._cachedPreviewPosition ;
        },

        _handlePreviewFrameResizeToDefault: function() {
            this._handlePreviewFrameResize(W.Config.env.$editorMode, W.Config.env.$viewingDevice);
        },

        _handlePreviewModeChange: function(scopeMode, command) {
            var editorMode = this._resources.W.Config.env.isEditorInPreviewMode() ;
            if(this._isInPreviewMode !== editorMode) {
                this._isInPreviewMode = editorMode ;
                this._resetPreviewPosition();
            }
        },

        _resetPreviewPosition: function () {
            var previewDocument = this._preview.contentWindow || this._preview.contentDocument.window;
            previewDocument.scrollTo(0, 0);
        }
    });

});