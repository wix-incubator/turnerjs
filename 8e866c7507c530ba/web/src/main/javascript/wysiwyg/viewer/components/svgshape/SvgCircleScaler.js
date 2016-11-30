/**
 * User: eitanr@wix.com
 * Date: 04/07/13
 * Time: 20:58
 */
define.Class('wysiwyg.viewer.components.svgshape.SvgCircleScaler', function (classDefinition) {
    /**@type wysiwyg.viewer.components.svgshape.SvgCircleScaler */
    var def = classDefinition;

    def.traits(["wysiwyg.viewer.components.svgshape.traits.SvgShapeCommonScalers"]);

    def.methods({
        initialize: function (svgCircleElement) {
            this.circleElement = svgCircleElement;
        },
        scale: function (scaleX, scaleY) {
            var cxAttribute = this.circleElement.getAttribute('cx'),
                cyAttribute = this.circleElement.getAttribute('cy'),
                rAttribute = this.circleElement.getAttribute('r'),
                actualScale = Math.min(scaleX, scaleY);

            if (cxAttribute && cyAttribute) {
                this.circleElement.setAttribute('cx', this._scaleSingleValue(cxAttribute, actualScale));
                this.circleElement.setAttribute('cy', this._scaleSingleValue(cyAttribute, actualScale));
                this.circleElement.setAttribute('r', this._scaleSingleValue(rAttribute, actualScale));
            }
        }
    });
});








