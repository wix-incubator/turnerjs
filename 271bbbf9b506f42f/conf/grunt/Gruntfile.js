/*eslint santa/enforce-package-access:0, strict:[2, "global"]*/
/*eslint-env node, es6 */
'use strict'
const path = require('path')

module.exports = function (grunt) {
    const gruntUtils = require('santa-utils').gruntUtils(grunt)
    const root = path.resolve(__dirname, '..', '..')

    gruntUtils.throwOnIllegalTasks({
        sass: ['sass:main', 'css', 'sass:dist'],
        typescript: ['typescript:local', 'typescript:teamcity'],
        packages: ['packages:all'],
        eslint: ['eslint:all'],
        karma: ['karma:all'],
        smartEslint: ["eslint:all, because it's smart now"]
    })

    const defineTaskRequires = gruntUtils.defineTaskRequires

    require('time-grunt')(grunt)

    ////////////////////// get and edit config: ////////////////////////////////

    const config = require('./gruntConfig.js')
    require('./tempTasks.js')(grunt)

    const pkg = grunt.option('p')
    if (pkg) {
        config.jasmine.units = config.jasmine.units.map(filePath => filePath.replace('packages/', `packages/${pkg}/`))
    }

    const packagesRoot = path.resolve(root, 'packages')

    require('requirejs-packages').packagesUtils.getPackageNames(packagesRoot).forEach(name => {
        config.karma[name] = {configFile: `packages/${name}/karma.conf.js`}
        config.karma[`${name}TeamCity`] = {
            configFile: `packages/${name}/karma.conf.js`,
            colors: false,
            reporters: ['teamcity', 'coverage'],
            plugins: ['karma-requirejs', 'karma-jasmine', 'karma-coverage', 'karma-phantomjs-launcher', 'karma-teamcity-reporter'],
            coverageReporter: {type: 'teamcity'}
        }
    })

    ////////////////////////////////////////////////////////////////////////////

    grunt.initConfig(config)
    grunt.loadNpmTasks('grunt-packages')
    // grunt.loadNpmTasks('grunt-tslint')
    grunt.loadNpmTasks('santa-utils')
    require('jit-grunt')(grunt, {
        scsslint: 'grunt-scss-lint',
        jasmine: 'grunt-jasmine-npm',
        sass: 'grunt-sass'
    })({
        customTasksDir: './conf/tasks/'
    })

    grunt.registerTask('wixCode', 'run wixCode build', () => {
        const command = `${path.join('node_modules', '.bin', 'grunt')} --gruntfile ${path.join('static', 'wixcode', 'Gruntfile.js')} build`
        const err = require('shelljs').exec(command, {silent: false}).code
        if (err) {
            grunt.fail.warn('Failed to build wixCode')
        }
    })

    grunt.registerTask('genMainR', function(prop) {
        const versions = {
            react: '0.14.3',
            pmrpc: '1.25.0'
        }
        const mains = {
            seo: {
                location: 'app-seo',
                getOptions: () => ({
                    versions,
                    packages: require('../../js/test/packagesList.json')

                })
            },
            viewer: {
                location: 'app',
                getOptions: () => ({
                    versions,
                    packages: require('../../js/test/packagesList.json')
                })
            },
            viewerRjs: {
                location: 'app',
                getOptions: () => ({
                    versions
                })
            }
        }
        const done = this.async()
        const santaMainR = require('santa-main-r')
        santaMainR.generate(prop, mains[prop].getOptions(), () => {
          const file = santaMainR.getPath(prop)
          const fileName = file.split(path.sep).slice(-1)[0]
          const target = path.resolve(process.cwd(), mains[prop].location, fileName)
          grunt.file.copy(file, target)
          grunt.file.copy(`${file}.map`, `${target}.map`)
          console.log(`Generated main-r for '${prop}' at:\n${target}`)
          done()
        })
    })

    ////////////////////////////////////////////////////////////////////////////
    defineTaskRequires('css', 'Compile css', ['scsslint'], ['smartSass', 'sass:main', 'smart-task:cssToJson', 'cssTest'])
    grunt.registerTask('cssTest', 'Test compiled css', ['clean:cssTests', 'sass:tests', 'bootcamp'])

    ////////////////////Teamcity tasks:
    grunt.registerTask('teamcity', 'Teamcity maven step #1', ['typescript:teamcity', 'case-check', 'eslint:teamcity', 'sass:main', 'sass:packages', 'postcss', 'cssToJson', 'copy:experiment', 'get-translations:teamcity',
                                                              'getDataRefs', 'json', 'wixCode', 'genMainR:viewerRjs', 'packages:teamcity', 'local-ploader-config', 'local-requirejs-config', 'genMainR:viewer', 'genMainR:seo', 'experiments-descriptors', 'createExperimentTests'])
    grunt.registerTask('teamcity-test', 'Teamcity maven step #2', ['karma:serverSideIntegration', 'jasmine:teamcity', 'jasmine:unitsTC', /*'jasmine:layout',*/ 'karma:mainr', 'karma:teamcity', 'cssTest'])
    ////////////////////////////////////////////////////////////////////////////

    ////////////////////Default tasks:
    grunt.registerTask('dev-setup', 'Dev environment setup', ['register', 'fixgit', 'verify-npm', 'versions-check:main'])
    defineTaskRequires('lint', ['typescript:local'], ['eslint:all', 'smartJsonlint', 'scsslint'])
    defineTaskRequires('build', ['typescript:local'], ['css', 'copy:experiment', 'get-translations:local', 'build-json', 'genMainR:viewerRjs', 'packages:all', 'local-ploader-config', 'local-requirejs-config', 'genMainR:viewer', 'genMainR:seo',
                                                  'experiments-descriptors', 'createExperimentTests', 'wixCode'])
    defineTaskRequires('build-json', ['smart-task:getDataRefs'], ['json'])
    ////////////////////Developer tasks:

    grunt.registerTask('beaker', ['beakerMessage', 'karma:beaker'])
    grunt.registerTask('it', ['build', 'beaker'])

    grunt.registerTask('coverage', ['karma:coverage'])

    grunt.registerTask('default', ['dev-setup', 'lint', 'clean:main', 'build'])
    grunt.registerTask('packagestests', 'Karma + Node', ['jasmine:units', 'karma:all'])
    defineTaskRequires('test', 'Testing', ['cssTest'], ['karma:serverSideIntegration', 'jasmine:all', 'packagestests', /*'jasmine:layout',*/ 'karma:infra', 'karma:mainr'])
    grunt.registerTask('all', 'Full build and test', ['clean', 'default', 'test'])
    grunt.registerTask('pre-push', 'Basic sanity before pushing', ['lint', 'packagestests', 'cssTest'])
    grunt.registerTask('none', [])
    ////////////////////////////////////////////////////////////////////////////
}
