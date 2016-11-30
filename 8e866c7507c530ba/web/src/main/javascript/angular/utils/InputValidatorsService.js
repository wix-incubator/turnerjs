W.AngularManager.executeExperiment('NGCore', function () {
    'use strict';

    var utils = angular.module('utils');

    /**
     * @ngdoc service
     *@name utils.factory:inputValidators
     *
     *
     * @description
     * A service that provides validation methods for inputs.
     * The validators will not return anything if the input is valid.
     * If the input is invalid, a User ready response string will be returned.
     */
    utils.factory('inputValidators', function (editorResources) {
        var validators = {
            _generalCharactersValidator: function (text, invalidChars) {
                var re = new RegExp("[" + invalidChars + "]");
                var match = text.match(re);
                if (match !== null) {
                    return editorResources.translate('INPUT_INVALID_CHARACTERS') + " (" + match.join() + ")";
                }
            },

            /**
             * @ngdoc method
             * @name utils.factory:inputValidators#htmlCharactersValidator
             * @param {string} text  The text to test for validity
             * @methodOf utils.factory:inputValidators
             * @returns {string} will return a message ONLY if the result is invalid.
             * @description
             * Checks that the text does not contain the < and > characters, thus checking that no HTML tags are in the text
             */
            htmlCharactersValidator: function (text) {
                if (!text) {
                    return;
                }
                return this._generalCharactersValidator(text, "><");
            },

            /**
             * @ngdoc method
             * @name utils.factory:inputValidators#alphanumericAndPeriodValidator
             * @param {string} text  The text to test for validity
             * @methodOf utils.factory:inputValidators
             * @returns {string} will return a message ONLY if the result is invalid.
             * @description
             * Checks that the text contains only alphanumeric characters or a period.
             */
            alphanumericAndPeriodValidator: function (text) {
                var re = new RegExp("[^a-zA-Z0-9.]");
                var match = text.match(re);
                if (match !== null) {
                    return editorResources.translate('INPUT_INVALID_CHARACTERS') + " (" + match.join() + ")";
                }
            }
        };

        return validators;
    });
});