/**
 * Created with IntelliJ IDEA.
 * User: eitanr@wix.com
 * Date: 04/06/13
 * Time: 19:29
 * To change this template use File | Settings | File Templates.
 */
define.Class('wysiwyg.viewer.components.svgshape.SvgPathParser', function (classDefinition) {
    /**@type sysiwyg.viewer.components.svgshape.SvgPathParser */
    var def = classDefinition;

    def.traits(["wysiwyg.viewer.components.svgshape.traits.SvgShapeUtils"]);

    def.methods({
        initialize: function (svgPathElement) {
            this.pathElement = svgPathElement;
        },
        getParsedPath: function(){
            var pathString = this.trim(this.pathElement.getAttribute('d')),
                pathSegments = pathString.match(/[a-z][^a-z]*/ig),
                parsedPath = pathSegments.map(function (segment) {
                    segment = segment.replace(/-/g, ' -').replace(/,/g, ' ');
                    while (segment.indexOf('  ') !== -1) {
                        segment = segment.replace(/ {2}/g, ' ');
                    }
                    return [segment.substring(0, 1), this.trim(segment.substring(1))];
                }.bind(this));

            return parsedPath.map(function (segment) {
                var spaceSeparated,
                    joined = [];

                if ('QSCL'.indexOf(segment[0].toUpperCase()) === -1 || segment[1].split(',').length !== 1) {
                    return segment;
                }

                spaceSeparated = segment[1].split(' ');
                if (spaceSeparated.length % 2 !== 0) {
                    //incorrect command instructions. skip parsing
                    return segment;
                }
                spaceSeparated.forEach(function (coord, index, coords) {
                    if (index % 2 === 0) {
                        joined.push(coord + ' ' + coords[index + 1]);
                    }
                });
                return [segment[0], joined.join(',')];
            });
        },
        stringifyParsedPath: function(parsedPath){
            var resultString = '';
            parsedPath.forEach(function (valueArr) {
                valueArr.forEach(function (value) {
                    resultString += value;
                });
            });
            return resultString;
        }
    });
});