define(['lodash', 'santa-harness', 'apiCoverageUtils'],
    function (_, santa, apiCoverageUtils) {
        "use strict";

        describe('Document Services - Actions and Behaviors API - Actions', function () {

            var documentServices;

            beforeAll(function (done) {
                santa.start().then(function (harness) {
                    documentServices = harness.documentServices;
                    console.log('Testing actions spec');
                    done();
                });
            });

            describe('Generic actions getters', function () {
                it('getDefinition: should return an object', function () {
                    var actionDef = documentServices.actions.getDefinition('exit');
                    expect(_.isObject(actionDef)).toBeTruthy();
                    apiCoverageUtils.checkFunctionAsTested('documentServices.actions.getDefinition');
                });

                it('getNames: should return an array', function () {
                    var actionNames = documentServices.actions.getNames();
                    expect(_.isArray(actionNames)).toBeTruthy();
                    apiCoverageUtils.checkFunctionAsTested('documentServices.actions.getNames');
                });
            });
        });
    });
