#!/usr/bin/env node

'use strict'

const buildUtils = require('./lib/buildUtils.js')

const home = process.env.HOME || process.env.USERPROFILE

const fsChecks = [
    `cat ${home}/.npmrc`,
    'cat ./.npmrc',
    `ls -lha ${home}/.ssh`
]

const envVarsCommands = [
    'echo $PATH',
    'echo $BUNDLE_PATH',
    'echo $GEM_PATH',
    'echo $GEM_HOME'
]

const toolsVersions = [
    'ruby -v',
    'bundle -v',
    'node -v',
    'npm -v',
    'nvm --version',
    'sass -v'
]

fsChecks.forEach(buildUtils.bashCommand)
envVarsCommands.forEach(buildUtils.bashCommand)
toolsVersions.forEach(buildUtils.bashCommand)
