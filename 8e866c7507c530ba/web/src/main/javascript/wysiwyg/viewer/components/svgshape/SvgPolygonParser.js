/**
 * User: eitanr@wix.com
 * Date: 12/06/13
 * Time: 14:14
 */
define.Class('wysiwyg.viewer.components.svgshape.SvgPolygonParser', function (classDefinition) {
    /**@type wysiwyg.viewer.components.svgshape.SvgPolygonParser */
    var def = classDefinition;

    def.traits(["wysiwyg.viewer.components.svgshape.traits.SvgShapeUtils"]);

    def.methods({
        initialize: function (svgPolygonElement) {
            this.polygonElement = svgPolygonElement;
        },
        getParsedPoints: function () {
            var points = this.trim(this.polygonElement.getAttribute('points')).split(/[\s,]+/),
                pointsPairs = [],
                i;

            for (i = 0; i < points.length; i += 2) {
                pointsPairs.push([points[i], points[i + 1]]);
            }
            return pointsPairs;
        },
        stringifyPoints: function (parsedPoints) {
            var resultString = '';
            parsedPoints.forEach(function (pointsPairArr) {
                resultString += pointsPairArr.join(',') + ' ';
            });
            return this.trim(resultString);
        }
    });
});








