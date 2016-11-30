/*global browser*/
'use strict'

const _ = require('lodash')
const path = require('path')
const fs = require('fs')
const url = require('url')
const logger = require('./specLogger')

/**
 * @returns {Array.<string>} array of runner names
 */
function getRunnerNames() {
    let files = fs.readdirSync(path.resolve('./runners/platformIntegrationEditor/src/main/runners'))

    return _(files)
        .filter((file) => /.spec.js$/.test(file))
        .map((file) => file.replace(/.spec.js$/, ''))
        .value()
}

/**
 * Map Jasmine Spec Results to simplified objects
 * @param specs {Array.<object>} Jasmine spec result objects
 * @return {Array.<object>} Simplified spec result objects
 */
function formatResults(specs) {
    return specs.map((spec) => {
        let formattedSpec = {
            name: spec.fullName,
            desc: spec.description,
            passed: spec.status !== 'failed'
        }

        if (spec.status === 'failed') {
            formattedSpec.messages = spec.failedExpectations
                .map((result) => result.message)
                .reduce((prev, curr) => `${prev}\n${curr}`)
        }

        logger.logSpecResult(formattedSpec)
        return formattedSpec
    })
}

/**
 * Create url for integration test from url parameters
 * @param {object} urlParams
 * @param {string} urlParams.path
 * @param {object} urlParams.query keys and values will be mapped to query params
 * @returns {string}
 */
function createTestUrl(urlParams) {
    const defaultUrlParams = {
        protocol: 'http',
        host: 'editor.wix.com'
    }
    const defaultIntegrationQueryParams = {
        petri_ovr: 'specs.DisableNewRelicScriptsSantaEditor:true',
        isPlatformIntegration: true,
        forceEditorVersion: 'new',
        leavePagePopUp: false,
        experiments: _.join([
            'behaviorsData',
            'wixCodeBinding',
            'compStateMixin',
            'developerModeToggle',
            'sv_platform1',
            'se_platform1',
            'dpages',
            'sv_dpages',
            'connectionsData'
        ], ',')
    }

    _.defaults(urlParams, defaultUrlParams)
    _.defaults(urlParams.query, browser.params, defaultIntegrationQueryParams)

    const testUrl = url.format(urlParams)
    logger.log('Create Test URL:', testUrl)
    return testUrl
}

module.exports = {
    createTestUrl,
    formatResults,
    getRunnerNames
}
