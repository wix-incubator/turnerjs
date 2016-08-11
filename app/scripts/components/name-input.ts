'use strict';

class NameInput {
  currentName: string;
  onNameAdded: Function;

  onAddName() {
    this.onNameAdded({name: this.currentName});
    this.currentName = '';
  }
}

angular
  .module('turnerjsAppInternal')
  .component('nameInput', {
    template: `<div data-hook="name-input-container">
                Name to add: <input type="text" data-hook="name-input" name="name" ng-model="$ctrl.currentName"/>
                <button type="button" data-hook="add-name-button" ng-click="$ctrl.onAddName()">Add</button>
               </div>`,
    bindings: {
      onNameAdded: '&'
    },
    controller: NameInput
  });
