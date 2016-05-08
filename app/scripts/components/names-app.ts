'use strict';

class NamesApp {
  names: Array<string>;
  currentName: string;
  showNames: boolean;

  constructor() {
    this.names = [];
    this.showNames = true;
  }

  onNameAdded() {
    this.names.push(this.currentName);
    this.currentName = '';
  }
}

angular
  .module('turnerjsAppInternal')
  .component('namesApp', {

    template: `<div data-hook="names-app">
                Name to add: <input type="text" data-hook="name-input" name="name" ng-model="$ctrl.currentName"/>
                <button type="button" data-hook="add-name-button" ng-click="$ctrl.onNameAdded()">Add</button>
                <div>
                  Hide names: <input type="checkbox" data-hook="show-list-toggle" ng-model="$ctrl.showNames">
                  <name-list data-hook="name-list" ng-if="$ctrl.showNames" names="$ctrl.names"></name-list>
                </div>
               </div>`,

    controller: NamesApp
  });
