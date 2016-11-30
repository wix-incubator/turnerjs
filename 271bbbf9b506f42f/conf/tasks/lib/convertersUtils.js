/**
 * Created by eitanr on 8/3/14.
 */
'use strict'
const path = require('path')

function normalizePathSeparator(filePath) {
    if (!filePath) {
        return filePath
    }
    return filePath.replace(/\//g, path.sep).replace(/\\/g, path.sep)
}

function normalizePath(pathString) {
    //TODO: make absolute path and normalize separators according to OS
    return path.join(__dirname, normalizePathSeparator(`../../../${pathString}`))
}

exports.normalizePathSeparator = normalizePathSeparator
exports.normalizePath = normalizePath
