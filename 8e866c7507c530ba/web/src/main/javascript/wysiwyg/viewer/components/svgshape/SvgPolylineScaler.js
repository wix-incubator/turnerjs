/**
 * User: eitanr@wix.com
 * Date: 04/07/13
 * Time: 20:58
 */
define.Class('wysiwyg.viewer.components.svgshape.SvgPolylineScaler', function (classDefinition) {
    /**@type wysiwyg.viewer.components.svgshape.SvgPolylineScaler */
    var def = classDefinition;

    def.traits(["wysiwyg.viewer.components.svgshape.traits.SvgShapeBasicScalers",
        "wysiwyg.viewer.components.svgshape.traits.SvgShapeCommonScalers"]);

    def.utilize(['wysiwyg.viewer.components.svgshape.SvgPolylineParser']);

    def.methods({
        initialize: function (svgPolylineElement) {
            this.polylineElement = svgPolylineElement;
            this.parser = new this.imports.SvgPolylineParser(this.polylineElement);
        },
        scale: function (scaleX, scaleY) {
            var normalizedPolylineString = this.parser.stringifyParsedPolyline(this.parser.getParsedPolyline());
            this.scaleX = scaleX;
            this.scaleY = scaleY;

            this.polylineElement.setAttribute('points', this._scaleMultiplePairStrings(normalizedPolylineString));
        }
    });
});








