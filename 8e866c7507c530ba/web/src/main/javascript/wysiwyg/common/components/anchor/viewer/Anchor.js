define.component('wysiwyg.common.components.anchor.viewer.Anchor', function(componentDefinition){
    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('core.components.base.BaseComp');

    def.resources(['W.Config', 'W.Viewer', 'W.Commands', 'W.Data']);

    def.dataTypes(['Anchor']);

    def.binds(['_setCompSize']);

    def.utilize([
        'wysiwyg.common.utils.ScrollAnimation'
    ]);

    def.states({
        'visibility':['hidden', 'visible']
    });

    def.skinParts({});
    def.methods({
        initialize: function (compId, viewNode, args) {
            this.parent(compId, viewNode, args);
            this._registerEvents();
        },
        _onRender: function (renderEvent) {
            var invalidations = renderEvent.data.invalidations;

            if (invalidations.isInvalidated([this.INVALIDATIONS.FIRST_RENDER])) {
                this._toggleVisibility();
                this._setCompSize();
            }
        },
        isRenderNeeded: function (invalidations) {
            var renderTriggers = [
                this.INVALIDATIONS.DATA_CHANGE,
                this.INVALIDATIONS.FIRST_RENDER
            ];
            return invalidations.isInvalidated(renderTriggers);
        },
        _setCompSize: function(){
            this._setViewerWidth();
            this._adjustToScreenWidth();
        },
        _setViewerWidth: function(){
            this._docWidth = this.resources.W.Viewer.getDocWidth();
            this._clientWidth = document.body.clientWidth;
        },
        _adjustToScreenWidth: function() {
            var width, left, buttonLeft, rulerWidth;

            if(this.resources.W.Config.env.isViewingSecondaryDevice()) {
                width = this._docWidth;
                left = 0;
                buttonLeft = width - this.getSelectableWidth();
            } else {
                width = document.body.clientWidth;
                left = this._getDiff();
                buttonLeft = this._clientWidth - this.getSelectableWidth();
            }

            buttonLeft -= this._getRulerWidth();

            this.setWidth(width - 2);
            this.$view.style.left = left + 'px';
            this._skinParts.anchorFrame.style.left = buttonLeft + 'px';
        },
        _getDiff: function() {
            var offset = (this._docWidth - this._clientWidth) / 2;
            return offset >= 0  ? 0 : offset;
        },
        isInViewer: function(){
            return this.resources.W.Config.env.isPublicViewer() || this.resources.W.Config.env.isEditorInPreviewMode();
        },
        _toggleVisibility: function(){
            this.setState(this.isInViewer() ? 'hidden' : 'visible');
        },
        getShowOnAllPagesChangeability: function(){
            return false;
        },
        canBeDraggedIntoContainer: function(){
            return false;
        },
        _getRulerWidth: function(){
            return 0;
        },
        dispose: function(){
            this._unregisterEvents();
            this.parent();
        },
        _registerEvents: function(){
            window.addEvent('resize', this._setCompSize);
        },
        _unregisterEvents: function(){
            window.removeEvent('resize', this._setCompSize);
        }
    });

});