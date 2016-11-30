define([],
    function(){
        'use strict';

        function getStyle(ps, styleId) {
            var stylePointer = ps.pointers.data.getThemeItem(styleId.replace('#', ''));
            return ps.dal.get(stylePointer);
        }

        function getStyleId(ps, compPointer){
            return ps.dal.get(ps.pointers.getInnerPointer(compPointer, 'styleId'));
        }

        function runStyleValidations(styleId, styleValue) {
            if (styleId){
                if (!styleValue){
                    throw new Error('There is no existing style for styleId [' + styleId + ']');
                }
                if (typeof styleValue !== 'object') {
                    throw new Error('The given style for for styleId [' + styleId + '] is not an object');
                }
                if (!styleValue.skin) {
                    throw new Error('The given style for for styleId [' + styleId + '] does not contain a skin');
                }
                if (!styleValue.type) {
                    throw new Error('The given style for for styleId [' + styleId + '] does not contain a type');
                }
            }
        }

        function validateComponentStyle(ps, compPointer){
            var styleId = getStyleId(ps, compPointer);
            validateStyleById(ps, styleId);
        }

        function validateStyleById(ps, styleId){
            var styleItem = getStyle(ps, styleId);
            runStyleValidations(styleId, styleItem);
        }


        /**
         * @exports documentServices/validation/validators/styleValidator
         */
        return {
            validateComponentStyle: validateComponentStyle,
            validateStyleById: validateStyleById
        };
});
