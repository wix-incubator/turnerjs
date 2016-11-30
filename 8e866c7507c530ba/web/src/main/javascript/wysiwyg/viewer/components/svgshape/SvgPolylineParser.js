/**
 * Created with IntelliJ IDEA.
 * User: eitanr@wix.com
 * Date: 04/06/13
 * Time: 19:29
 * To change this template use File | Settings | File Templates.
 */
define.Class('wysiwyg.viewer.components.svgshape.SvgPolylineParser', function (classDefinition) {
    /**@type sysiwyg.viewer.components.svgshape.SvgPolylineParser */
    var def = classDefinition;

    def.traits(["wysiwyg.viewer.components.svgshape.traits.SvgShapeUtils"]);

    def.methods({
        initialize: function (svgPolylineElement) {
            this.polylineElement = svgPolylineElement;
        },
        getParsedPolyline: function () {
            var pointsString = this.trim(this.polylineElement.getAttribute('points')),
                parsedPolyline = pointsString.replace(/ /ig,',').split(','),
                result = [];

            parsedPolyline.forEach(function (coord, index, coords) {
                if (index % 2 === 0) {
                    result.push(coord + ' ' + coords[index + 1]);
                }
            });

            return result;
        },
        stringifyParsedPolyline: function (parsedPolyline) {
            return parsedPolyline.join(',');
        }
    });
});