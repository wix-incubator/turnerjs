/**
 * User: eitanr@wix.com
 * Date: 04/07/13
 * Time: 20:58
 */
define.Class('wysiwyg.viewer.components.svgshape.SvgEllipseScaler', function (classDefinition) {
    /**@type wysiwyg.viewer.components.svgshape.SvgEllipseScaler */
    var def = classDefinition;

    def.traits(["wysiwyg.viewer.components.svgshape.traits.SvgShapeCommonScalers"]);

    def.methods({
        initialize: function (svgEllipseElement) {
            this.ellipseElement = svgEllipseElement;
        },
        scale: function (scaleX, scaleY) {
            var cxAttribute = this.ellipseElement.getAttribute('cx'),
                cyAttribute = this.ellipseElement.getAttribute('cy'),
                rxAttribute = this.ellipseElement.getAttribute('rx'),
                ryAttribute = this.ellipseElement.getAttribute('ry');

            if (cxAttribute && rxAttribute) {
                this.ellipseElement.setAttribute('cx', this._scaleSingleValue(cxAttribute, scaleX));
                this.ellipseElement.setAttribute('rx', this._scaleSingleValue(rxAttribute, scaleX));
            }

            if (cyAttribute && ryAttribute) {
                this.ellipseElement.setAttribute('cy', this._scaleSingleValue(cyAttribute, scaleY));
                this.ellipseElement.setAttribute('ry', this._scaleSingleValue(ryAttribute, scaleY));
            }
        }
    });
});








