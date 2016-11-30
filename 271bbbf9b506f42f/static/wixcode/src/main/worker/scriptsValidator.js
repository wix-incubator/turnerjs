'use strict';

function validateProp(script, prop) {
  return script[prop];
}

function validateScripts(scripts, properties) {
  var errorScripts = scripts.filter(function(script) {
    return !properties.every(validateProp.bind(null, script));
  }).map(function(script) {
    return JSON.stringify(script);
  });

  if (errorScripts.length) {
    throw new Error('scripts must contain ' + properties.join(', ') + ': ' + errorScripts);
  }
}

module.exports = {
  validate: validateScripts
};
