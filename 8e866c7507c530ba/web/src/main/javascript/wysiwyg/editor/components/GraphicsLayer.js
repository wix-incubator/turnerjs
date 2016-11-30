define.component('wysiwyg.editor.components.GraphicsLayer', function(componentDefinition){

    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('core.components.base.BaseComp');

    def.resources(['W.Commands', 'W.Editor', 'W.Preview', 'W.Utils']);

    def.methods({
        initialize: function(compId, viewNode, args) {
            this.parent(compId, viewNode, args);
            this.resources.W.Commands.registerCommandAndListener("Graphics.Clear", this, this._clearGraphics);
            this.resources.W.Commands.registerCommandAndListener("Graphics.HighlightComponent", this, this._highlightComponent);
            this.resources.W.Commands.registerCommandAndListener("Graphics.DrawLine", this, this._drawLine);
        },
        _getSvg: function() {
            return this.$view.firstChild;
        },
        _clearGraphics: function() {
            this._hide();
            var svg = this._getSvg();
            while (svg.firstChild) {
                svg.removeChild(svg.firstChild);
            }
            this._lastScroll = undefined;
        },
        _highlightComponent: function(params) {
            this._show();
            var compCoordinates = this.resources.W.Editor.calcEditorCoordinates(params.component);
            var styles = params.styles || { };
            this._drawCompRect(compCoordinates, styles);
        },
        _drawCompRect: function(compCoordinates, styles) {
            var svg = this._getSvg(),
                rect = document.createElementNS("http://www.w3.org/2000/svg","rect");

            rect.setAttributeNS(null, "x", compCoordinates.x);
            rect.setAttributeNS(null, "y", compCoordinates.y + this._lastScroll);
            rect.setAttributeNS(null, "width", compCoordinates.w);
            rect.setAttributeNS(null, "height", compCoordinates.h);

            rect.setAttributeNS(null, "stroke", styles.borderColor || "#000000");
            rect.setAttributeNS(null, "stroke-width", styles.borderWidth || "1");
            rect.setAttributeNS(null, "stroke-dasharray", styles.dashWidth || "0");
            rect.setAttributeNS(null, "fill", styles.bgColor || "none");
            rect.setAttributeNS(null, "fill-opacity", styles.bgOpacity || "1.0");

            svg.appendChild(rect);
        },
        _drawSvgSolidLine: function (point1, point2, svg, color, isAbsoluteY) {
            var yTop = (isAbsoluteY ? 0: this._lastScroll);
            var line = document.createElementNS("http://www.w3.org/2000/svg","line");
            line.setAttributeNS(null, "x1", "" + point1.x);
            line.setAttributeNS(null, "y1", "" + (point1.y + yTop));
            line.setAttributeNS(null, "x2", "" + point2.x);
            line.setAttributeNS(null, "y2", "" + (point2.y + yTop));
            line.setAttributeNS(null, "stroke", color);
            line.setAttributeNS(null, "stroke-width", "1");

            svg.appendChild(line);
        },
        _updateSvgContainerPositionIfNeeded: function() {
            var currentScroll = window.getScroll().y;
            if (this._lastScroll != currentScroll) {
                this._fixSvgPosition();
                this._lastScroll = currentScroll;
            }
        },
        _fixSvgPosition: function() {
            var mainBar = this.resources.W.Editor.getEditorUI().getMainBarHeight();
            var windowSize = this.resources.W.Utils.getWindowSize();
            var svg = this._getSvg();
            svg.style.height = (this.resources.W.Preview.getPreviewManagers().Viewer.getSiteHeight() + mainBar) + "px";
            svg.style.width = (windowSize.width) + "px";
            this.$view.style.height = svg.style.height;
            this.$view.style.width = svg.style.width;
        },
        _hide: function() {
            this.$view.style.height = "0px";
            this.$view.style.width = "0px";
            this.$view.style.display = "none";
        },
        _show: function() {
            this.$view.style.display = "block";
            this._updateSvgContainerPositionIfNeeded();
        },
        _drawLine: function(params) {
            this._show();
            this._drawSvgSolidLine(
                params.point1,
                params.point2,
                this._getSvg(),
                params.color,
                params.isAbsoluteY
            );
        }
    });
});
