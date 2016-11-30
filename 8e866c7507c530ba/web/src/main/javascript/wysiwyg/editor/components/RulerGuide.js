define.component('wysiwyg.editor.components.RulerGuide', function (compDefinition, experimentStrategy) {
    /**@type core.managers.component.ComponentDefinition*/
    var def = compDefinition;

    def.inherits('mobile.core.components.base.BaseComponent');

    def.skinParts({
        guideHandle: {type: 'htmlElement'},
        guideLine: {type: 'htmlElement'}
    });

    def.resources(['W.Theme','W.Resources', 'W.Editor']);

    def.statics({
        _TIME_TO_SUPPRESS_HOVER_TOOLTIP_AFTER_GUIDE_CLICK: 2300,
        _TIME_TO_SHOW_CLICK_TOOLTIP: 2000
    });

    def.states({
        "orientation": ["horz", "vert"]
    });

    def.binds(['onGuideHover','onGuideClick','onGuideDoubleClick','onGuideHoverLeave','onGuideMouseDown']);

    def.methods({
        initialize: function(compId, viewNode, argsObject) {
            this.parent(compId, viewNode, argsObject);
            this.orientationHorizontal = argsObject.orientationHorizontal;
            if (this.orientationHorizontal) { //todo: this is actually reverse, because of the ruler. need a better name for both. top/right ruler perhaps?
                this.pixels = argsObject.left;
                this.left = argsObject.left + 'px';
            }
            else {
                this.pixels = argsObject.top;
                this.top = argsObject.top + 'px';
            }
        },

        _onAllSkinPartsReady: function(e) {
            this.setState(this.orientationHorizontal ? "horz" : "vert", "orientation");

            if (this.orientationHorizontal) {
//                this is the top ruler
                this._skinParts.view.setStyle('left', this.left);
            }
            else {
//                this is the right ruler
                this._skinParts.view.setStyle('top', this.top);
            }

            this._view.addEvent('mousemove', this.onGuideHover);
            this._view.addEvent('mouseleave', this.onGuideHoverLeave);
            this._view.addEvent('click', this.onGuideClick);
            this._view.addEvent('mousedown', this.onGuideMouseDown);
            this._view.addEvent('dblclick', this.onGuideDoubleClick);
            this._enableDrag();
        },

        /**
         * Make the panel draggable
         */
        _enableDrag: function(){
            var limits;
            if (this.orientationHorizontal) {
                limits = {
                    x:[-3000, 3000],
                    y:[0, 0]
                };
            }
            else {
                limits = {
                    x:[0, 0],
                    y:[0, this.resources.W.Editor.getDocumentHeight()]
                };
            }
            this._drag = new Drag(this._skinParts.view, {
                snap:0,
                handle: this._skinParts.guideHandle,
                limit:limits,
                onDrag: function(e) {
                    this._isDragged = true;
                    if (this.orientationHorizontal) {
                        this.pixels = e.style.left.toInt(); //todo: not a very elegant way to get the left. but, others i tried didn't work.
                        var leftScreenLimit = -(document.documentElement.clientWidth-W.Preview.getPreviewManagers().Viewer.getDocWidth())/2 + 20;
                        var rightScreenLimit = W.Preview.getPreviewManagers().Viewer.getDocWidth() -leftScreenLimit;
                        if (this.pixels<leftScreenLimit || this.pixels>rightScreenLimit) {
                            LOG.reportEvent(wixEvents.RULERS_GUIDE_DELETED, {c1: 'drag'}); //TODO: duplicate code with the one below for vertical and the one for double click!
                            this._drag.stop();
                            this.dispose();
                            W.Commands.executeCommand('Tooltip.CloseTip');
                        }
                    }
                    else {
                        this.pixels = e.style.top.toInt(); //todo: not a very elegant way to get the top. but, others i tried didn't work.
                        if (this.pixels<20) {
                            LOG.reportEvent(wixEvents.RULERS_GUIDE_DELETED, {c1: 'drag'});
                            this._drag.stop();
                            this.dispose();
                            W.Commands.executeCommand('Tooltip.CloseTip');
                        }
                    }
                }.bind(this),
                onComplete: function(el){
                    this._isDragged = false;
                    this.setGuideHandleHighlight(false);
                }.bind(this)
            });
        },

        onGuideHover: function(e) {
            // MODIFIED IN THIS EXPERIMENT: prevent default mouse event and stop his propagation to cancel hovering on the guideline
            if(e.target === this._skinParts.guideLine){
                e.event.preventDefault();
                return;
            }
            if (this.dontHover) {
                return;
            }
            var axis = this.orientationHorizontal ? 'X' : 'Y';
            this.setGuideHandleHighlight(true);
            W.Commands.executeCommand('Tooltip.ShowTip', {html: axis + ":&nbsp;" + this.pixels + '&nbsp;px', showTimer: 1}, this._skinParts.guideHandle);
        },

        onGuideHoverLeave: function (e) {
            if (this.dontHover) {
                return;
            }
            if (!this._isDragged) {
                this.setGuideHandleHighlight(false);
            }
            W.Commands.executeCommand('Tooltip.CloseTip');
        },

        setGuideHandleHighlight: function (bool) {
            if (this.orientationHorizontal) {
                this._skinParts.guideHandle.setStyle('background-position', bool ? '-13px 18px' : '0 18px');
            } else {
                this._skinParts.guideHandle.setStyle('background-position', bool ? '0 -13px' : '0 0');
            }
        },

        onGuideClick: function(e) {
            e.preventDefault();
            this.dontHover=true;
            if (this._suppress_tooltip_hover_timeout) {
                clearTimeout(this._suppress_tooltip_hover_timeout);
            }
            this._suppress_tooltip_hover_timeout = setTimeout(function() {this.dontHover=false;}.bind(this), this._TIME_TO_SUPPRESS_HOVER_TOOLTIP_AFTER_GUIDE_CLICK);
            LOG.reportEvent(wixEvents.RULERS_GUIDE_CLICKED);
            W.Commands.executeCommand('Tooltip.ShowTip', {html: this.resources.W.Resources.get('EDITOR_LANGUAGE', 'EDITOR_RULER_GUIDES_CLICK_TT'), showTimer: 1}, this._skinParts.guideHandle);

            if (this._close_click_tooltip_timeout) {
                clearTimeout(this._close_click_tooltip_timeout);
            }
            this._close_click_tooltip_timeout = setTimeout(function(){W.Commands.executeCommand('Tooltip.CloseTip');}, this._TIME_TO_SHOW_CLICK_TOOLTIP);
            e.stopPropagation();
        },

        onGuideMouseDown: function(e) {
            e.preventDefault();
            e.stopPropagation();
        },

        onGuideDoubleClick: function(e) {
            LOG.reportEvent(wixEvents.RULERS_GUIDE_DELETED, {c1: 'double-click'});
            LOG.reportEvent(wixEvents.RULERS_GUIDE_DELETED, {c1: 'double-click'});
            this.dispose();
            W.Commands.executeCommand('Tooltip.CloseTip');
            e.stopPropagation();
        }
    });
});

