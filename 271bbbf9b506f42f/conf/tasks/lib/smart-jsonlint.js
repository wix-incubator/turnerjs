'use strict'
const fs = require('fs')
const path = require('path')
const _ = require('lodash')
// const root = path.resolve(__dirname, '..', '..')
const isVerbose = false

// function fileExists(f) {
//     return fs.existsSync(f) && fs.lstatSync(f).isFile()
// }

// function getMtime(f) {
//     return fileExists(f) ? fs.lstatSync(f).mtime.getTime() : -Infinity
// }

function getLastRun(f) {
    return fs.existsSync(f) ? fs.readFileSync(f, 'utf8') : -Infinity
}

function writeLastRun(f) {
    return fs.writeFileSync(f, Date.now(), 'utf8')
}

function verbose(msg) {
    if (isVerbose) {
        console.log(msg)
    }
}

function isStale(files, cache) {
    const latest = _(files).map(f => fs.lstatSync(f).mtime.getTime()).max()
    verbose(`latest = ${latest}`)
    const targetTime = getLastRun(cache)
    verbose(`targetTime = ${targetTime}`)
    return targetTime < latest
}

function compile(files, cache) {
    const jsonlint = require('jsonlint')
    let failed = 0

    let errorDetails = null

    // Monkey patch the parseError function to something we can control.
    // var originalParseError = jsonlint.parser.yy.parseError;
    jsonlint.parser.yy.parseError = function (str, hash) {
        errorDetails = hash
        //console.log(JSON.stringify(errorDetails, null, 2));
    }

    files.forEach(file => {
        // grunt.log.debug('Validating "' + file + '"...');

        try {
            const data = fs.readFileSync(file, 'utf8')
            // if (options.cjson) {
            //     data = strip(data)
            // }

            jsonlint.parse(data)
            // grunt.verbose.ok(`File "${file}" is valid JSON.`)
            // if (options.format) {
            //     const obj = JSON.parse(data)
            //     const fmtd = JSON.stringify(obj, null, options.indent) + "\n"
            //     grunt.file.write(file, fmtd)
            //     grunt.verbose.ok(`File "${file}" formatted.`)
            // }
        } catch (e) {
            console.log(`Error in ${file}`)
            console.log(reportLikeJshint(file, e, errorDetails))
            // console.log(e)
            failed++
            // grunt.log.error(format(file, errorDetails.line))
            // grunt.log.writeln(report(file, e, errorDetails, grunt))
        }
    })

    if (failed > 0) {
        // console.log(`${failed} ${grunt.util.pluralize(failed, 'file/files')} failed validation`)
        console.log(`${failed} files failed validation`)
    } else {
        writeLastRun(cache)
        const successful = files.length - failed
        console.log(`${successful} file${(successful === 1 ? '' : 's')} lint free.`)
    }
    return failed
}

function reportLikeJshint(file, e, errorDetails) {
    const line = fs.readFileSync(file, 'utf8').split(/\r?\n/)[errorDetails.loc.first_line]  // intentionally do not read it as json.
    return '     ' + errorDetails.line + ' |     ' + errorDetails.text + "\n" + //eslint-disable-line prefer-template
        '             ^ Expected ' + errorDetails.expected + ' and instead saw \'' + line.charAt(errorDetails.loc.first_column + 1) + '\''
    //grunt.log.wordlist(errorDetails.expected)
}

function checkAndCompile(files, cacheDir) {
    verbose(`validating ${files.length} files`)
    if (!fs.existsSync(cacheDir)) {
        fs.mkdirSync(cacheDir)
    }
    const cache = path.resolve(cacheDir, '.jsonlint')
    if (isStale(files, cache)) {
        return compile(files, cache)
    }
    console.log(`json lint is up-to-date, skipping ${files.length} files`)
    return 0
}

module.exports = {checkAndCompile}
