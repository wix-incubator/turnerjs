define.Class('wysiwyg.editor.components.inputs.traits.InputComponentWithValidators', function(classDefinition) {
    /**@type bootstrap.managers.classmanager.ClassDefinition*/
    var def = classDefinition;

    def.utilize(['wysiwyg.editor.utils.InputValidators']);

    def.methods({

        setValidators: function (validatorArgs) {
            this._initiateValidators();
            this._validators = this._getValidators(validatorArgs.validators || []);
            this._validationOkCallback = validatorArgs.validationOkCallback || function () {};
            this._validationFailCallback = validatorArgs.validationFailCallback || function () {};
        },

        _initiateValidators: function() {
            if (this._inputValidators) {
                return;
            }
            this._inputValidators = new this.imports.InputValidators();

            this._charactersValidator = this._inputValidators.charactersValidator;
            this._alphanumericAndPeriodValidator = this._inputValidators.alphanumericAndPeriodValidator;
            this._htmlCharactersValidator = this._inputValidators.htmlCharactersValidator;
            this._numKeywordValidator = this._inputValidators.numKeywordValidator;
            this._pageNameCharactersValidator = this._inputValidators.pageNameCharactersValidator;
            this._pageNameValidator = this._inputValidators.pageNameValidator;
        },

        _getValidators: function(validatorArray) {
            return _.map(validatorArray, function(validator) {
                if (typeof validator === 'string') {
                    validator = !validator.indexOf('_') ? validator : '_' + validator;
                    return this[validator];
                }
                return validator;
            }, this);
        }
    });

});
