'use strict';
var NameList = (function () {
    function NameList() {
    }
    return NameList;
}());
angular
    .module('turnerjsAppInternal')
    .component('nameList', {
    template: "<div data-hook=\"names-container\">\n                <ul>\n                    <li ng-repeat=\"name in $ctrl.names\"><name-formatter id=\"name-number-{{$index}}\" name=\"name\"></name-formatter></li>\n                </ul>\n               </div>",
    controller: NameList,
    bindings: {
        names: '='
    }
});
//# sourceMappingURL=name-list.js.map