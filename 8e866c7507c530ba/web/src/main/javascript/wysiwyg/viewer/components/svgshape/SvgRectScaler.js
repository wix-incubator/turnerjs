/**
 * User: eitanr@wix.com
 * Date: 11/06/13
 * Time: 20:58
 */
define.Class('wysiwyg.viewer.components.svgshape.SvgRectScaler', function (classDefinition) {
    /**@type wysiwyg.viewer.components.svgshape.SvgRectScaler */
    var def = classDefinition;

    def.traits(["wysiwyg.viewer.components.svgshape.traits.SvgShapeCommonScalers"]);

    def.methods({
        initialize: function (svgRectElement) {
            this.rectElement = svgRectElement;
        },
        _scaleAttribute: function (attributeName, originalValue, scale) {
            if (originalValue) {
                this.rectElement.setAttribute(attributeName, this._scaleSingleValue(originalValue, scale));
            }
        },
        scale: function (scaleX, scaleY) {
            var width = this.rectElement.getAttribute('width'),
                height = this.rectElement.getAttribute('height'),
                rx = this.rectElement.getAttribute('rx'),
                ry = this.rectElement.getAttribute('ry'),
                x = this.rectElement.getAttribute('x'),
                y = this.rectElement.getAttribute('y');

            this._scaleAttribute('width', width, scaleX);
            this._scaleAttribute('height', height, scaleY);
            this._scaleAttribute('x', x, scaleX);
            this._scaleAttribute('y', y, scaleY);
            this._scaleAttribute('rx', rx, scaleX);
            this._scaleAttribute('ry', ry, scaleY);
        }
    });
});








