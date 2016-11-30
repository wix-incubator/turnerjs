/**
 * Created with IntelliJ IDEA.
 * User: eitanr@wix.com
 * Date: 05/06/13
 * Time: 20:01
 * To change this template use File | Settings | File Templates.
 */
define.Class('wysiwyg.viewer.components.svgshape.traits.SvgShapeCommonScalers', function (classDefinition) {
    /**@type wysiwyg.viewer.components.svgshape.traits.SvgShapeCommonScalers */
    var def = classDefinition;

    def.traits(["wysiwyg.viewer.components.svgshape.traits.SvgShapeUtils"]);

    def.methods({
        _scaleSingleValue: function (value, scale) {
            return this.round(parseFloat(value) * scale);
        }
    });
});









