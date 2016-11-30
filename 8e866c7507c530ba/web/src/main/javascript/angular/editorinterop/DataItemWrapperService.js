W.AngularManager.executeExperiment('NGCore', function () {
    'use strict';

    /**
     * @ngdoc service
     * @name editorInterop.factory:dataItemWrapper
     * @description
     */

    angular.module('editorInterop').factory('dataItemWrapper', function ($rootScope) {
        function _createGetterSetter(clone, propName) {
            if (!clone.hasOwnProperty(propName)) {
                Object.defineProperty(
                    clone,
                    propName, {
                        get: function () {
                            return this._dataItem._data[propName];
                        },
                        set: function (value) {
                            this._dataItem.set(propName, value);
                        }
                    });
            }
        }

        return {
            wrapDataItem: function wrapDataItem(dataItem) {
                var clone = {
                    destroy: function () {
                        clone._dataItem.offByListener(this);
                    }
                };
                Object.defineProperty(clone, '_dataItem', {
                    enumerable: false,
                    value: dataItem
                });


                _.forOwn(dataItem._schema, function (val, prop) {
                    _createGetterSetter(clone, prop);
                });
                _.forOwn(dataItem._data, function (val, prop) {
                    _createGetterSetter(clone, prop);
                });

                clone._dataItem.on('dataChanged', clone, function (params) {
                    if (!(params && params.data && params.data.newValue)) {
                        return;
                    }
                    $rootScope.safeApply();
                });

                clone.getLegacyDataItem = function () {
                    return this._dataItem;
                };

                return clone;
            }
        };

    });


});