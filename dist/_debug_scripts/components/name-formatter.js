'use strict';
var NameFormatter = (function () {
    function NameFormatter() {
    }
    return NameFormatter;
}());
angular
    .module('turnerjsAppInternal')
    .component('nameFormatter', {
    template: "<span data-hook=\"name-container\">Name: {{$ctrl.name}}</span>",
    controller: NameFormatter,
    bindings: {
        name: '='
    }
});
//# sourceMappingURL=name-formatter.js.map