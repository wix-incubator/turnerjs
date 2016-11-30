'use strict'
module.exports = function register(grunt) {
    grunt.registerMultiTask('typescript', 'run typescript', function() {
        try {
            const path = require('path')
            const root = process.cwd()
            const tscPath = path.resolve(root, 'node_modules', 'typescript', 'bin', 'tsc')
            const tsConfigPath = path.resolve(root, 'tsconfig.json')
            const isWin = /^win/.test(process.platform)
            const prefix = isWin ? 'node ' : ''
            const sourceMapOption = this.options().sourceMap === 'external' ? '--sourceMap' : '--inlineSourceMap'
            const command = `${prefix} ${tscPath} -p ${tsConfigPath} ${sourceMapOption}`

            const result = require('shelljs').exec(command, {silent: true})
            if (result.code) {
                grunt.fail.warn({message: result})
            }
        } catch (ex) {
            grunt.fail.fatal(`Compiling typescript has failed: ${ex}`)
        }
    })
}
