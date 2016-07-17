'use strict';
var NameInput = (function () {
    function NameInput() {
    }
    NameInput.prototype.onAddName = function () {
        this.onNameAdded({ name: this.currentName });
        this.currentName = '';
    };
    return NameInput;
}());
angular
    .module('turnerjsAppInternal')
    .component('nameInput', {
    template: "<div data-hook=\"name-input-container\">\n                Name to add: <input type=\"text\" data-hook=\"name-input\" name=\"name\" ng-model=\"$ctrl.currentName\"/>\n                <button type=\"button\" data-hook=\"add-name-button\" ng-click=\"$ctrl.onAddName()\">Add</button>\n               </div>",
    bindings: {
        onNameAdded: '&'
    },
    controller: NameInput
});
//# sourceMappingURL=name-input.js.map