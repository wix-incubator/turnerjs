'use strict'

const path = require('path')
const basePath = path.join(__dirname, '..', '..')
const scrape = require(`${basePath}/beaker/scrape/scrape`)

module.exports = function register(grunt) {
	const done = this.task.current.async()
    grunt.registerTask('beaker-scrape', () => {
        const sitesDir = path.resolve(basePath, 'beaker/sites')
        const config = path.resolve(basePath, this.task.current.options().configFile)
        const sites = require(config)

        const promises = []

        for (const name in sites) {
            if (!sites.hasOwnProperty(name)) {
                continue
            }

            promises.push(scrape.scrapeAndSave(sites[name], `${sitesDir}/${name}.json`))
        }

        Promise.all(promises).then(done)
    })
}
