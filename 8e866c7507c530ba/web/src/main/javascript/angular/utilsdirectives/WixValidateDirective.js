W.AngularManager.executeExperiment('NGDialogManagement', function () {
    'use strict';

    var utilsDirectives = angular.module('utilsDirectives');

    utilsDirectives.directive('wixValidate', function (inputValidators) {
        return {
            restrict: 'A',
            require: '?ngModel',
            link: function (scope, element, attrs, ngModel) {
                /* istanbul ignore next */
                if (!ngModel) {
                    throw ('use of wix validate requires ng-model attribute');
                }

                var validationType = scope.$eval(attrs.wixValidate);

                if (!validationType) {
                    return;
                }


                if (!inputValidators[validationType]) {
                    throw ('validator ' + validationType + ' is not defined in validators service');
                }


                var oldValue = ngModel.$viewValue || '',
                    validatorFunc = inputValidators[validationType].bind(inputValidators);

                ngModel.$parsers.push(function (newValue) {
                    var errorMessage = validatorFunc(newValue);
                    if (!errorMessage) {
                        oldValue = newValue;
                        ngModel.$setValidity(validationType, true);
                        return newValue;
                    } else {
                        ngModel.$setValidity(validationType, false);
                        scope.errorMessage = errorMessage;
                        return oldValue;
                    }
                });
            }
        };
    });
});