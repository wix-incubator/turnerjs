/**
 * @class bootstrap.utils.Utils
 */
define.bootstrapClass('bootstrap.utils.Utils', function () {
    /** @constructor */
    function Utils() {
    }

    /** @lends bootstrap.utils.Utils */
    Utils.extendPrototype({
        /**
         * @internal
         * @return {Utils}
         */
        init:function () {
            var self = this;
            this._mergeDefinitions();
            this.define.utils.definitionModifier = function(name, utilDef) {
                self._mergeDefinition(name, utilDef);
            };
//            this._getUtilsDependencies();

            this._prefixCounterMap = {};
        },

        _mergeDefinitions: function() {
            var utilsDefs = this.define.getDefinition('utils');
            for(var name in utilsDefs) {
                this._mergeDefinition(name, utilsDefs[name]);
            }
        },

        _mergeDefinition: function(name, definition) {
            if(name.split(':').pop()==='this') {
                Utils.extendPrototype(definition());
            } else {
                this._mergeToUtils(name, definition);
            }
        },

        _mergeToUtils: function(name, utilDef) {
            var utilData = utilDef();
            var mergeDefinition = {};
            mergeDefinition[name] = utilData;
            Utils.extendPrototype(mergeDefinition);
        },

        clone: function(newDefine) {
            return this; // needs to be fixed
        },

        isReady: function() {
            return true;
        }


    });

    return Utils;
});

//
//UtilsClass.prototype._getUtilsDependencies = function(){
//    var self = this;
//    if (W.Classes) {
//        W.Classes.get('mobile.core.managers.Hash', function(HashClass){
//            self.hash = new HashClass();
//        });
//        W.Classes.get('mobile.core.utils.Styles', function(StylesClass){
//            self._styles = new StylesClass();
//        });
//        W.Classes.get('mobile.core.utils.Tween', function(TweenClass){
//            self.Tween = TweenClass;
//        });
//    }
//};
//
//UtilsClass.prototype.clone = function(){
//    return new UtilsClass();
//};
//
//UtilsClass.prototype.isReady = function(){
//    if(this.hash&&this._styles&&this.Tween){
//        return true;
//    }
//};
//
//W.Utils = new UtilsClass();
