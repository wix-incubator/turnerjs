'use strict';

class NameFormatter {
  name: string;
}

angular
  .module('turnerjsAppInternal')
  .component('nameFormatter', {
    template: `<span data-hook="name-container">Name: {{$ctrl.name}}</span>`,
    controller: NameFormatter,
    bindings: {
      name: '='
    }
  });
