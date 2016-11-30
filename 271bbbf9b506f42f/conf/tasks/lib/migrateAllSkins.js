'use strict'

const sassSkinMigrator = require('./sassSkinMigrator')
const fileUtil = require('./fileUtil')
const _ = require('lodash')
const santaUtils = require('santa-utils')
const path = require('path')
const VIEWER_BASE = path.resolve(santaUtils.getProjectPath('wix-santa'))
const glob = require('glob')

const sassBaseFolder = `${VIEWER_BASE}/packages`

glob('/**/*.scss', {root: sassBaseFolder}, (er, scssFiles) => {
    let migratedSkinsCount = 0
    _.forEach(scssFiles, scssFile => {
        const sassFileAsString = fileUtil.getFileContents(scssFile)
        const migratedSass = sassSkinMigrator(sassFileAsString)
        if (migratedSass !== sassFileAsString) {
            fileUtil.saveFile(scssFile, migratedSass)
            migratedSkinsCount++
        }
    })
    console.log(`migrated ${migratedSkinsCount} skins.`)
})
