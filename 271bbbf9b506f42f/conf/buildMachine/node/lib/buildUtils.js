'use strict'

const exec = require('child_process').execSync

function runTeamcityBlock(title, syncCb) {
    console.log(`##teamcity[blockOpened name='${title}']`)
    syncCb()
    console.log(`##teamcity[blockClosed name='${title}']`)
}

function teamcityError(desc) {
    console.log(`##teamcity[buildProblem description='${desc}']`)
}

function getBashResult(command) {
    return exec(command).toString().trim()
}

function bashCommand(command) {
    console.log(`"${command}":`)
    try {
        exec(command, {stdio: ['inherit', 'inherit', 'pipe']})
    } catch (e) {
        console.log('<Failed to execute>')
        console.log('--------------------------------')
        console.log(e.toString())
        return e
    }
    console.log('--------------------------------')
    return null
}

function bashCommandOrError(command, error) {
    const err = bashCommand(command)
    if (err) {
        teamcityError(error)
    }
}

module.exports = {
    runTeamcityBlock,
    teamcityError,
    getBashResult,
    bashCommand,
    bashCommandOrError
}
