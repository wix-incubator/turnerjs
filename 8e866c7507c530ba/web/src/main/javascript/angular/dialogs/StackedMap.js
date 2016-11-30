W.AngularManager.executeExperiment('ngpromotedialog', function () {
    'use strict';

    /**
     * A helper, internal data structure that acts as a map but also allows getting / removing
     * elements in the LIFO order
     */
    angular.module('newSavePublish')
        .factory('StackedMap', function () {
            function StackedMap() {
                this._stack = [];
            }

            StackedMap.prototype = {
                add: function (key, value) {
                    this._stack.push({
                        key: key,
                        value: value
                    });
                },
                get: function (key) {
                    for (var i = 0; i < this._stack.length; i++) {
                        if (key === this._stack[i].key) {
                            return this._stack[i];
                        }
                    }
                },
                getByValueProperty: function(propertyName, propertyValue) {
                    for (var i = this._stack.length - 1; i >= 0; i--) {
                        if (this._stack[i].value[propertyName] === propertyValue) {
                            return this._stack[i];
                        }
                    }
                },
                top: function () {
                    return this._stack[this._stack.length - 1];
                },
                remove: function (key) {
                    var idx = -1;
                    for (var i = 0; i < this._stack.length; i++) {
                        if (key === this._stack[i].key) {
                            idx = i;
                            break;
                        }
                    }
                    return this._stack.splice(idx, 1)[0];
                },
                length: function () {
                    return this._stack.length;
                }
            };

            return StackedMap;
        });
});