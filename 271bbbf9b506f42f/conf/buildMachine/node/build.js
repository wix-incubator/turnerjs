#!/usr/bin/env node

'use strict'

const buildUtils = require('./lib/buildUtils')

buildUtils.runTeamcityBlock('Build Setup', () => {
    const subSteps = ['state_check', 'bundle', 'npm']

    subSteps.forEach(step => {
        buildUtils.runTeamcityBlock(step, () => {
            require(`./${step}`)
        })
    })

})

buildUtils.runTeamcityBlock('Build Sources', () => {
    buildUtils.bashCommandOrError('command mkdir -p target', 'Build Failed!')
    buildUtils.bashCommandOrError('npm run teamcity-build', 'Build Failed!')
    buildUtils.bashCommandOrError('command cp -R target/packages-bin packages-bin', 'Build Failed!')
})

buildUtils.runTeamcityBlock('Run Tests', () => {
    buildUtils.bashCommandOrError('npm run teamcity-test', 'Tests failed!')
})

buildUtils.runTeamcityBlock('Publish to private NPM registry', () => {
    require('santa-utils').ciUtils.versionByRC(err => {
        if (err) {
            buildUtils.teamcityError(err)
        }
    })
})
