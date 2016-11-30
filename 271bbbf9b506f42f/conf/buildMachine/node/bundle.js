#!/usr/bin/env node

'use strict'

const buildUtils = require('./lib/buildUtils.js')

console.log('bundle version:')
buildUtils.bashCommand('bundle --version')

buildUtils.bashCommand('rm -rf .bundle')
buildUtils.bashCommand('rm -rf vendor')

buildUtils.runTeamcityBlock('bundle install', () => {
    buildUtils.bashCommand('bundle install --path vendor/bundle')
})

buildUtils.bashCommandOrError('which sass', 'Bad agent! (no sass)')

const sassVersion = buildUtils.getBashResult('sass -v')
if (!/Sass 3\.[3-9]\./.test(sassVersion)) {
    buildUtils.teamcityError(`Bad agent! (bad sass version: ${sassVersion})`)
}
