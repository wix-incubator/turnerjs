/**
 * Created with IntelliJ IDEA.
 * User: eitanr@wix.com
 * Date: 04/06/13
 * Time: 19:29
 * To change this template use File | Settings | File Templates.
 */
define.Class('wysiwyg.viewer.components.svgshape.SvgPathScaler', function (classDefinition) {
    /**@type sysiwyg.viewer.components.svgshape.path.SvgPathScaler */
    var def = classDefinition;

    def.traits(["wysiwyg.viewer.components.svgshape.traits.SvgShapeBasicScalers",
        "wysiwyg.viewer.components.svgshape.traits.SvgShapeCommonScalers"]);

    def.utilize(['wysiwyg.viewer.components.svgshape.SvgPathParser']);

    def.methods({
        initialize: function (svgPathElement) {
            this.pathElement = svgPathElement;
            this.parser = new this.imports.SvgPathParser(this.pathElement);
            this._createScalers();
        },

        _createScalers: function () {
            this._commandScalers = {
                M: this._scalePairString,
                L: this._scaleMultiplePairStrings,
                H: this._scaleSingleValueHorizontal,
                V: this._scaleSingleValueVertical,
                Z: this._emptyString,
                C: this._scaleMultiplePairStrings,
                S: this._scaleMultiplePairStrings,
                Q: this._scaleMultiplePairStrings,
                T: this._scalePairString,
                A: this._scaleArcString
            };
        },

        _emptyString: function () {
            return '';
        },

        _scaleAngleValue: function(value) {
            return this._scaleSingleValue(value, (this.scaleY / (this.scaleX * 360)));
        },

        _scaleArcString: function (arcString) {
            var commandValues = arcString.split(/[\s,]+/);

            if (commandValues.length !== 7) {
                throw new Error('incorrect arc string, should have exactly 7 parameters. (value was ' + arcString);
            }

            commandValues[0] = this._scaleSingleValueHorizontal(commandValues[0]);
            commandValues[1] = this._scaleSingleValueVertical(commandValues[1]);
            commandValues[2] = this._scaleAngleValue(commandValues[2]);
            commandValues[5] = this._scaleSingleValueHorizontal(commandValues[5]);
            commandValues[6] = this._scaleSingleValueVertical(commandValues[6]);

            return commandValues.join(' ');
        },

        scale: function (scaleX, scaleY) {
            var parsedPath = this.parser.getParsedPath();
            this.scaleX = scaleX;
            this.scaleY = scaleY;
            parsedPath.forEach(function (commandValueArr) {
                commandValueArr[1] = this._commandScalers[commandValueArr[0].toUpperCase()].call(this, commandValueArr[1]);
            }.bind(this));

            this.pathElement.setAttribute('d', this.parser.stringifyParsedPath(parsedPath));
        }
    });
});