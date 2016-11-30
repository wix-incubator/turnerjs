'use strict'

const _ = require('lodash')
const path = require('path')

module.exports = (grunt) => {

    grunt.task.registerTask('download', 'download snapshot tarballs', function () {
        let done = this.async()
        let snapshots = this.options().snapshots
        let countDown = _.after(snapshots.length, done)
        let fetcher = require(path.resolve('./config/lib/artifactFetcher.js'))

        _.forEach(snapshots, (snapshot) => {
            fetcher.downloadArtifact(snapshot, countDown)
        })
    })

}
