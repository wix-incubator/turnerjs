define(['santa-harness', 'apiCoverageUtils'], function (santa, apiCoverageUtils) {
    'use strict';

    describe("Document Services - Data", function () {

        var documentServices;

        beforeAll(function (done) {
            santa.start().then(function (harness) {
                documentServices = harness.documentServices;
                console.log('Testing Data spec');
                done();
            });
        });

        afterAll(function () {
            apiCoverageUtils.checkFunctionAsTested('documentServices.data.getSchema');
            apiCoverageUtils.checkFunctionAsTested('documentServices.data.createItem');
            apiCoverageUtils.checkFunctionAsTested('documentServices.data.addLink');
        });


        describe('getSchema', function () {

            it('Should successfully retrieve data schema', function () {
                var schema = documentServices.data.getSchema('ImageList');
                expect(schema).toEqual({
                    'items': {type: ['null', 'array'], pseudoType: ['refList']}
                });
            });
        });

        describe('createItem', function () {
            it('Should return the validity of a data item', function () {
                var dataItem = documentServices.data.createItem('Image');
                expect(documentServices.data.isItemValid(dataItem, 'borderSize', 40)).toEqual(false);
                expect(documentServices.data.isItemValid(dataItem, 'title', 'titelush')).toEqual(true);
                expect(documentServices.data.isItemValid(dataItem, 'opacity', 500)).toEqual(true);
            });
        });

        describe('addLink', function () {
            it('Should successfully add and retrieve a link', function () {
                var linkId = documentServices.data.addLink('ExternalLink');
                var linkData = documentServices.data.getById(linkId);
                expect(linkData.id).toEqual(linkId);
                expect(linkData.type).toEqual('ExternalLink');
            });
        });
    });
});
