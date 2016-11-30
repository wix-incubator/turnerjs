'use strict';
const packageNameRegex = /packages\/(.+?)\//;

function getModifiedPackages(projectPath) {
    const shell = require('shelljs');
    shell.cd(projectPath);
    const gitDiff = shell.exec('git status -s', {silent: true}).stdout;

    return gitDiff.split('\n')
        .filter(file => packageNameRegex.test(file))
        .map(file => packageNameRegex.exec(file)[1])
        .reduce((acc, packageName) => Object.assign(acc, {[packageName]: true}), {});
}

module.exports = {
    getModifiedPackages
};
