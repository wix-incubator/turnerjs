'use strict';
var NamesApp = (function () {
    function NamesApp() {
        this.names = [];
        this.showNames = true;
    }
    NamesApp.prototype.onNameAdded = function (name) {
        this.names.push(name);
    };
    return NamesApp;
}());
angular
    .module('turnerjsAppInternal')
    .component('namesApp', {
    template: "<div data-hook=\"names-app\">\n                <name-input on-name-added=\"$ctrl.onNameAdded(name)\"></name-input>\n                <div>\n                  Hide names: <input type=\"checkbox\" data-hook=\"show-list-toggle\" ng-model=\"$ctrl.showNames\">\n                  <name-list data-hook=\"name-list\" ng-if=\"$ctrl.showNames\" names=\"$ctrl.names\"></name-list>\n                </div>\n               </div>",
    controller: NamesApp
});
//# sourceMappingURL=names-app.js.map