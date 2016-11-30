/** @class wysiwyg.editor.components.StaticGridLines */
define.component('wysiwyg.editor.components.StaticGridLines', function (compDefinition) {
    /**@type core.managers.component.ComponentDefinition*/
    var def = compDefinition;

    def.inherits('core.components.base.BaseComp');

    def.skinParts({
        pagesContainerTop: {type: 'htmlElement'},
        pagesContainerBottom: {type: 'htmlElement'},
        gridBodyRight: {type: 'htmlElement'},
        gridBodyLeft: {type: 'htmlElement'}
    });

    def.states({
        'verticalGridLines': ['verticalDisabled', 'verticalEnabled'],
        'horizontalGridLines': ['horizontalDisabled', 'horizontalEnabled'],
        'viewingDevice': [Constants.ViewerTypesParams.TYPES.MOBILE, Constants.ViewerTypesParams.TYPES.DESKTOP]
    });

    def.binds([
        'toggleGrid', '_refreshGridLines', '_handleEditStateChangeToEditor', '_handleViewerStateChange',
        '_isDesktopEditor', '_refreshHorizontalGridLines', '_refreshVerticalGridLines'
    ]);

    def.resources(['W.Editor', 'W.Commands', 'W.Preview', 'W.Config']);


    def.methods({
        initialize: function(compId, viewNode, argsObject) {
            this.parent(compId, viewNode, argsObject);
            this._gridLinesTurnedOn = false;
            this._initLastPosOfVerticalGrids() ;
            this._registerCommandListeners();
        },

        _initLastPosOfVerticalGrids: function() {
            this._lastPageVerticalGridPos = {
                "left": 0,
                "right": 0
            };
        },

        _registerCommandListeners: function () {
            this.resources.W.Commands.registerCommandAndListener('EditorCommands.SiteLoaded', this, this._onSiteLoaded);
            this.resources.W.Commands.registerCommandAndListener("EditCommands.ToggleGridLines", this, this.toggleGrid);
            this.resources.W.Commands.registerCommandAndListener('WPreviewCommands.WEditModeChanged', this, this._handleEditStateChangeToEditor) ;
            this.resources.W.Commands.registerCommandAndListener('WPreviewCommands.ViewerStateChanged', this, this._handleViewerStateChange) ;

        },

        _handleEditStateChangeToEditor: function(editMode, commandEvent) {
            this._refreshGridLines() ;
        },

        _adjustHeightOfHorizontalGrid: function (scrollYOffset, skinPart) {
            var topGridPos = parseInt(skinPart.getStyle("top"));
            skinPart.setStyle("top", (topGridPos - scrollYOffset) + "px");
        },

        _handleViewerStateChange: function(commandParam, command) {
            switch (commandParam.viewerMode) {
                case Constants.ViewerTypesParams.TYPES.MOBILE:
                    this.setState(Constants.ViewerTypesParams.TYPES.MOBILE, 'viewingDevice');
                    break;
                case Constants.ViewerTypesParams.TYPES.DESKTOP:
                    this.setState(Constants.ViewerTypesParams.TYPES.DESKTOP, 'viewingDevice');
                    this._refreshGridLines() ;
                    break;
            }
        },

        _onSiteLoaded: function() {
            this._topBarHeight = this.resources.W.Preview.getPreviewPosition() ;

            var previewSite             = this.resources.W.Preview.getPreviewManagers().Viewer ;
            this._headerNode            = previewSite.getHeaderContainer();
            this._pagesContainerNode    = previewSite.getPagesContainer() ;
            this._footerNode            = previewSite.getFooterContainer() ;

            var nodesToListenOn = [this._headerNode.$logic, this._pagesContainerNode.$logic, this._footerNode.$logic] ;

            this._registerListenersOnNodeEvent(nodesToListenOn, Constants.CoreEvents.RESIZE,    this._refreshGridLines) ;
            this._registerListenersOnNodeEvent(nodesToListenOn, 'componentMoved',               this._refreshGridLines) ;

            window.addEvent(Constants.CoreEvents.RESIZE, this._refreshGridLines);
            window.addEvent(Constants.CoreEvents.SCROLL, this._refreshGridLines);

            previewSite.addEvent("pageTransitionEnded", this._refreshGridLines);

            this._topHorzLines      = [this._skinParts.pagesContainerTop];
            this._bottomHorzLines   = [this._skinParts.pagesContainerBottom];
            this._horzLines = this._topHorzLines.concat(this._bottomHorzLines) ;

            this._handleViewerStateChange({viewerMode: this.resources.W.Config.env.$viewingDevice});

            this.resources.W.Commands.executeCommand('EditorCommands.GridLinesLoaded');

            var viewerCommandsMgr = this.resources.W.Preview.getPreviewManagers().Commands ;
            viewerCommandsMgr.registerCommandAndListener('WPreviewCommands.PageGroupLayoutChange', this, this._refreshGridLines) ;
        },

        _registerListenersOnNodeEvent: function(nodes, event, eventHandler) {
            for(var i=0; i < nodes.length; i++) {
                nodes[i].addEvent(event, eventHandler) ;
            }
        },

        _refreshGridLines: _.debounce(function _refreshGridLines() {
            if(this._isDesktopEditor()) {
                this._refreshVerticalGridLines() ;
                this._refreshHorizontalGridLines() ;
            }
        },10),

        _isDesktopEditor: function () {
            return Constants.ViewerTypesParams.TYPES.DESKTOP === this.getState("viewingDevice") && this._isInEditorMode();
        },

        _isInEditorMode: function () {
            return !this.resources.W.Config.env.isEditorInPreviewMode();
        },

        _refreshHorizontalGridLines: function() {
            if (this.getState('horizontalGridLines') === 'horizontalEnabled') {
                var pagesContainerTopYPosition      = this._pagesContainerNode.getLogic().getY() + this._topBarHeight.y;
                var pagesContainerBottomYPosition   = pagesContainerTopYPosition + this._pagesContainerNode.getLogic().getHeight();

                this._skinParts.pagesContainerTop.setStyle("top", pagesContainerTopYPosition + "px");
                this._skinParts.pagesContainerBottom.setStyle("top", pagesContainerBottomYPosition + "px");
            }
        },

        _refreshVerticalGridLines: function() {
            if (this.getState('verticalGridLines') === 'verticalEnabled') {
                // calc positions
                var pagesContainerLeftBorder = this._calcVerticalGridXPos() ;
                var pagesContainerRightBorder = pagesContainerLeftBorder + this._pagesContainerNode.getLogic().getWidth() ;
                // memoize
                this._memoizeVerticalGridsXCoords(pagesContainerLeftBorder, pagesContainerRightBorder);
                // update
                this._updateVerticalGridsXCoords();
                this._updateVerticalGridsHeight();
            }
        },

        _calcVerticalGridXPos: function () {
            var pagesContainerLeftBorder = this._pagesContainerNode.getPosition().x;
            if (pagesContainerLeftBorder <= 0) {
                pagesContainerLeftBorder = this._lastPageVerticalGridPos.left;
            }
            return pagesContainerLeftBorder;
        },

        _memoizeVerticalGridsXCoords: function (leftGridXPos, rightGridXPos) {
            if (this._lastPageVerticalGridPos) {
                this._lastPageVerticalGridPos.left  = (leftGridXPos > 0 ? leftGridXPos : this._lastPageVerticalGridPos.left);
                this._lastPageVerticalGridPos.right = (rightGridXPos > 0 ? rightGridXPos : this._lastPageVerticalGridPos.right);
            }
        },

        _updateVerticalGridsXCoords: function () {
            this._skinParts.gridBodyLeft.setStyle('left', this._lastPageVerticalGridPos.left + "px");
            this._skinParts.gridBodyRight.setStyle('left', this._lastPageVerticalGridPos.right + "px");
        },

        _updateVerticalGridsHeight: function () {
            var editorDocumentHeight    = this.resources.W.Preview.getPreviewSite().document.getSize().y ;
            var editorScrollHeight      = this.resources.W.Preview.getPreviewSite().document.getScroll().y ;
            var calculatedHeight        = (this._topBarHeight.y + editorDocumentHeight + editorScrollHeight) + "px";
            this._skinParts.gridBodyLeft.setStyle("height", calculatedHeight);
            this._skinParts.gridBodyRight.setStyle("height", calculatedHeight);
        },

        toggleGrid: function(isShowing) {
            var shouldShow = isShowing || !this._gridLinesTurnedOn ;
            if (shouldShow) {
                this.showAllGridLines();
            } else {
                this.hideAllGridLines();
            }

            LOG.reportEvent(wixEvents.TOGGLE_GRIDLINES_FROM_TOPBAR, {c1:shouldShow});
        },

        showAllGridLines: function() {
            this._gridLinesTurnedOn = true;
            this.showHorizontalGridLines();
            this.showVerticalGridLines();
        },

        hideAllGridLines: function() {
            this._gridLinesTurnedOn = false;
            this.hideHorizontalGridLines();
            this.hideVerticalGridLines();
        },

        showVerticalGridLines: function() {
            this.setState('verticalEnabled', 'verticalGridLines');
            this._refreshVerticalGridLines();
        },

        hideVerticalGridLines: function() {
            if (!this._gridLinesTurnedOn) {
                this.setState('verticalDisabled', 'verticalGridLines');
            }
        },

        showHorizontalGridLines: function() {
            this.setState('horizontalEnabled', 'horizontalGridLines');
            this._refreshHorizontalGridLines();
        },

        hideHorizontalGridLines: function() {
            if (!this._gridLinesTurnedOn) {
                this.setState('horizontalDisabled', 'horizontalGridLines');
            }
        },

        areGridLinesTurnedOn: function() {
            return this._gridLinesTurnedOn ;
        }
    });
});
