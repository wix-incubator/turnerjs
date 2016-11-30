/** @type wysiwyg.viewer.components.sm.SMFormValidationHelper */
define.Class('wysiwyg.viewer.components.sm.SMFormValidationHelper', function(componentDefinition) {

    /** @type core.managers.component.ComponentDefinition */
    var def = componentDefinition ;

    def.resources(['W.Utils']) ;

    def.statics({
        PASS_MIN_LEN: 4,
        PASS_MAX_LEN: 15
    }) ;

    def.methods({
        isEmailBlank: function(email) {
            if (email) {
                return false;
            }
            return true ;
        },

        isEmailValid: function(email) {
            return this.resources.W.Utils.isValidEmail(email) ;
        },

        isBlankPassword: function(password) {
            if (password) {
                return false;
            }
            return true ;
        },

        isPasswordLengthValid: function(password) {
            if (password.length < this.PASS_MIN_LEN || password.length > this.PASS_MAX_LEN ) {
                return false;
            }
            return true ;
        },

        doPasswordsMatch: function(password, retypedPassword) {
            if (password !== retypedPassword) {
                return false;
            }
            return true ;
        },

        _isAsciiOnlyInput: function (value){
            var length = value.length;
            var maxLength = this.PASS_MAX_LEN ;
            for(var i=0; i < length && i < maxLength; i++) {
                if(value.charCodeAt(i) > 127) {
                    return false;
                }
            }
            return true;
        }
    }) ;
}) ;