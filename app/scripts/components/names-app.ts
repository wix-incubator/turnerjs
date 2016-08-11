'use strict';

class NamesApp {
  names: Array<string>;
  showNames: boolean;

  constructor() {
    this.names = [];
    this.showNames = true;
  }

  onNameAdded(name) {
    this.names.push(name);
  }
}

angular
  .module('turnerjsAppInternal')
  .component('namesApp', {

    template: `<div data-hook="names-app">
                <name-input on-name-added="$ctrl.onNameAdded(name)"></name-input>
                <div>
                  Hide names: <input type="checkbox" data-hook="show-list-toggle" ng-model="$ctrl.showNames">
                  <name-list data-hook="name-list" ng-if="$ctrl.showNames" names="$ctrl.names"></name-list>
                </div>
               </div>`,

    controller: NamesApp
  });
