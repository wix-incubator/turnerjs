'use strict';

function assign(to) {
  Array.prototype.forEach.call(arguments, function(from) {
    if (from === undefined || from === null || from === to) {
      return;
    }
    from = Object(from);

    Object.keys(from).forEach(function(key) {
      var desc = Object.getOwnPropertyDescriptor(from, key);
      if (desc !== undefined && desc.enumerable) {
        to[key] = from[key];
      }
    });
  });
  return to;
}

module.exports = {
  assign: assign
};
