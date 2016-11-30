/**
 * Created with IntelliJ IDEA.
 * User: eitanr@wix.com
 * Date: 27/05/13
 * Time: 14:44
 * To change this template use File | Settings | File Templates.
 */
define.Class('wysiwyg.viewer.components.traits.CustomPreviewBehavior', function (classDefinition) {
    /**@type wysiwyg.viewer.components.traits.CustomPreviewBehavior */
    var def = classDefinition;

    def.resources(['W.Config', 'W.Commands']);

    def.methods({
        _isPreviewMode: function () {
            return this.resources.W.Config.env.$isEditorViewerFrame;
        },
        _overlayElementExists: function () {
            return !!this._overlayElement;
        },
        _createOverlayElement: function () {
            this._overlayElement = new Element("A");
        },
        _createOverlayElementStyles: function () {
            var transparentGifUrl = this.resources.W.Config.getServiceTopologyProperty('staticThemeUrlWeb') + "/transparent.gif";

            this._overlayElement.setStyles({
                position: 'absolute',
                top: '0',
                left: '0',
                height: '100%',
                width: '100%',
                background: "transparent url(" + transparentGifUrl + ") repeat top left;"
            });
        },
        _bindOverlayElementEvents: function () {
            this._overlayElement.addEvent("click", function (ev) {
                ev.stopPropagation();
                this.resources.W.Commands.executeCommand('CustomPreviewBehavior.interact', { component: this, tooltipId: this._overlayElementTooltipId }, this);
            }.bind(this));
        },

        _createClickOverlayForPreviewMode: function (tooltipId) {
            if (!this._isPreviewMode()) {
                return;
            }

            this._overlayElementTooltipId = tooltipId;

            if (!this._overlayElementExists()) {
                this._createOverlayElement();
                this._createOverlayElementStyles();
                this._bindOverlayElementEvents();
                this.getViewNode().adopt(this._overlayElement);
            }
        }
    });
});








