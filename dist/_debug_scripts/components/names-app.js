'use strict';
var NamesApp = (function () {
    function NamesApp() {
        this.names = [];
        this.showNames = true;
    }
    NamesApp.prototype.onNameAdded = function () {
        this.names.push(this.currentName);
        this.currentName = '';
    };
    return NamesApp;
}());
angular
    .module('turnerjsAppInternal')
    .component('namesApp', {
    template: "<div data-hook=\"names-app\">\n                Name to add: <input type=\"text\" data-hook=\"name-input\" name=\"name\" ng-model=\"$ctrl.currentName\"/>\n                <button type=\"button\" data-hook=\"add-name-button\" ng-click=\"$ctrl.onNameAdded()\">Add</button>\n                <div>\n                  Hide names: <input type=\"checkbox\" data-hook=\"show-list-toggle\" ng-model=\"$ctrl.showNames\">\n                  <name-list data-hook=\"name-list\" ng-if=\"$ctrl.showNames\" names=\"$ctrl.names\"></name-list>\n                </div>\n               </div>",
    controller: NamesApp
});
//# sourceMappingURL=names-app.js.map