define.component("wysiwyg.editor.components.EditorDecorations", function(componentDefinition) {
    /**@type core.managers.component.ComponentDefinition*/
    var def = componentDefinition;

    def.inherits('core.components.base.BaseComp');

    def.resources(['W.Commands', 'W.Preview', 'W.Editor', 'W.Config']);

    def.binds(['_onViewerStateChanged', '_onEditModeChanged', '_setScrollingHandleHeight', '_setScrollingHandlePosition']);

    def.states({
        editorMode    : ['edit', 'preview'],
        viewDeviceMode: ['desktop', 'mobile']
    });

    def.skinParts({
        mobilePreviewOverlayContainer: {type: 'htmlElement'},
        mobileOverlayPreviewPhoneLeft           : {type: 'htmlElement'},
        mobileOverlayPreviewPhoneRight           : {type: 'htmlElement'},
        mobileOverlayPreviewPhoneBottom           : {type: 'htmlElement'},
        mobileEditorOverlayContainer : {type: 'htmlElement'},
        mobileOverlayLeft            : {type: 'htmlElement'},
        mobileOverlayRight           : {type: 'htmlElement'},
        mobileOverlayPhoneLeft       : {type: 'htmlElement'},
        mobileOverlayPhoneRight      : {type: 'htmlElement'},
        mobileOverlayPhoneBottom     : {type: 'htmlElement'},
        mobilePreviewScrollbar       : {type: 'wysiwyg.editor.components.CustomScrollbar'}
    });

    def.methods({
        initialize: function(compId, viewNode, args) {
            this.parent(compId, viewNode, args);
            this.resources.W.Commands.registerCommandAndListener('WPreviewCommands.ViewerStateChanged', this, this._onViewerStateChanged);
            this.resources.W.Commands.registerCommandAndListener('WPreviewCommands.WEditModeChanged', this, this._onEditModeChanged);
        },

        _onRender: function(renderEvent) {
            this.parent(renderEvent);

            this.setState('edit', 'editorMode');
            this.setState('desktop', 'viewDeviceMode');

        },

        _onViewerStateChanged: function(params) {
            switch (params.viewerMode) {
                case Constants.ViewerTypesParams.TYPES.MOBILE:
                    this.setState('mobile', 'viewDeviceMode');
                    this.resources.W.Preview.getPreviewManagers().Viewer.addEvent('resize', this._setScrollingHandleHeight);
                    this.resources.W.Preview.getPreviewManagers().Viewer.addEvent('pageTransitionEnded', this._setScrollingHandlePosition);
                    this._setScrollingElement();
                    break;
//                case Constants.ViewerTypesParams.TYPES.DESKTOP:
                default:
                    this.setState('desktop', 'viewDeviceMode');
                    if (this.resources.W.Preview.getPreviewManagers()) {
                        this.resources.W.Preview.getPreviewManagers().Viewer.removeEvent('resize', this._setScrollingHandleHeight);
                        this.resources.W.Preview.getPreviewManagers().Viewer.removeEvent('pageTransitionEnded', this._setScrollingHandlePosition);
                    }
                    break;
            }
        },

        _onEditModeChanged: function(mode) {
            switch (mode) {
                case Constants.EditorStates.EDIT_MODE.PREVIEW:
                    this.setState('preview', 'editorMode');
                    if (this.resources.W.Config.env.$viewingDevice === Constants.ViewerTypesParams.TYPES.MOBILE) {
                        this._setScrollingHandleHeight();
                        this._setScrollingHandlePosition();
                    }
                    break;
//                case Constants.EditorStates.EDIT_MODE.CURRENT_PAGE:
//                case Constants.EditorStates.EDIT_MODE.MASTER_PAGE:
                default:
                    this.setState('edit', 'editorMode');
                    break;
            }
        },

        _setScrollingElement: function() {
            var frameSize = Constants.EditorUI.PREVIEW_SIZE_POSITION.MOBILE_PREVIEW;
            var heightOffset = -7,
                topOffset = 5,
                leftOffset = 24;

            var styleOverrides = {
                'height'     : frameSize.height + heightOffset,
                'top'        : frameSize.top + topOffset,
                'left'       : '50%',
                'margin-left': frameSize.width / 2 + leftOffset
            };
            this._skinParts.mobilePreviewScrollbar.setScrollingElement(W.Preview.getPreviewSite());
            this._skinParts.mobilePreviewScrollbar.setStyleOverrides(styleOverrides);
//            this._skinParts.mobilePreviewScrollbar.setExtraWheelSources([this._skinParts.preview.getViewNode()]);
        },

        _setScrollingHandleHeight: function(height) {
            height = height || this.resources.W.Preview.getSiteNode().$logic.getHeight();
            var frameSize = Constants.EditorUI.PREVIEW_SIZES.MOBILE;
            this._skinParts.mobilePreviewScrollbar.setScrollHandleHeightFromElement(height, frameSize.height);
        },

        _setScrollingHandlePosition: function(params) {
            params = params || {};
            this._skinParts.mobilePreviewScrollbar.setScrollHandlePosition(params.top || 0);

        }
    });
});