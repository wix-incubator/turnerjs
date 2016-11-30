/*global jasmineRequire*/
define([], function () {
    'use strict'

    function loadCssByUrl (url) {
        var link = document.createElement('link')
        link.type = 'text/css'
        link.rel = 'stylesheet'
        link.href = url
        document.getElementsByTagName('head')[0].appendChild(link)
    }

    function run(global, runner) {
        var base  = 'http://s3.amazonaws.com/integration-tests-statics/SNAPSHOT/runners/'
        loadCssByUrl(base + 'platformIntegrationEditor/src/jasmine.css')

        require([runner], function () {
            function startTests() {
                var jasmine = window.jasmine
                jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000
                jasmineRequire.html(jasmine)
                var jasmineEnv = jasmine.getEnv()
                var reporter = new jasmine.JsApiReporter({
                    timer: new jasmine.Timer()
                })
                jasmineEnv.addReporter(reporter)
                global.reporter = reporter

                // jasmine replaces the original onload and uses this to start tests
                window.onload()
            }

            setTimeout(startTests, 2000) // TODO why?
        })
    }



    return {
        run: run
    }
})
