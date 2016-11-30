import fs from 'fs';
import path from 'path';


// version code
const loadedVersions = new Map();
const versionList = [];

const basePath = path.normalize(__dirname + '/../../..');

const moduleFilePathFor = function(version) {
  return basePath + '/modules/santa/' + version + '/santa.js';
};

const cleanup = function () {
  if (versionList.length > 2) {
    const evict = versionList.pop();
    const evictedModuleKey = moduleFilePathFor(evict);
    if (loadedVersions.delete(evict)) {
      console.log("deleting " + evict);
      delete require.cache[evictedModuleKey];
    }
  }
};

function loadVersion(version) {
  console.log(version);
  if (!loadedVersions.has(version)) {
    const file = moduleFilePathFor(version);
    console.log(file);
    if (fs.existsSync(file)) {
      const newModule = require(file);
      loadedVersions.set(version, newModule);
      versionList.unshift(version);
      cleanup();
    }
  }
  if (loadedVersions.has(version)) {
    return loadedVersions.get(version);
  } else {
    throw new Error('oh no!');
  }
};

exports.loadVersion = loadVersion;