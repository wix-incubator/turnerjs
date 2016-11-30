/**
 * Created with IntelliJ IDEA.
 * User: eitanr@wix.com
 * Date: 05/06/13
 * Time: 20:01
 * To change this template use File | Settings | File Templates.
 */
define.Class('wysiwyg.viewer.components.svgshape.traits.SvgShapeUtils', function (classDefinition) {
    /**@type wysiwyg.viewer.components.svgshape.traits.SvgShapeUtils */
    var def = classDefinition;

    def.methods({
        trim: function (str) {
            return str.replace(/^\s+|\s+$/g, '');
        },
        round: function (val) {
            return Math.round(val * 1000000) / 1000000;
        }
    });
});








