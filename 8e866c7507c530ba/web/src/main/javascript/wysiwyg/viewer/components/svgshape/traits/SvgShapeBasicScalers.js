/**
 * Created with IntelliJ IDEA.
 * User: eitanr@wix.com
 * Date: 05/06/13
 * Time: 20:01
 * To change this template use File | Settings | File Templates.
 */
define.Class('wysiwyg.viewer.components.svgshape.traits.SvgShapeBasicScalers', function (classDefinition) {
    /**@type wysiwyg.viewer.components.svgshape.traits.SvgShapeBasicScalers */
    var def = classDefinition;

    def.methods({
//        _scaleSingleValue: function (value, scale) {
//            return this.round(parseFloat(value) * scale);
//        },

        _scaleSingleValueHorizontal: function (singleValue) {
            return this._scaleSingleValue(singleValue, this.scaleX);
        },

        _scaleSingleValueVertical: function (singleValue) {
            return this._scaleSingleValue(singleValue, this.scaleY);
        },

        _scalePairString: function (pairString) {
            var commandValues = pairString.split(/[\s,]+/);
            return this._scaleSingleValueHorizontal(commandValues[0]) + ' ' + this._scaleSingleValueVertical(commandValues[1]);
        },

        _scaleMultiplePairStrings: function (multiplePairStrings) {
            var commandValues = multiplePairStrings.split(',').map(function (val) {
                return this._scalePairString(this.trim(val));
            }.bind(this));
            return commandValues.join(',');
        }
    });
});








