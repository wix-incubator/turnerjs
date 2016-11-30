/**
 * User: eitanr@wix.com
 * Date: 11/06/13
 * Time: 20:58
 */
define.Class('wysiwyg.viewer.components.svgshape.SvgPolygonScaler', function (classDefinition) {
    /**@type wysiwyg.viewer.components.svgshape.SvgPolygonScaler */
    var def = classDefinition;

    def.traits(["wysiwyg.viewer.components.svgshape.traits.SvgShapeCommonScalers"]);

    def.utilize(['wysiwyg.viewer.components.svgshape.SvgPolygonParser']);

    def.methods({
        initialize: function (svgPolygonElement) {
            this.polygonElement = svgPolygonElement;
            this.parser = new this.imports.SvgPolygonParser(this.polygonElement);
        },
        scale: function (scaleX, scaleY) {
            var parsedPolygonPoints = this.parser.getParsedPoints();

            parsedPolygonPoints.forEach(function (polygonPoint) {
                polygonPoint[0] = this._scaleSingleValue(polygonPoint[0], scaleX);
                polygonPoint[1] = this._scaleSingleValue(polygonPoint[1], scaleY);
            }.bind(this));

            this.polygonElement.setAttribute('points', this.parser.stringifyPoints(parsedPolygonPoints));
        }
    });
});








