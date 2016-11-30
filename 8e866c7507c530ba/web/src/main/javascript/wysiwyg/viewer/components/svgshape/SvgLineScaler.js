/**
 * User: eitanr@wix.com
 * Date: 04/07/13
 * Time: 20:58
 */
define.Class('wysiwyg.viewer.components.svgshape.SvgLineScaler', function (classDefinition) {
    /**@type wysiwyg.viewer.components.svgshape.SvgLineScaler */
    var def = classDefinition;

    def.traits(["wysiwyg.viewer.components.svgshape.traits.SvgShapeCommonScalers"]);

    def.methods({
        initialize: function (svgLineElement) {
            this.lineElement = svgLineElement;
        },
        scale: function (scaleX, scaleY) {
            var x1Attribute = this.lineElement.getAttribute('x1'),
                y1Attribute = this.lineElement.getAttribute('y1'),
                x2Attribute = this.lineElement.getAttribute('x2'),
                y2Attribute = this.lineElement.getAttribute('y2');

            if (x1Attribute && y1Attribute && x2Attribute && y2Attribute) {
                this.lineElement.setAttribute('x1', this._scaleSingleValue(x1Attribute, scaleX));
                this.lineElement.setAttribute('x2', this._scaleSingleValue(x2Attribute, scaleX));


                this.lineElement.setAttribute('y1', this._scaleSingleValue(y1Attribute, scaleY));
                this.lineElement.setAttribute('y2', this._scaleSingleValue(y2Attribute, scaleY));
            }
        }
    });
});








