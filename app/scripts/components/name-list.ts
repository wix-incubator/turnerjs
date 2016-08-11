'use strict';

class NameList {
  names: string[];
}

angular
  .module('turnerjsAppInternal')
  .component('nameList', {

    template: `<div data-hook="names-container">
                <ul>
                    <li ng-repeat="name in $ctrl.names track by $index"><name-formatter id="name-number-{{$index}}" name="name"></name-formatter></li>
                </ul>
               </div>`,
    controller: NameList,
    bindings: {
      names: '='
    }
  });
