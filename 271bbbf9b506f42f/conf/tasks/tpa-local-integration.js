'use strict'
module.exports = function register(grunt) {

    grunt.registerTask('tpa-local-integration', () => {

        const querystring = require('querystring')
        const fs = require('fs')
           // path = require('path');

        const sources = {
            localhost: 'http://localhost:80',
            aws: 'http://s3.amazonaws.com/integration-tests-statics/SNAPSHOT/santa'
        }

        /*eslint-disable quote-props, key-spacing */
        const baseUrl = {
            'getSiteInfoRunner'         : 'http://tomergabwork.wix.com/tyty',
            'getSitePagesRunner'        : 'http://sheferlior.wix.com/multi1',
            'gluedWidgetRunner'         : 'http://tomergabwork.wix.com/tyty',
            'heightChangeRunner'        : 'http://sheferlior.wix.com/multi1',
            'modalRunner'               : 'http://sheferlior.wix.com/multi1',
            'navigateToPageRunner'      : 'http://sheferlior.wix.com/multi1',
            'navigateToSectionRunner'   : 'http://sheferlior.wix.com/multi1',
            'popupRunner'               : 'http://sheferlior.wix.com/multi1',
            'resizeWindowRunner'        : 'http://yaarac1.wix.com/yaarac',
            'styleRunner'               : 'http://sheferlior.wix.com/hotels',
            'tpaSectionRunner'          : 'http://sheferlior.wix.com/multi1',
            'tpaWidgetRunner'           : 'http://sheferlior.wix.com/multi1'
        }

        const hashBangs = {
            'getSiteInfoRunner'         : '',
            'getSitePagesRunner'        : '',
            'gluedWidgetRunner'         : '#!blank/c1gsg',
            'heightChangeRunner'        : '',
            'modalRunner'               : '#!blank/c1gsg',
            'navigateToPageRunner'      : '',
            'navigateToSectionRunner'   : '',
            'popupRunner'               : '#!blank/c1gsg',
            'resizeWindowRunner'        : '#!about1/c1ccc',
            'styleRunner'               : '#!book-a-room/cslw',
            'tpaSectionRunner'          : '#!multi/cpi4/#test-state',
            'tpaWidgetRunner'           : ''
        }
        /*eslint-enable quote-props, key-spacing */

        const tpaspec = grunt.option('tpa-spec')
        const tpSource = sources[grunt.option('tpa-source') || 'localhost']

        function getIntegrationConfig(spec, source) {
            const str = querystring.stringify({
                petri_ovr: 'specs.RenderReactByUser:true;specs.DisableReactForSpecificEmbeddedServices:false',
                ReactSource: source,
                baseVersion: source,
                debug: 'all',
                jasmineSpec: `tpaIntegration:/runners/${spec}`,
                isTpaIntegration: true
            })

            const jsonStr = `{"${spec}": {}}`
            const specJson = JSON.parse(jsonStr)

            specJson[spec] = {
                path: `${baseUrl[spec]}?${str}${hashBangs[spec]}`, // should be different for each??
                app: 'Google Chrome'
            }

            grunt.log.writeln(`json: ${JSON.stringify(specJson)}`)
            return specJson
        }

        const config = {}
        const specs = []

        if (!tpaspec) {
            const list = fs.readdirSync('./packages/tpaIntegration/src/main/runners')
            list.forEach(item => {
                const spec = item.replace('.js', '')
                const specConfig = getIntegrationConfig(spec, tpSource)
                config[spec] = specConfig[spec]
                specs.push(spec)
            })
        } else {
            const cfg = getIntegrationConfig(tpaspec, tpSource)
            config[tpaspec] = cfg[tpaspec]
            specs.push(tpaspec)
        }

        grunt.config.set('open', config)

        specs.forEach(sp => {
            grunt.task.run(`open:${sp}`)
        })
    })
}
