define.component('wysiwyg.common.components.backtotopbutton.viewer.BackToTopButton', function(componentDefinition, experimentStrategy){
    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    /**@type bootstrap.managers.experiments.ExperimentStrategy*/
    var strategy = experimentStrategy;

    def.inherits('mobile.core.components.base.BaseComponent');

    def.resources(['W.Commands', 'W.Config']);

    def.binds(['_onWindowScroll', '_onClick', '_handleWindowResize', '_handleMobileRotation', '_onSiteReady']);

    def.skinParts({
        bg:{type:'htmlElement'}
    });

    def.statics({
        EDITOR_META_DATA:{
            general:{
                settings:false,
                design:false
            },

            mobile:{
                isTextScalable: false,
                allInputsHidden: true
            }
        }
    });

    def.methods({

        _collapsed: false, // better performance - no need to check the dom

        initialize: function (compId, viewNode, attr) {
            this.parent(compId, viewNode, attr);

            window.addEvent(Constants.CoreEvents.RESIZE, this._handleWindowResize);
            window.addEvent("orientationchange", this._handleMobileRotation);

            this.injects().Viewer.addEvent('SiteReady', this._onSiteReady);
            this.injects().Commands.registerCommandListenerByName("WPreviewCommands.WEditModeChanged", this, this._onEditModeChanged);
        },

        _handleWindowResize: function(){
            clearTimeout(this._handleWindowResizeTO);

            this._handleWindowResizeTO = setTimeout(function(){
                this._updateButtonPosition();
            }.bind(this), 100);
        },

        _handleMobileRotation: function () {
            this._handleWindowResize();
        },

        _fixZoom: function () {
            if(this.resources.W.Config.env.isPublicViewer()) {
                this.$view.style.zoom = 1 / this.resources.W.Config.mobileConfig.getZoom().toFixed(2);
            }
        },

        _onSiteReady: function () {
            this.injects().Viewer.removeEvent('SiteReady', this._onSiteReady);
            this._handleWindowResize();
        },

        _onEditModeChanged:function (editorMode) {
            this.getSkinPart("bg").setStyle("opacity", "0.01");
            this.$view.setCollapsed(!(this.resources.W.Config.env.isPublicViewer() || this.resources.W.Config.env.isEditorInPreviewMode()));
        },

        _updateButtonPosition: function(){
            this._fixZoom();
            var siteNode = this.injects().Viewer.getSiteNode();
            var siteNodePosition = siteNode.getPosition();
            var leftPosition = siteNodePosition.x + siteNode.getWidth();
            if(this.resources.W.Config.env.isPublicViewer()) {
                leftPosition *= this.resources.W.Config.mobileConfig.getZoom().toFixed(2);
            }
            if(this.$view){
                this.$view.setStyle("left", leftPosition + "px");

                if(this.resources.W.Config.env.$isEditorViewerFrame) {
                    this.$view.setStyle("bottom", "88px");
                }
            }
        },

        initComponentLayout: function() {
            this.parent();
            this.$view.setStyle("position", "fixed");
        },

        _onEnabled: function () {
            var bg = this.getSkinPart("bg");
            bg.setStyle("opacity", "0.01");
            this.$view.addEvent(Constants.CoreEvents.CLICK, this._onClick);
            window.addEvent(Constants.CoreEvents.SCROLL, this._onWindowScroll);
            this._handleWindowResize();
            this._onWindowScroll(null);
        },

        _onDisabled: function () {
            this.$view.removeEvent(Constants.CoreEvents.CLICK, this._onClick);
        },

        _onWindowScroll: function (e) {
            var _shouldCollapse = window.getScrollTop() < 100;
            if (_shouldCollapse !== this._collapsed) {
                this._collapsed = _shouldCollapse;
                this._animateOpacity(this._collapsed ? 0.01 : 1);
            }
        },

        _animateOpacity: function(value) {
            if(this._runningFX) {
                this._runningFX.stopTimer();
                this._runningFX.removeEvent("complete", arguments.callee);
            }
            var bg = this.getSkinPart("bg");
            this.$view.setCollapsed(!(this.resources.W.Config.env.isPublicViewer() || this.resources.W.Config.env.isEditorInPreviewMode()));
            this._runningFX = new Fx.Tween(bg, { duration:value ? 800 : 300 });
            this._runningFX.addEvent("complete", function () {
                this._runningFX.removeEvent("complete", arguments.callee);
                if(this.$view && this._collapsed) {
                    this.$view.collapse();
                }
            }.bind(this));
            this._runningFX.start("opacity", value);
        },

        _onClick: function (e) {
            var startY = window.getScrollTop();
            var that = this;
            this._animate(800, this._makeEaseInOut(this._easeQuad), function (progress) {
                that._updateScroll(startY - (startY*progress));
            });
        },

        _updateScroll: function (value) {
            if(this.resources.W.Config.env.$isEditorViewerFrame) {
                this.resources.W.Commands.executeCommand('WPreviewCommands.resetCustomScrollbar', {height:this.injects().Viewer.getSiteNode().getHeight(), top:value});
            } else {
                window.scrollTo(window.getScrollLeft(), value);
            }
        },

        dispose: function () {
            this.$view.removeEvent(Constants.CoreEvents.CLICK, this._onClick);
            window.removeEvent(Constants.CoreEvents.SCROLL, this._onWindowScroll);
            window.removeEvent("orientationchange", this._handleMobileRotation);

            this.parent();
        },

        // ==================================================
        // Scroll animation
        // ==================================================

        // TODO SCH 20/01/14 15:53 - Replace with a global animations system when implemented (bigel?)
        _animate: function (duration, deltaFunc, callback) {
            var startTime = new Date
            var animInterval = setInterval(function () {
                var timePassed = new Date - startTime;
                var progress = timePassed / duration;
                if (progress > 1) progress = 1;
                var delta = deltaFunc(progress);
                callback(delta);
                if (progress == 1) {
                    clearInterval(animInterval);
                }
            }, 10);
        },

        _easeQuad: function (progress) {
            return Math.pow(progress, 2);
        },

        _makeEaseInOut: function (delta) {
            return function (progress) {
                if (progress < .5) return delta(2 * progress) * .5;
                else return (2 - delta(2 * (1 - progress))) * .5;
            }
        }
    });
});

