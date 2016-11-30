define.Class('wysiwyg.viewer.components.traits.ValidationSettings', function(classDefinition){
    /**@type bootstrap.managers.classmanager.ClassDefinition*/
    var def = classDefinition;

    def.statics({
        VALID_STATE_CHANGED_EVENT: 'validStateChanged'
    });

    def.fields({
        _isValid: true
    });

    def.methods({

        _validationFunction: function(data){
            return true;
        },
        initialize: function(compId, viewNode, argsObject){
            this.parent(compId, viewNode, argsObject);
            if(argsObject.validationFunction){
                this.setValidationFunction(argsObject.validationFunction);
            }
        },
        setValidationState: function(isValid){
            var changed = this._isValid !== isValid;
            this._isValid = isValid;
            if(changed){
                this.fireEvent(this.VALID_STATE_CHANGED_EVENT, isValid);
            }
        },
        setValidationFunction: function(validationFunction){
            this._validationFunction = validationFunction;
        }
    });
});
