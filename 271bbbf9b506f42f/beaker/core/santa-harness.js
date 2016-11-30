define(['lodash', 'apiCoverageUtils'], function (_, apiCoverageUtils) {
    "use strict";

    var iframe;
    var argumentExperimentsOnArr, argumentExperimentsOffArr = [];
    var printCoverage = false;
    var santaHarness = {};

    (function initSantaHarness() {
        setIframe();
        setJasmine();

        window.addEventListener("message", function (event) {
            if (event.data === "documentServicesLoaded" && santaHarness.callback) {
                iframe.contentWindow.karmaIntegration = true;
                iframe.contentWindow.console = console;
                santaHarness.callback();
            }
        });
    }());

    function start(options) {
        return new Promise(function (resolve) {
            options = options || {};
            var site = options.site || 'blank';
            var experiments = getValidatedExperiments(options.experimentsOn, options.experimentsOff);
            defineIframeDimensions(options.width, options.height);

            var query = {
                experiments: experiments.on,
                experimentsoff: experiments.off,
                ds: "true",
                dsOrigin: "Editor1.4",
                serverPort: window.globals.SERVER_PORT,
                hot: "false",
                site: site
            };
            var queryVars = [];
            for (var v in query) {
                if (query[v] && query[v].length) {
                    queryVars.push(v + "=" + query[v]);
                }
            }

            iframe.src = "/base/beaker/vm.html?" + queryVars.join('&');
            santaHarness.callback = function () {
                //TODO: remove when possible: fix for jasmine to understand that Error thrown from iframe is instance of Error.
                /*eslint no-native-reassign:0*/
                Error = iframe.contentWindow.Error;

                resolve({
                    window: iframe.contentWindow,
                    documentServices: iframe.contentWindow.documentServices
                });
            };
        });
    }

    function defineIframeDimensions(width, height) {
        var widthStr = (_.isUndefined(width)) ? '100%' : width + 'px';
        var heightStr = (_.isUndefined(height)) ? '100%' : height + 'px';

        iframe.setAttribute("style",
            `position: fixed;
            top:0;
            right:0;
            bottom:0;
            left:0;` + 'width:' + widthStr + ';height:' + heightStr);
    }

    function getValidatedExperiments(originalExperimentsOn, originalExperimentsOff) {
        var experiments = {on: [], off: []};
        originalExperimentsOn = originalExperimentsOn || [];
        originalExperimentsOff = originalExperimentsOff || [];

        var finalExperimentsOnArr = _.union(argumentExperimentsOnArr, originalExperimentsOn);
        var finalExperimentsOffArr = _.union(argumentExperimentsOffArr, originalExperimentsOff);

        experiments.on = finalExperimentsOnArr.join(',');
        experiments.off = finalExperimentsOffArr.join(',');

        return experiments;
    }

    function setIframe() {
        iframe = document.createElement("IFRAME");
        document.body.appendChild(iframe);
        document.domain = "localhost";
    }

    function setJasmine() {


        jasmine.getEnv().topSuite().beforeAll({
            fn: function () {
                jasmine.DEFAULT_TIMEOUT_INTERVAL = 15000;
                initExperimentsArguments();
            }
        });

        jasmine.getEnv().topSuite().afterAll({
            fn: function (done) {
                window.__coverage__ = _.cloneDeep(iframe.contentWindow.__coverage__);
                start().then(function (harness) {
                    var documentServices = harness.documentServices;
                    if (printCoverage) {
                        printTestsCoverageSummary(documentServices);
                    }
                    done();
                });
            }
        });
    }


    function printTestsCoverageSummary(documentServices) {
        console.log('===========================================================================');
        console.log('                              Pay Attention!!!');
        console.log('             Following Document Services functions was not tested');
        console.log('');
        apiCoverageUtils.printUntestedFunctions(documentServices, 'documentServices');
        var percentOfCoveredFunctions = apiCoverageUtils.getCoveragePercent(documentServices, 'documentServices');
        var numberOfTestedFunctions = apiCoverageUtils.getNumberOfTestedFunctions(documentServices, 'documentServices');
        var numberOfUnTestedFunctions = apiCoverageUtils.getNumberOfUnTestedFunctions(documentServices, 'documentServices');
        var totalNumberOfFunctions = apiCoverageUtils.getTotalNumberOfFunctions(documentServices, 'documentServices');
        console.log(percentOfCoveredFunctions + '% of Document Services functions was tested');
        console.log(numberOfTestedFunctions + ' Tested functions');
        console.log(numberOfUnTestedFunctions + ' UnTested functions');
        console.log(totalNumberOfFunctions + ' Total number of functions');
    }

    function initExperimentsArguments() {

        var args = {};

        _.forEach(window.__karma__.config.args, function (value) {
            if (value) {
                var splits = value.split('=');
                if (splits.length === 2) {
                    args[splits[0]] = splits[1];
                }
            }
        });
        argumentExperimentsOnArr = (_.has(args, '--experimentsOn')) ?
            args['--experimentsOn'].split(',') : [];

        argumentExperimentsOffArr = (_.has(args, '--experimentsOff')) ?
            args['--experimentsOff'].split(',') : [];

        printCoverage = args['--printCoverage'] === 'true';
    }

    return {start: start};
});
