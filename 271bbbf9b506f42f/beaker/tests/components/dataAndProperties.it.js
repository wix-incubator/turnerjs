define(['lodash', 'santa-harness', 'componentUtils', 'apiCoverageUtils'], function (_, santa, componentUtils, apiCoverageUtils) {

    'use strict';

    describe('Document Services - Component ', function () {

        var pictureRef;
        var componentServices;
        var containerRef;
        var focusedPageRef;
        var documentServices;

        function createPictureInContainer() {
            containerRef = componentServices.add(focusedPageRef, componentUtils.getComponentDef(documentServices, "CONTAINER"));
            pictureRef = componentServices.add(containerRef, componentUtils.getComponentDef(documentServices, "WPHOTO"));
        }

        beforeAll(function (done) {
            santa.start().then(function (harness) {
                documentServices = harness.documentServices;
                focusedPageRef = documentServices.pages.getFocusedPage();
                componentServices = documentServices.components;
                console.log('Testing Data and properties spec');
                done();
            });
        });

        beforeEach(function(done){
            createPictureInContainer();
            documentServices.waitForChangesApplied(done);
        });

        describe('Data', function () {

            afterAll(function () {
                apiCoverageUtils.checkFunctionAsTested('documentServices.components.data.update');
            });

            describe('data.update', function () {
                it('Should successfully update the data item', function (done) {
                    documentServices.components.data.update(pictureRef, {uri: 'http://static.host.com/images/image-B.png'});
                    documentServices.waitForChangesApplied(function () {
                        var compData = documentServices.components.data.get(pictureRef);
                        expect(compData.uri).toEqual('http://static.host.com/images/image-B.png');
                        done();
                    });
                });
            });

            describe('data.get', function () {

                it('Should bring the right information on get', function () {
                    var expectedMetaData = {isHidden: false, isPreset: false, schemaVersion: '1.0'};
                    var compData = documentServices.components.data.get(pictureRef);
                    expect(compData.type).toEqual('Image');
                    expect(compData.uri).toEqual(componentUtils.getDefaultImageDef().uri);
                    expect(compData.title).toEqual('');
                    expect(compData.alt).toEqual('');
                    expect(compData.height).toEqual(200);
                    expect(compData.width).toEqual(200);
                    expect(compData.metaData).toEqual(expectedMetaData);
                });

            });

            describe('data.remove', function () {
                xit('Should remove the data of the component', function (done) {
                    documentServices.components.data.remove(pictureRef);
                    documentServices.waitForChangesApplied(function () {
                        var compData = documentServices.components.data.get(pictureRef);
                        expect(compData).not.toBeDefined();
                        done();
                    });
                });
            });
        });

        describe('Properties', function () {

            afterAll(function () {
                apiCoverageUtils.checkFunctionAsTested('documentServices.components.properties.update');
            });

            describe('properties.update', function () {
                it('Should successfully update property item', function (done) {
                    documentServices.components.properties.update(pictureRef, {displayMode: 'full'});
                    documentServices.waitForChangesApplied(function () {
                        var compProps = documentServices.components.properties.get(pictureRef);
                        expect(compProps.displayMode).toEqual('full');
                        done();
                    });
                });
            });

            describe('properties.get', function () {

            });
        });
    });
});
