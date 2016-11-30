#!/usr/bin/env node

'use strict'

const buildUtils = require('./lib/buildUtils.js')

buildUtils.bashCommand('npm --version')
buildUtils.bashCommand('npm config get registry')

buildUtils.bashCommand('npm cache clean')


buildUtils.runTeamcityBlock('npm install', () => {
    buildUtils.bashCommandOrError('npm install', 'npm install failed!')
})
