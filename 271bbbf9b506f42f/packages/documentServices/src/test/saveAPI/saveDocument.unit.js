define([
    'lodash',
    'immutableDiff',
    'utils',
    'testUtils',
    'documentServices/bi/events',
    'documentServices/errors/errors',
    'documentServices/bi/errors',
    'documentServices/saveAPI/saveTasks/saveDocument',
    'documentServices/saveAPI/saveDataFixer/saveDataFixer',
    'documentServices/dataAccessLayer/wixImmutable',
    'documentServices/hooks/hooks'
], function (
    _,
    immutableDiff,
    utils,
    testUtils,
    biEvents,
    errors,
    biErrorDefinitions,
    saveDocument,
    saveDataFixer,
    wixImmutable,
    hooks
) {
    'use strict';

    describe('saveDocument', function () {

        var lastSnapshot, currentSnapshot, resolve, reject, ajaxSpy, biMock;

        function createSnapshot(pagesData, routers) {
            var mockSiteData = testUtils.mockFactory.mockSiteData();
            return {
                rendererModel: mockSiteData.rendererModel,
                serviceTopology: mockSiteData.serviceTopology,
                pagesData: pagesData || mockSiteData.pagesData,
                routers: routers || {configMap: {}},
                documentServicesModel: {
                    originalTemplateId: '21bb4070-0fcb-41eb-87d6-bb35db2a803f',
                    version: 1,
                    revision: 1234,
                    metaSiteData: {
                        externalUriMappings: [],
                        favicon: '',
                        indexable: true,
                        metaTags: [
                            {
                                "name": "keywords",
                                "value": "",
                                "property": false
                            },
                            {
                                "name": "description",
                                "value": "",
                                "property": false
                            },
                            {
                                "name": "fb_admins_meta_tag",
                                "value": "",
                                "property": false
                            }
                        ],
                        suppressTrackingCookies: false,
                        thumbnail: ''
                    },
                    editorSessionId: 'DA154192-AADC-48D0-8C75-E3EF62D97C2D',
                    firstSave: true,
                    publicUrl: 'http://sharag.wix.com/theamazingshraga',
                    usedMetaSiteNames: ['A', 'B']
                },
                orphanPermanentDataNodes: mockSiteData.orphanPermanentDataNodes,
                urlFormatModel: {
                    format: 'hashBang'
                }
            };
        }

        function fakeAjaxSuccess(response) {
            ajaxSpy.and.callFake(function (ajaxArgs) {
                ajaxArgs.success(response);
            });
        }

        function fakeAjaxError(response) {
            ajaxSpy.and.callFake(function (ajaxArgs) {
                ajaxArgs.error(response);
            });
        }

        function getExpectedSiteMetaData(siteMetaData) {
            var dataToReturn = _.omit(siteMetaData, ['adaptiveMobileOn']);
            dataToReturn.headTags = '';
            return dataToReturn;
        }

        function aggregateDataFromPages(pagesData, dataType) {
            return _.reduce(pagesData, function (result, page) {
                return _.merge(result, page.data[dataType]);
            }, {});
        }

        var METHODS_WITH_TWO_SNAPSHOTS = ['partialSave', 'firstSave', 'saveAsTemplate', 'fullSave', 'autosave'];

        function wrapSaveDocumentFunctionsForImmutable() {
            _.forEach(METHODS_WITH_TWO_SNAPSHOTS, function (saveMethod) {
                this[saveMethod] = function (_lastSnapshot, _currentSnapshot, _resolve, _reject) {
                    saveDocument[saveMethod](wixImmutable.fromJS(_lastSnapshot), wixImmutable.fromJS(_currentSnapshot), _resolve, _reject, biMock);
                };
            }, this);

            this.publish = function (_currentSnapshot, _resolve, _reject) {
                saveDocument.publish(wixImmutable.fromJS(_currentSnapshot), _resolve, _reject);
            };
        }

        beforeEach(function () {
            lastSnapshot = createSnapshot();
            currentSnapshot = createSnapshot();
            resolve = jasmine.createSpy();
            reject = jasmine.createSpy();
            ajaxSpy = spyOn(utils.ajaxLibrary, 'ajax');
            biMock = {
                event: jasmine.createSpy('event'),
                error: jasmine.createSpy('error')
            };
            wrapSaveDocumentFunctionsForImmutable.call(this);
        });

        describe('partialSave', function () {

            it('Should call the partialSave end point with expected data', function () {
                var metaSiteId = currentSnapshot.rendererModel.metaSiteId;
                var editorSessionId = currentSnapshot.documentServicesModel.editorSessionId;

                this.partialSave(lastSnapshot, currentSnapshot, resolve, reject);

                var actualPartialSaveUrl = ajaxSpy.calls.mostRecent().args[0].url;
                var expectedPartialSaveUrl = currentSnapshot.serviceTopology.editorServerRoot + '/api/partially_update' + '?' + ('editorSessionId=' + editorSessionId) + '&' + ('metaSiteId=' + metaSiteId);
                expect(actualPartialSaveUrl).toEqual(expectedPartialSaveUrl);
            });

            it('should add the X-Wix-Editor-Version header', function () {
                this.partialSave(lastSnapshot, currentSnapshot, resolve, reject);
                var headers = ajaxSpy.calls.mostRecent().args[0].headers;
                expect(headers).toContain({'X-Wix-Editor-Version': 'new'});
            });

            it("should add the X-Wix-DS-Origin header", function () {
                currentSnapshot.origin = 'originFromSnapshot';
                this.partialSave(lastSnapshot, currentSnapshot, resolve, reject);
                var headers = ajaxSpy.calls.mostRecent().args[0].headers;
                expect(headers).toContain({'X-Wix-DS-Origin': 'originFromSnapshot'});
            });

            describe('When ajax success', function () {

                describe('When task succeeds', function () {

                    beforeEach(function () {
                        this.saveSuccessResponse = {
                            success: true,
                            payload: {version: 2, revision: 2}
                        };
                        fakeAjaxSuccess(this.saveSuccessResponse);
                    });

                    it('Should call resolve() callback with expected result object', function () {
                        this.partialSave(lastSnapshot, currentSnapshot, resolve, reject);

                        var resolveArg = resolve.calls.mostRecent().args[0];
                        expect(resolveArg).toEqual({
                            'documentServicesModel.revision': this.saveSuccessResponse.payload.revision,
                            'documentServicesModel.version': this.saveSuccessResponse.payload.version,
                            'orphanPermanentDataNodes': []
                        });
                    });

                    it('Should also clear autoSaveInfo.previousDiffId if autoSaveInfo is rendered', function () {
                        currentSnapshot.documentServicesModel.autoSaveInfo = {shouldAutoSave: true};
                        this.partialSave(lastSnapshot, currentSnapshot, resolve, reject);

                        var resolveArg = resolve.calls.mostRecent().args[0];
                        expect(resolveArg).toEqual({
                            'documentServicesModel.revision': this.saveSuccessResponse.payload.revision,
                            'documentServicesModel.version': this.saveSuccessResponse.payload.version,
                            'orphanPermanentDataNodes': [],
                            'documentServicesModel.autoSaveInfo.previousDiffId': undefined
                        });
                    });

                });

                describe('When task fails', function () {
                    it('Should call reject() callback with expected reject object', function () {
                        var saveErrorResponse = {
                            success: false,
                            errorCode: 1020,
                            errorDescription: 'desc'
                        };
                        fakeAjaxSuccess(saveErrorResponse);

                        this.partialSave(lastSnapshot, currentSnapshot, resolve, reject);
                        expect(reject).toHaveBeenCalled();
                        var rejectArg = reject.calls.mostRecent().args[0];
                        expect(rejectArg).toEqual({
                            errorCode: saveErrorResponse.errorCode,
                            errorDescription: saveErrorResponse.errorDescription,
                            errorType: errors.save.UNKNOWN_SERVER_ERROR
                        });
                    });

                    it("should attempt a full save if the response is -10104, and send BI event 632", function () {
                        var saveErrorResponse = {
                            success: false,
                            errorCode: -10104,
                            payload: {
                                missingContainers: [{id: 'someContainer'}]
                            },
                            errorDescription: 'validation failure'
                        };
                        fakeAjaxSuccess(saveErrorResponse);
                        this.partialSave(lastSnapshot, currentSnapshot, resolve, reject);
                        expect(biMock.event).toHaveBeenCalledWith(jasmine.objectContaining({eventId: 632}));
                        var expectedEndpoint = currentSnapshot.serviceTopology.editorServerRoot + '/api/new_override_save';
                        expect(ajaxSpy.calls.mostRecent().args[0].url).toStartWith(expectedEndpoint);
                    });

                    it("should NOT attempt a full save if the response is NOT -10104", function () {
                        var saveErrorResponse = {
                            success: false,
                            errorCode: 1020,
                            errorDescription: 'validation failure'
                        };
                        fakeAjaxSuccess(saveErrorResponse);
                        this.partialSave(lastSnapshot, currentSnapshot, resolve, reject);
                        expect(biMock.event).not.toHaveBeenCalled();
                        var fullEndpoint = currentSnapshot.serviceTopology.editorServerRoot + '/api/new_override_save';
                        expect(ajaxSpy.calls.mostRecent().args[0].url).not.toStartWith(fullEndpoint);
                    });

                    describe('and has an error code', function () {
                        it('should return error of NOT_LOGGED_IN if the errorCode is -15', function () {
                            var saveErrorResponse = {
                                success: false,
                                errorCode: -15,
                                payload: {},
                                errorDescription: 'some err desc'
                            };
                            fakeAjaxSuccess(saveErrorResponse);
                            this.partialSave(lastSnapshot, currentSnapshot, resolve, reject);

                            expect(reject).toHaveBeenCalled();
                            var rejectArg = reject.calls.mostRecent().args[0];
                            expect(rejectArg).toEqual({
                                errorCode: saveErrorResponse.errorCode,
                                errorDescription: saveErrorResponse.errorDescription,
                                errorType: errors.save.NOT_LOGGED_IN
                            });
                        });

                        it('should return error of USER_NOT_AUTHORIZED_FOR_SITE if the errorCode is -17', function () {
                            var saveErrorResponse = {
                                success: false,
                                errorCode: -17,
                                payload: {},
                                errorDescription: 'some err desc'
                            };
                            fakeAjaxSuccess(saveErrorResponse);
                            this.partialSave(lastSnapshot, currentSnapshot, resolve, reject);

                            expect(reject).toHaveBeenCalled();
                            var rejectArg = reject.calls.mostRecent().args[0];
                            expect(rejectArg).toEqual({
                                errorCode: saveErrorResponse.errorCode,
                                errorDescription: saveErrorResponse.errorDescription,
                                errorType: errors.save.USER_NOT_AUTHORIZED_FOR_SITE
                            });
                        });

                        it('should report a BI error SAVE_DOCUMENT_FAILED_ON_SERVER with relevant params', function(){
                            var saveErrorResponse = {
                                success: false,
                                errorCode: -123456,
                                payload: {},
                                errorDescription: 'some err desc'
                            };
                            fakeAjaxSuccess(saveErrorResponse);
                            var currentOrigin = currentSnapshot.origin = 'some origin for DS';
                            this.partialSave(lastSnapshot, currentSnapshot, resolve, reject);

                            expect(biMock.error).toHaveBeenCalledWith(biErrorDefinitions.SAVE_DOCUMENT_FAILED_ON_SERVER, jasmine.objectContaining({
                                serverErrorCode: saveErrorResponse.errorCode,
                                origin: currentOrigin
                            }));

                            var errorParams = biMock.error.calls.mostRecent().args[1];
                            expect(errorParams.errorType).toBeDefined();

                        });
                    });
                });

            });

            describe('When ajax fails', function () {

                it('Should call reject() with expected reject object', function () {

                    var ajaxErrorResponse = {
                        status: 500,
                        statusText: 'Save failed'
                    };
                    fakeAjaxError(ajaxErrorResponse);

                    this.partialSave(lastSnapshot, currentSnapshot, resolve, reject);

                    var rejectArg = reject.calls.mostRecent().args[0];
                    expect(rejectArg).toEqual({
                        errorCode: ajaxErrorResponse.status,
                        errorDescription: ajaxErrorResponse.statusText,
                        errorType: errors.save.HTTP_REQUEST_ERROR
                    });
                });
            });

            describe('Data To Save', function () {

                describe('When no data was changed', function () {

                    it('Should contain a component_properties, document_data, and theme_data properties which are all empty objects', function () {
                        this.partialSave(lastSnapshot, currentSnapshot, resolve, reject);

                        var dataToSave = ajaxSpy.calls.mostRecent().args[0].data;
                        expect(dataToSave.dataDelta.component_properties).toEqual({});
                        expect(dataToSave.dataDelta.document_data).toEqual({});
                        expect(dataToSave.dataDelta.theme_data).toEqual({});
                    });

                    describe('if experiment designData is open', function () {
                        it('should also contain an empty design_data map', function () {
                            testUtils.experimentHelper.openExperiments('designData');
                            this.partialSave(lastSnapshot, currentSnapshot, resolve, reject);

                            var dataToSave = ajaxSpy.calls.mostRecent().args[0].data;
                            expect(dataToSave.dataDelta.design_data).toEqual({});
                        });
                    });
                });

                describe('When data was changed', function () {

                    describe('When a property query was added', function () {

                        it('Should contain the added property query', function () {
                            var newPropertyQuery = {newStyleItem: {a: 1}};
                            var currentMasterPageComponentProps = currentSnapshot.pagesData.masterPage.data.component_properties;
                            _.merge(currentMasterPageComponentProps, newPropertyQuery);

                            this.partialSave(lastSnapshot, currentSnapshot, resolve, reject);

                            var dataToSave = ajaxSpy.calls.mostRecent().args[0].data;
                            expect(dataToSave.dataDelta.component_properties).toContain(newPropertyQuery);
                        });

                    });

                    describe('When a property query was changed', function () {

                        it('Should contain the new property query', function () {
                            var oldPropertyQuery = {propQuery: {a: 1}};
                            var newPropertyQuery = {propQuery: {b: 1}};

                            var lastMasterPageComponentProps = lastSnapshot.pagesData.masterPage.data.component_properties;
                            _.merge(lastMasterPageComponentProps, oldPropertyQuery);

                            var currentMasterPageComponentProps = currentSnapshot.pagesData.masterPage.data.component_properties;
                            _.merge(currentMasterPageComponentProps, newPropertyQuery);

                            this.partialSave(lastSnapshot, currentSnapshot, resolve, reject);

                            var dataToSave = ajaxSpy.calls.mostRecent().args[0].data;
                            expect(dataToSave.dataDelta.component_properties).toContain(newPropertyQuery);
                        });

                    });

                    describe('When a data query was added', function () {

                        it('Should contain the added data item', function () {
                            var newDataItem = {dataItemId: {a: 1}};

                            var currentMasterPageDocumentData = currentSnapshot.pagesData.masterPage.data.document_data;
                            _.merge(currentMasterPageDocumentData, newDataItem);

                            this.partialSave(lastSnapshot, currentSnapshot, resolve, reject);

                            var dataToSave = ajaxSpy.calls.mostRecent().args[0].data;
                            expect(dataToSave.dataDelta.document_data).toContain(newDataItem);
                        });

                    });

                    describe('When a data item was changed', function () {

                        it('Should contain the new data item', function () {
                            var oldDataItem = {dataItemId: {a: 1}};
                            var newDataItem = {dataItemId: {b: 1}};

                            var lastMasterPageDocumentData = lastSnapshot.pagesData.masterPage.data.document_data;
                            _.merge(lastMasterPageDocumentData, oldDataItem);

                            var currentMasterPageDocumentData = currentSnapshot.pagesData.masterPage.data.document_data;
                            _.merge(currentMasterPageDocumentData, newDataItem);

                            this.partialSave(lastSnapshot, currentSnapshot, resolve, reject);

                            var dataToSave = ajaxSpy.calls.mostRecent().args[0].data;
                            expect(dataToSave.dataDelta.document_data).toContain(newDataItem);
                        });

                    });

                    describe('When a style query was added', function () {

                        it('Should contain the added style item', function () {
                            var newStyleItem = {styleItemId: {a: 1}};

                            var currentMasterPageThemeData = currentSnapshot.pagesData.masterPage.data.theme_data;
                            _.merge(currentMasterPageThemeData, newStyleItem);

                            this.partialSave(lastSnapshot, currentSnapshot, resolve, reject);

                            var dataToSave = ajaxSpy.calls.mostRecent().args[0].data;
                            expect(dataToSave.dataDelta.theme_data).toContain(newStyleItem);
                        });

                    });

                    describe('When a style item was changed', function () {

                        it('Should contain the new style item', function () {
                            var oldStyleItem = {styleItemId: {a: 1}};
                            var newStyleItem = {styleItemId: {b: 1}};

                            var lastMasterPageThemeData = lastSnapshot.pagesData.masterPage.data.theme_data;
                            _.merge(lastMasterPageThemeData, oldStyleItem);

                            var currentMasterPageThemeData = currentSnapshot.pagesData.masterPage.data.theme_data;
                            _.merge(currentMasterPageThemeData, newStyleItem);

                            this.partialSave(lastSnapshot, currentSnapshot, resolve, reject);

                            var dataToSave = ajaxSpy.calls.mostRecent().args[0].data;
                            expect(dataToSave.dataDelta.theme_data).toContain(newStyleItem);
                        });

                    });

                    describe('When design data was added', function () {
                        it('Should contain the new data item', function () {
                            testUtils.experimentHelper.openExperiments('designData');

                            var newDataItem = {dataItemId: {b: 1}};

                            var currentMasterPageDocumentData = currentSnapshot.pagesData.masterPage.data.design_data;
                            _.merge(currentMasterPageDocumentData, newDataItem);

                            this.partialSave(lastSnapshot, currentSnapshot, resolve, reject);

                            var dataToSave = ajaxSpy.calls.mostRecent().args[0].data;
                            expect(dataToSave.dataDelta.design_data).toContain(newDataItem);
                        });
                    });

                    describe('When design data was changed', function () {
                        it('Should contain the new data item', function () {
                            testUtils.experimentHelper.openExperiments('designData');

                            var oldDataItem = {dataItemId: {a: 1}};
                            var newDataItem = {dataItemId: {b: 1}};

                            var lastMasterPageDocumentData = lastSnapshot.pagesData.masterPage.data.design_data;
                            _.merge(lastMasterPageDocumentData, oldDataItem);

                            var currentMasterPageDocumentData = currentSnapshot.pagesData.masterPage.data.design_data;
                            _.merge(currentMasterPageDocumentData, newDataItem);

                            this.partialSave(lastSnapshot, currentSnapshot, resolve, reject);

                            var dataToSave = ajaxSpy.calls.mostRecent().args[0].data;
                            expect(dataToSave.dataDelta.design_data).toContain(newDataItem);
                        });
                    });
                });

                describe('When siteMetadata was not changed', function () {

                    it('Should not contain siteMetaData property', function () {
                        this.partialSave(lastSnapshot, currentSnapshot, resolve, reject);

                        var dataToSave = ajaxSpy.calls.mostRecent().args[0].data;
                        expect(dataToSave.siteMetaData).not.toBeDefined();
                    });

                });

                describe('When siteMetadata was changed', function () {

                    it('Should contain siteMetaData', function () {
                        currentSnapshot.rendererModel.siteMetaData.quickActions.colorScheme = "newScheme";

                        this.partialSave(lastSnapshot, currentSnapshot, resolve, reject);

                        var dataToSave = ajaxSpy.calls.mostRecent().args[0].data;
                        expect(dataToSave.siteMetaData).toEqual(getExpectedSiteMetaData(currentSnapshot.rendererModel.siteMetaData));
                    });

                    it('Should add headTags if there are metaTags', function () {
                        var fakeMetaTags = '<fake meta tag>';
                        currentSnapshot.documentServicesModel.customHeadTags = fakeMetaTags;

                        this.partialSave(lastSnapshot, currentSnapshot, resolve, reject);

                        var dataToSave = ajaxSpy.calls.mostRecent().args[0].data;
                        expect(dataToSave.siteMetaData.headTags).toEqual(fakeMetaTags);
                    });

                });

                describe('When metaSiteData was not changed', function () {

                    it('Should not contain siteMetaData property', function () {
                        this.partialSave(lastSnapshot, currentSnapshot, resolve, reject);

                        var dataToSave = ajaxSpy.calls.mostRecent().args[0].data;
                        expect(dataToSave.metaSiteData).not.toBeDefined();
                    });

                });

                describe('When metaSiteData was changed', function () {

                    it('Should contain siteMetaData', function () {
                        currentSnapshot.documentServicesModel.metaSiteData.indexable = false; // 'true' by default

                        this.partialSave(lastSnapshot, currentSnapshot, resolve, reject);

                        var dataToSave = ajaxSpy.calls.mostRecent().args[0].data;
                        var expectedMetaSiteData = _.merge({adaptiveMobileOn: true}, currentSnapshot.documentServicesModel.metaSiteData);
                        expect(dataToSave.metaSiteData).toEqual(expectedMetaSiteData);
                    });

                });

                describe('when adaptiveMobileOn was changed in the siteMetaData', function () {
                    it('Should have the adaptiveMobileOn in the metaSiteData for the dataToSave, even though it is in the siteMetaData in the models (this is due to the old client unfortunately)', function () {
                        currentSnapshot.rendererModel.siteMetaData.adaptiveMobileOn = false;
                        this.partialSave(lastSnapshot, currentSnapshot, resolve, reject);

                        var dataToSave = ajaxSpy.calls.mostRecent().args[0].data;
                        expect(typeof dataToSave.metaSiteData.adaptiveMobileOn).toBe('boolean');
                        expect(typeof dataToSave.siteMetaData).toBe('undefined');
                    });
                });

                describe('When there are no deleted pages', function () {

                    it('Should contain an empty deletedPageIds array', function () {
                        this.partialSave(lastSnapshot, currentSnapshot, resolve, reject);

                        var dataToSave = ajaxSpy.calls.mostRecent().args[0].data;
                        expect(dataToSave.deletedPageIds).toEqual([]);
                    });
                });

                describe('When there is a deleted page', function () {

                    it('Should contain a deletedPagesId array of all deleted page ids', function () {
                        _.merge(lastSnapshot.pagesData, {
                            page1: {
                                data: {
                                    document_data: {},
                                    component_properties: {},
                                    theme_data: {}
                                },
                                structure: {
                                    id: "page1"
                                }
                            }
                        });

                        this.partialSave(lastSnapshot, currentSnapshot, resolve, reject);

                        var dataToSave = ajaxSpy.calls.mostRecent().args[0].data;
                        expect(dataToSave.deletedPageIds).toEqual(['page1']);
                    });
                });

                describe('When there is no change in the master page', function () {

                    it('Should not contain masterPage property', function () {
                        this.partialSave(lastSnapshot, currentSnapshot, resolve, reject);

                        var dataToSave = ajaxSpy.calls.mostRecent().args[0].data;
                        expect(dataToSave.masterPage).not.toBeDefined();
                    });
                });

                describe('When masterPage was changed', function () {

                    it('Should contain the masterPage structure object with its children, mobileComponents and type properties', function () {
                        var currentMasterPageStructure = currentSnapshot.pagesData.masterPage.structure;
                        currentMasterPageStructure.children[0].components.push(
                            {componentType: "wysiwyg.viewer.components.WRichText"}
                        );
                        currentMasterPageStructure.layout.y = 100;

                        this.partialSave(lastSnapshot, currentSnapshot, resolve, reject);

                        var dataToSave = ajaxSpy.calls.mostRecent().args[0].data;
                        expect(dataToSave.masterPage.children).toEqual(currentMasterPageStructure.children);
                        expect(dataToSave.masterPage.mobileComponents).toEqual(currentMasterPageStructure.mobileComponents);
                        expect(dataToSave.masterPage.type).toEqual(currentMasterPageStructure.type);
                        expect(dataToSave.masterPage.layout).toEqual(currentMasterPageStructure.layout);
                        expect(dataToSave.masterPage.behaviorQuery).toBeUndefined();
                    });

                    it('should also contain behaviorQuery if there is one', function () {
                        var currentMasterPageStructure = currentSnapshot.pagesData.masterPage.structure;
                        currentMasterPageStructure.behaviorQuery = 'foo';

                        this.partialSave(lastSnapshot, currentSnapshot, resolve, reject);

                        var dataToSave = ajaxSpy.calls.mostRecent().args[0].data;
                        expect(dataToSave.masterPage.behaviorQuery).toEqual('foo');
                    });

                    it('should not contain dataQuery', function () {
                        var currentMasterPageStructure = currentSnapshot.pagesData.masterPage.structure;
                        currentMasterPageStructure.dataQuery = 'bar';

                        this.partialSave(lastSnapshot, currentSnapshot, resolve, reject);

                        var dataToSave = ajaxSpy.calls.mostRecent().args[0].data;
                        expect(dataToSave.masterPage.dataQuery).toBeUndefined();
                    });

                    it('should NOT be in the updatedPages', function () {
                        var currentMasterPageStructure = currentSnapshot.pagesData.masterPage.structure;
                        currentMasterPageStructure.children[0].components.push(
                            {componentType: "wysiwyg.viewer.components.WRichText"}
                        );

                        this.partialSave(lastSnapshot, currentSnapshot, resolve, reject);

                        var dataToSave = ajaxSpy.calls.mostRecent().args[0].data;
                        var masterPage = _.find(dataToSave.updatedPages, {type: "Document"});
                        expect(masterPage).not.toBeDefined();
                    });

                });

                describe('When no page was updated', function () {

                    it('Should contain an empty updatedPages array', function () {
                        this.partialSave(lastSnapshot, currentSnapshot, resolve, reject);

                        var dataToSave = ajaxSpy.calls.mostRecent().args[0].data;
                        expect(dataToSave.updatedPages).toEqual([]);
                    });

                });

                describe('When a page was updated', function () {

                    it('Should contain pages structure objects of the updated pages structure', function () {
                        var currentPageStructure = currentSnapshot.pagesData.currentPage.structure;
                        currentPageStructure.components.push(
                            {componentType: "wysiwyg.viewer.components.WRichText"}
                        );

                        this.partialSave(lastSnapshot, currentSnapshot, resolve, reject);

                        var dataToSave = ajaxSpy.calls.mostRecent().args[0].data;
                        expect(dataToSave.updatedPages).toContain(currentSnapshot.pagesData.currentPage.structure);
                    });
                });

                describe('When wixCodeAppData was not changed', function () {

                    it('Should not contain a wixCodeAppData property', function () {
                        this.partialSave(lastSnapshot, currentSnapshot, resolve, reject);

                        var dataToSave = ajaxSpy.calls.mostRecent().args[0].data;
                        expect(dataToSave.wixCodeAppData).not.toBeDefined();
                    });

                });

                describe('When wixCodeAppData was changed', function () {

                    it('Should contain the current wixCodeAppData', function () {
                        currentSnapshot.rendererModel.wixCodeModel = {
                            appData: {
                                codeAppId: 'def7a7ce-09e7-4a59-a101-fc53e9332082'
                            },
                            signedAppRenderInfo: 'ff6ddb65a01c00fd6f57cc7415d82002eff163ad.eyJncmlkQXBwSWQiOiIwMGUyOWM0MS0wNzUxLTQxOTItOTE1YS1iNTY2MzhjNGJmMjMiLCJjb3JyZWxhdGlvbklkIjoiYzBlYzQzMzYtNmU1My00M2YwLTgxODctYmUzNDZmNWU5NzY2Iiwic2Vzc2lvblVJZCI6IjFhYzdkOWE3LWJiYTQtNDYwYy05ZDFkLWIzYzc3NTAzNTQzNCIsImlzVmlld1JldmlzaW9uIjpmYWxzZSwiZGVtb0lkIjpudWxsLCJzaWduRGF0ZSI6MTQ3NDI5MDM4NTkwOH0='
                        };

                        this.partialSave(lastSnapshot, currentSnapshot, resolve, reject);

                        var dataToSave = ajaxSpy.calls.mostRecent().args[0].data;
                        expect(dataToSave.wixCodeAppData).toEqual({
                            codeAppId: currentSnapshot.rendererModel.wixCodeModel.appData.codeAppId,
                            signedAppRenderInfo: currentSnapshot.rendererModel.wixCodeModel.signedAppRenderInfo
                        });
                    });

                });

                describe('password protected pages', function () {
                    describe('When page password was not changed/added', function () {
                        it('Should have empty protectedPagesData', function () {
                            lastSnapshot.rendererModel.pageToHashedPassword = {pageId: 'new password'};
                            currentSnapshot.rendererModel.pageToHashedPassword = {pageId: 'new password'};

                            this.partialSave(lastSnapshot, currentSnapshot, resolve, reject);

                            var dataToSave = ajaxSpy.calls.mostRecent().args[0].data;
                            expect(dataToSave.protectedPagesData).toEqual({});
                        });
                    });

                    describe('When page password was changed/added', function () {
                        it('Should have the current protectedPagesData', function () {
                            currentSnapshot.rendererModel.pageToHashedPassword = {pageId: 'new password'};

                            this.partialSave(lastSnapshot, currentSnapshot, resolve, reject);

                            var dataToSave = ajaxSpy.calls.mostRecent().args[0].data;
                            expect(dataToSave.protectedPagesData).toEqual(currentSnapshot.rendererModel.pageToHashedPassword);
                        });
                    });

                    describe('when page password was removed', function () {
                        it('should send null for that pageId in the protectedPagesData', function () {
                            lastSnapshot.rendererModel.pageToHashedPassword = {pageId: 'new password'};
                            currentSnapshot.rendererModel.pageToHashedPassword = {pageId: null};

                            this.partialSave(lastSnapshot, currentSnapshot, resolve, reject);

                            var dataToSave = ajaxSpy.calls.mostRecent().args[0].data;
                            expect(dataToSave.protectedPagesData).toEqual({
                                pageId: null
                            });
                        });
                    });
                });

                describe('Routers', function () {
                    describe('When there are no changes in the routing table', function () {
                        describe('When there is an existing routing table:', function () {
                            it('Should not send routers', function () {
                                lastSnapshot = createSnapshot(null, {
                                    configMap: {
                                        1: {
                                            prefix: 'recipes',
                                            appId: 99,
                                            config: {}
                                        }
                                    }
                                });
                                currentSnapshot = createSnapshot(null, {
                                    configMap: {
                                        1: {
                                            prefix: 'recipes',
                                            appId: 99,
                                            config: {}
                                        }
                                    }
                                });

                                this.partialSave(lastSnapshot, currentSnapshot, resolve, reject);

                                var dataToSave = ajaxSpy.calls.mostRecent().args[0].data;
                                expect(dataToSave.routers).toBeUndefined();
                            });
                        });

                        describe('When current routing table is not defined:', function () {
                            it('Should not send routers', function () {
                                this.partialSave(lastSnapshot, currentSnapshot, resolve, reject);

                                var dataToSave = ajaxSpy.calls.mostRecent().args[0].data;
                                expect(dataToSave.routers).toBeUndefined();
                            });
                        });
                    });

                    describe('When router was added', function () {

                        it('Should have the current routersData with the new router', function () {
                            testUtils.experimentHelper.openExperiments('sv_dpages');
                            currentSnapshot = createSnapshot(null, {
                                configMap: {
                                    1: {
                                        prefix: 'recipes',
                                        appDefinitionId: 'dataBinding',
                                        config: {}
                                    }
                                }
                            });
                            var expectedConfigMap = {configMap: {1: {prefix: 'recipes', appId: -1, config: {}}}};
                            this.partialSave(lastSnapshot, currentSnapshot, resolve, reject);

                            var dataToSave = ajaxSpy.calls.mostRecent().args[0].data;
                            expect(dataToSave.routers).toEqual(expectedConfigMap);
                        });
                    });

                    describe('When router was changed', function () {
                        it('Should have the current routersData with the updated data', function () {
                            testUtils.experimentHelper.openExperiments('sv_dpages');

                            lastSnapshot = createSnapshot(null, {
                                configMap: {
                                    1: {
                                        prefix: 'desserts',
                                        appDefinitionId: 'dataBinding',
                                        config: {}
                                    }
                                }
                            });
                            currentSnapshot = createSnapshot(null, {
                                configMap: {
                                    1: {
                                        prefix: 'recipes',
                                        appDefinitionId: 'dataBinding',
                                        config: {}
                                    }
                                }
                            });
                            var expectedConfigMap = {configMap: {1: {prefix: 'recipes', appId: -1, config: {}}}};
                            this.partialSave(lastSnapshot, currentSnapshot, resolve, reject);

                            var dataToSave = ajaxSpy.calls.mostRecent().args[0].data;
                            expect(dataToSave.routers).toEqual(expectedConfigMap);
                        });
                    });

                    describe('when router was removed', function () {
                        it('Should have the current routersData after deletion', function () {
                            testUtils.experimentHelper.openExperiments('sv_dpages');
                            lastSnapshot = createSnapshot(null, {
                                configMap: {
                                    1: {
                                        prefix: 'recipes',
                                        appDefinitionId: 'dataBinding',
                                        config: {}
                                    }
                                }
                            });
                            currentSnapshot = createSnapshot(null, {configMap: {}});


                            this.partialSave(lastSnapshot, currentSnapshot, resolve, reject);

                            var dataToSave = ajaxSpy.calls.mostRecent().args[0].data;
                            expect(dataToSave.routers).toEqual({configMap: {}});
                        });
                    });
                });

                describe('behaviors_data map', function () {
                    it('should send behaviors_data map as part of the payload after behaviors migration was done', function () {
                        var siteData = testUtils.mockFactory.mockSiteData();
                        var newSnapshot = createSnapshot(siteData.pagesData);

                        this.partialSave(lastSnapshot, newSnapshot, resolve, reject);

                        var dataToSave = ajaxSpy.calls.mostRecent().args[0].data;
                        expect(_.get(dataToSave, 'dataDelta.behaviors_data')).toEqual({});
                    });

                    it('should send behaviors_data map as part of the payload before behaviors migration was done', function () {
                        var siteData = testUtils.mockFactory.mockSiteData();
                        var newSnapshot = createSnapshot(siteData.pagesData);

                        this.partialSave(lastSnapshot, newSnapshot, resolve, reject);

                        var dataToSave = ajaxSpy.calls.mostRecent().args[0].data;
                        expect(_.get(dataToSave, 'dataDelta.behaviors_data')).toEqual({});
                    });
                });

                describe('Auto-Save', function () {
                    describe('When current documentServicesModel is NOT flagged by autosave', function () {
                        it('Should not flag the payload when autoSaveInfo is not defined (before first save)', function () {
                            this.partialSave(lastSnapshot, currentSnapshot, resolve, reject);

                            var dataToSave = ajaxSpy.calls.mostRecent().args[0].data;
                            expect(dataToSave.initiator).toBeUndefined();
                        });

                        it('Should not flag the payload when autoSaveInfo is defined (but did not flag documentServicesModel)', function () {
                            _.merge(currentSnapshot.documentServicesModel.autoSaveInfo, {shouldAutoSave: true});
                            this.partialSave(lastSnapshot, currentSnapshot, resolve, reject);

                            var dataToSave = ajaxSpy.calls.mostRecent().args[0].data;
                            expect(dataToSave.initiator).toBeUndefined();
                        });
                    });

                    describe('When current documentServicesModel is flagged by autosave', function () {
                        it('Should flag the payload', function () {
                            var initiatorValueExpectedByServer = 'auto_save';
                            _.merge(currentSnapshot.documentServicesModel, {autoSaveInfo: {autoFullSaveFlag: true}});

                            this.partialSave(lastSnapshot, currentSnapshot, resolve, reject);

                            var dataToSave = ajaxSpy.calls.mostRecent().args[0].data;
                            expect(dataToSave.initiator).toEqual(initiatorValueExpectedByServer);
                        });
                    });
                });

                it('should not send connections_data map as part of the payload', function () {
                    var siteData = testUtils.mockFactory.mockSiteData();
                    var newSnapshot = createSnapshot(siteData.pagesData);

                    this.partialSave(lastSnapshot, newSnapshot, resolve, reject);

                    var dataToSave = ajaxSpy.calls.mostRecent().args[0].data;
                    expect(_.get(dataToSave, 'dataDelta.connections_data')).toEqual({});
                });

                it('Should contain a siteId, site revision, site version, and orphanPermanentDataNodes array', function () {
                    this.partialSave(lastSnapshot, currentSnapshot, resolve, reject);

                    var dataToSave = ajaxSpy.calls.mostRecent().args[0].data;
                    expect(dataToSave.id).toEqual(currentSnapshot.rendererModel.siteInfo.siteId);
                    expect(dataToSave.revision).toEqual(currentSnapshot.documentServicesModel.revision);
                    expect(dataToSave.version).toEqual(currentSnapshot.documentServicesModel.version);
                    expect(dataToSave.dataNodeIdsToDelete).toEqual(currentSnapshot.orphanPermanentDataNodes);
                });
            });

        });

        describe('fullSave', function () {

            it('Should call the fullSave end point with expected data', function () {
                var metaSiteId = currentSnapshot.rendererModel.metaSiteId;
                var editorSessionId = currentSnapshot.documentServicesModel.editorSessionId;

                this.fullSave(lastSnapshot, currentSnapshot, resolve, reject);

                var actualFullSave = ajaxSpy.calls.mostRecent().args[0].url;
                var expectedFullSaveUrl = currentSnapshot.serviceTopology.editorServerRoot + '/api/new_override_save' + '?' + ('editorSessionId=' + editorSessionId) + '&' + ('metaSiteId=' + metaSiteId);
                expect(actualFullSave).toEqual(expectedFullSaveUrl);
            });

            it('should add the X-Wix-Editor-Version header', function () {
                this.fullSave(lastSnapshot, currentSnapshot, resolve, reject);
                var headers = ajaxSpy.calls.mostRecent().args[0].headers;
                expect(headers).toContain({'X-Wix-Editor-Version': 'new'});
            });

            describe('When ajax success', function () {

                describe('When task succeeds', function () {

                    beforeEach(function () {
                        this.saveSuccessResponse = {
                            success: true,
                            payload: {version: 2, revision: 2}
                        };
                        fakeAjaxSuccess(this.saveSuccessResponse);
                    });

                    it('Should call resolve() callback with expected result object', function () {

                        this.fullSave(lastSnapshot, currentSnapshot, resolve, reject);

                        expect(resolve).toHaveBeenCalled();
                        var resolveArg = resolve.calls.mostRecent().args[0];
                        expect(resolveArg).toEqual({
                            'documentServicesModel.revision': this.saveSuccessResponse.payload.revision,
                            'documentServicesModel.version': this.saveSuccessResponse.payload.version,
                            'orphanPermanentDataNodes': []
                        });
                    });

                    it('Should also clear autoSaveInfo.previousDiffId if autoSaveInfo is rendered', function () {
                        currentSnapshot.documentServicesModel.autoSaveInfo = {shouldAutoSave: true};
                        this.partialSave(lastSnapshot, currentSnapshot, resolve, reject);

                        var resolveArg = resolve.calls.mostRecent().args[0];
                        expect(resolveArg).toEqual({
                            'documentServicesModel.revision': this.saveSuccessResponse.payload.revision,
                            'documentServicesModel.version': this.saveSuccessResponse.payload.version,
                            'orphanPermanentDataNodes': [],
                            'documentServicesModel.autoSaveInfo.previousDiffId': undefined
                        });
                    });
                });

                describe('When task fails', function () {

                    it('Should call reject() callback with expected reject object', function () {
                        var saveErrorResponse = {
                            success: false,
                            errorCode: 1020,
                            errorDescription: 'desc'
                        };
                        fakeAjaxSuccess(saveErrorResponse);

                        this.fullSave(lastSnapshot, currentSnapshot, resolve, reject);

                        expect(reject).toHaveBeenCalled();
                        var rejectArg = reject.calls.mostRecent().args[0];
                        expect(rejectArg).toEqual({
                            errorCode: saveErrorResponse.errorCode,
                            errorDescription: saveErrorResponse.errorDescription,
                            errorType: errors.save.UNKNOWN_SERVER_ERROR
                        });
                    });

                });

            });

            describe('When ajax fails', function () {

                it('Should call reject() with expected reject object', function () {
                    var ajaxErrorResponse = {
                        status: 500,
                        statusText: 'Save failed'
                    };
                    fakeAjaxError(ajaxErrorResponse);

                    this.fullSave(lastSnapshot, currentSnapshot, resolve, reject);

                    var rejectArg = reject.calls.mostRecent().args[0];
                    expect(rejectArg).toEqual({
                        errorCode: ajaxErrorResponse.status,
                        errorDescription: ajaxErrorResponse.statusText,
                        errorType: errors.save.HTTP_REQUEST_ERROR
                    });
                });
            });

            describe('Data To Save', function () {

                it('Should send all current data items in dataDelta', function () {
                    this.fullSave(lastSnapshot, currentSnapshot, resolve, reject);

                    var dataToSave = ajaxSpy.calls.mostRecent().args[0].data;
                    expect(dataToSave.dataDelta.component_properties).toEqual(aggregateDataFromPages(currentSnapshot.pagesData, 'component_properties'));
                    expect(dataToSave.dataDelta.document_data).toEqual(aggregateDataFromPages(currentSnapshot.pagesData, 'document_data'));
                    expect(dataToSave.dataDelta.component_properties).toEqual(aggregateDataFromPages(currentSnapshot.pagesData, 'component_properties'));
                });

                it('Should have an empty deletedPageIds array', function () {
                    this.fullSave(lastSnapshot, currentSnapshot, resolve, reject);

                    var dataToSave = ajaxSpy.calls.mostRecent().args[0].data;
                    expect(dataToSave.deletedPageIds).toEqual([]);
                });

                it('Should have the current masterPage structure', function () {
                    this.fullSave(lastSnapshot, currentSnapshot, resolve, reject);

                    var currentMasterPageStructure = currentSnapshot.pagesData.masterPage.structure;
                    var dataToSave = ajaxSpy.calls.mostRecent().args[0].data;
                    expect(dataToSave.masterPage.children).toEqual(currentMasterPageStructure.children);
                    expect(dataToSave.masterPage.mobileComponents).toEqual(currentMasterPageStructure.mobileComponents);
                    expect(dataToSave.masterPage.type).toEqual(currentMasterPageStructure.type);
                });

                it('Should have all current pages structures (without masterpage)', function () {
                    this.fullSave(lastSnapshot, currentSnapshot, resolve, reject);

                    var allCurrentPagesStructures = _.map(_.omit(currentSnapshot.pagesData, ['masterPage']), 'structure');
                    var dataToSave = ajaxSpy.calls.mostRecent().args[0].data;
                    expect(dataToSave.updatedPages).toEqual(allCurrentPagesStructures);
                });

                it('Should have the current siteMetaData', function () {
                    this.fullSave(lastSnapshot, currentSnapshot, resolve, reject);

                    var dataToSave = ajaxSpy.calls.mostRecent().args[0].data;
                    expect(dataToSave.siteMetaData).toEqual(getExpectedSiteMetaData(currentSnapshot.rendererModel.siteMetaData));
                });

                it('Should have the current metaSiteData', function () {
                    this.fullSave(lastSnapshot, currentSnapshot, resolve, reject);

                    var dataToSave = ajaxSpy.calls.mostRecent().args[0].data;
                    var expectedMetaSiteData = _.merge({adaptiveMobileOn: true}, currentSnapshot.documentServicesModel.metaSiteData);
                    expect(dataToSave.metaSiteData).toEqual(expectedMetaSiteData);
                });

                it('Should have the current routers data', function () {
                    testUtils.experimentHelper.openExperiments('sv_dpages');

                    currentSnapshot = createSnapshot(null, {
                        configMap: {
                            1: {
                                prefix: 'recipes',
                                appDefinitionId: 'dataBinding',
                                config: {}
                            }
                        }
                    });
                    var expectedConfigMap = {configMap: {1: {prefix: 'recipes', appId: -1, config: {}}}};
                    this.firstSave(lastSnapshot, currentSnapshot, resolve, reject);

                    var dataToSave = ajaxSpy.calls.mostRecent().args[0].data;
                    expect(dataToSave.routers).toEqual(expectedConfigMap);
                });

                it('Should have undefined routers, if the current routers are undefined', function () {

                    this.firstSave(lastSnapshot, currentSnapshot, resolve, reject);

                    var dataToSave = ajaxSpy.calls.mostRecent().args[0].data;
                    expect(dataToSave.routers).toBeUndefined();
                });

                it('Should have the current protectedPagesData', function () {
                    currentSnapshot.rendererModel.pageToHashedPassword = {pageId: 'new password'};
                    this.fullSave(lastSnapshot, currentSnapshot, resolve, reject);

                    var dataToSave = ajaxSpy.calls.mostRecent().args[0].data;
                    expect(dataToSave.protectedPagesData).toEqual(currentSnapshot.rendererModel.pageToHashedPassword);
                });

                it('Should have the adaptiveMobileOn in the metaSiteData for the save, even though it is in the siteMetaData in the models (this is due to the old client unfortunately)', function () {
                    this.fullSave(lastSnapshot, currentSnapshot, resolve, reject);

                    var dataToSave = ajaxSpy.calls.mostRecent().args[0].data;
                    expect(typeof dataToSave.metaSiteData.adaptiveMobileOn).toBe('boolean');
                    expect(typeof dataToSave.siteMetaData.adaptiveMobileOn).toBe('undefined');
                });

                it('Should have the current wixCodeAppData', function () {
                    this.fullSave(lastSnapshot, currentSnapshot, resolve, reject);

                    var dataToSave = ajaxSpy.calls.mostRecent().args[0].data;
                    expect(dataToSave.wixCodeAppData).toEqual({
                        codeAppId: currentSnapshot.rendererModel.wixCodeModel.appData.codeAppId,
                        signedAppRenderInfo: currentSnapshot.rendererModel.wixCodeModel.signedAppRenderInfo
                    });
                });

                it('Should not contain wixCodeAppData if it is not present in the data model', function () {
                    currentSnapshot.rendererModel.wixCodeModel = undefined;
                    this.fullSave(lastSnapshot, currentSnapshot, resolve, reject);

                    var dataToSave = ajaxSpy.calls.mostRecent().args[0].data;
                    expect(dataToSave.wixCodeAppData).toBeUndefined();
                });

                it('Should contain a siteId, site revision, site version and orphanPermanentDataNodes array', function () {
                    this.fullSave(lastSnapshot, currentSnapshot, resolve, reject);

                    var dataToSave = ajaxSpy.calls.mostRecent().args[0].data;
                    expect(dataToSave.id).toEqual(currentSnapshot.rendererModel.siteInfo.siteId);
                    expect(dataToSave.revision).toEqual(currentSnapshot.documentServicesModel.revision);
                    expect(dataToSave.version).toEqual(currentSnapshot.documentServicesModel.version);
                    expect(dataToSave.dataNodeIdsToDelete).toEqual(currentSnapshot.orphanPermanentDataNodes);
                });

                describe('behaviors_data map', function () {
                    it('should send behaviors_data map as part of the payload after behaviors migration was done', function () {
                        var siteData = testUtils.mockFactory.mockSiteData();
                        var newSnapshot = createSnapshot(siteData.pagesData);

                        this.fullSave(lastSnapshot, newSnapshot, resolve, reject);

                        var dataToSave = ajaxSpy.calls.mostRecent().args[0].data;
                        expect(_.get(dataToSave, 'dataDelta.behaviors_data')).toEqual({});
                    });

                    it('should send behaviors_data map as part of the payload before behaviors migration was done', function () {
                        var siteData = testUtils.mockFactory.mockSiteData();
                        var newSnapshot = createSnapshot(siteData.pagesData);

                        this.fullSave(lastSnapshot, newSnapshot, resolve, reject);

                        var dataToSave = ajaxSpy.calls.mostRecent().args[0].data;
                        expect(_.get(dataToSave, 'dataDelta.behaviors_data')).toEqual({});
                    });
                });

                it('should send connections_data map as part of the payload', function () {
                    var siteData = testUtils.mockFactory.mockSiteData();
                    var newSnapshot = createSnapshot(siteData.pagesData);

                    this.fullSave(lastSnapshot, newSnapshot, resolve, reject);

                    var dataToSave = ajaxSpy.calls.mostRecent().args[0].data;
                    expect(_.get(dataToSave, 'dataDelta.connections_data')).toEqual({});
                });
            });

        });

        describe('firstSave', function () {

            it('Should call the correct firstSave endPoint', function () {
                var metaSiteId = currentSnapshot.rendererModel.metaSiteId;
                var editorSessionId = currentSnapshot.documentServicesModel.editorSessionId;

                this.firstSave(lastSnapshot, currentSnapshot, resolve, reject);

                var actualFirstSaveUrl = ajaxSpy.calls.mostRecent().args[0].url;
                var expectedFirstSaveUrl = currentSnapshot.serviceTopology.editorServerRoot + '/api/first_save' + '?' + ('editorSessionId=' + editorSessionId) + '&' + ('metaSiteId=' + metaSiteId);
                expect(actualFirstSaveUrl).toEqual(expectedFirstSaveUrl);
            });

            it('should add the X-Wix-Editor-Version header', function () {
                this.firstSave(lastSnapshot, currentSnapshot, resolve, reject);
                var headers = ajaxSpy.calls.mostRecent().args[0].headers;
                expect(headers).toContain({'X-Wix-Editor-Version': 'new'});
            });

            describe('When ajax success', function () {

                describe('When task succeeds', function () {
                    var saveSuccessPayload = {
                        previewModel: {
                            siteId: 'abcd-efg',
                            metaSiteModel: {
                                metaSiteId: 'hij-klm',
                                premiumFeatures: [],
                                siteName: 'siteName',
                                documentType: 'docType',
                                clientSpecMap: {
                                    10: {
                                        type: 'tpa',
                                        applicationId: 11,
                                        appDefinitionId: 'e4c4a4fb-673d-493a-9ef1-661fa3823ad9',
                                        instanceId: '1234',
                                        demoMode: false
                                    },
                                    12: {
                                        type: 'tpa',
                                        applicationId: 13,
                                        appDefinitionId: 'e4c4a4fb-673d-493a-9ef1-661fa3823ad8',
                                        instanceId: '',
                                        demoMode: true
                                    },
                                    14: {
                                        type: 'wixapps',
                                        applicationId: 15,
                                        appDefinitionId: 'e4c4a4fb-673d-493a-9ef1-661fa3823ad7',
                                        datastoreId: '138fd00e-ef2f-903d-d5e7-41c895e75d46',
                                        state: 'Template'
                                    },
                                    16: {
                                        type: 'appbuilder',
                                        applicationId: 16,
                                        appDefinitionId: '3d590cbc-4907-4cc4-b0b1-ddf2c5edf297',
                                        instanceId: 'EA8957FF-C900-4339-94ED-FF6B83501955',
                                        state: 'Template'
                                    },
                                    18: {
                                        type: 'sitemembers',
                                        applicationId: 19,
                                        collectionType: '',
                                        smcollectionId: false
                                    },
                                    20: {
                                        type: 'ecommerce',
                                        applicationId: 21,
                                        appDefinitionId: 'e4c4a4fb-673d-493a-9ef1-661fa3823a10',
                                        magentoStoreId: '',
                                        state: false
                                    }
                                }
                            }
                        },
                        metaSiteId: '',
                        siteHeader: {
                            id: 'id',
                            version: 123,
                            revision: 1
                        },
                        metaSiteData: {},
                        publicUrl: 'http://www.publicUrl.com/siteName',
                        usedMetaSiteNames: [],
                        autoSaveInfo: {
                            shouldAutoSave: false
                        }
                    };
                    it('Should call resolve() callback with expected result object', function () {
                        testUtils.experimentHelper.closeExperiments('sv_permissionInfoUpdateOnFirstSave');

                        var saveSuccessResponse = {
                            success: true,
                            payload: saveSuccessPayload
                        };
                        fakeAjaxSuccess(saveSuccessResponse);
                        this.firstSave(lastSnapshot, currentSnapshot, resolve, reject);

                        var resolveArg = resolve.calls.mostRecent().args[0];
                        var expectedResolveArs = {
                            'rendererModel.siteInfo.siteId': saveSuccessResponse.payload.previewModel.siteId,
                            'rendererModel.metaSiteId': saveSuccessResponse.payload.previewModel.metaSiteModel.metaSiteId,
                            'rendererModel.premiumFeatures': saveSuccessResponse.payload.previewModel.metaSiteModel.premiumFeatures,
                            'documentServicesModel.siteName': saveSuccessResponse.payload.previewModel.metaSiteModel.siteName,
                            'rendererModel.siteInfo.documentType': saveSuccessResponse.payload.previewModel.metaSiteModel.documentType,
                            'rendererModel.clientSpecMap': {
                                10: {
                                    type: 'tpa',
                                    applicationId: 11,
                                    appDefinitionId: 'e4c4a4fb-673d-493a-9ef1-661fa3823ad9',
                                    instanceId: '1234',
                                    demoMode: false
                                },
                                12: {
                                    type: 'tpa',
                                    applicationId: 13,
                                    appDefinitionId: 'e4c4a4fb-673d-493a-9ef1-661fa3823ad8',
                                    instanceId: '',
                                    demoMode: false
                                },
                                14: {
                                    type: 'wixapps',
                                    applicationId: 15,
                                    appDefinitionId: 'e4c4a4fb-673d-493a-9ef1-661fa3823ad7',
                                    datastoreId: '138fd00e-ef2f-903d-d5e7-41c895e75d46',
                                    state: 'Template'
                                },
                                16: {
                                    type: 'appbuilder',
                                    applicationId: 16,
                                    appDefinitionId: '3d590cbc-4907-4cc4-b0b1-ddf2c5edf297',
                                    instanceId: 'EA8957FF-C900-4339-94ED-FF6B83501955',
                                    state: 'Template'
                                },
                                18: {type: 'sitemembers', applicationId: 19, collectionType: '', smcollectionId: false},
                                20: {
                                    type: 'ecommerce',
                                    applicationId: 21,
                                    appDefinitionId: 'e4c4a4fb-673d-493a-9ef1-661fa3823a10',
                                    magentoStoreId: '',
                                    state: false
                                },
                                22: {
                                    type: 'siteextension',
                                    applicationId: 22,
                                    extensionId: 'extension-id1',
                                    instanceId: 'instance-id1',
                                    instance: 'signed-instance1',
                                    cloudNotProvisioned: true
                                },
                                24: {
                                    type: 'siteextension',
                                    applicationId: 24,
                                    extensionId: 'extension-id2',
                                    instanceId: 'instance-id2',
                                    instance: 'signed-instance2',
                                    cloudNotProvisioned: true
                                }
                            },
                            'documentServicesModel.permissionsInfo.isOwner': true,
                            'documentServicesModel.neverSaved': false,
                            'documentServicesModel.metaSiteData': saveSuccessResponse.payload.metaSiteData,
                            'documentServicesModel.publicUrl': saveSuccessResponse.payload.publicUrl,
                            'documentServicesModel.usedMetaSiteNames': ['A', 'B', 'siteName'],
                            'documentServicesModel.revision': 1,
                            'documentServicesModel.version': 123,
                            'documentServicesModel.autoSaveInfo': {shouldAutoSave: false},
                            'orphanPermanentDataNodes': []
                        };

                        _.forEach(resolveArg, function (value, key) {
                            if (key === 'rendererModel.clientSpecMap') {
                                _.forEach(value, function (clientSpecMapValue, appId) {
                                    expect(clientSpecMapValue).toEqual(expectedResolveArs[key][appId]);
                                });
                            } else {
                                expect(value).toEqual(expectedResolveArs[key]);
                            }
                        });
                    });

                    it('should update permission info after save success', function () {
                        testUtils.experimentHelper.openExperiments('sv_permissionInfoUpdateOnFirstSave');

                        var saveSuccessResponse = {
                            success: true,
                            payload: _.merge({}, saveSuccessPayload, {permissionsInfo: {siteToken: 'SiteToken'}})
                        };
                        fakeAjaxSuccess(saveSuccessResponse);

                        this.firstSave(lastSnapshot, currentSnapshot, resolve, reject);

                        var resolveArg = resolve.calls.mostRecent().args[0];
                        expect(resolveArg['documentServicesModel.permissionsInfo']).toEqual({siteToken: 'SiteToken'});
                    });

                });

                describe('When task fails', function () {

                    it('Should call reject() callback with expected reject object', function () {
                        var saveErrorResponse = {
                            success: false,
                            errorCode: 1020,
                            errorDescription: 'desc'
                        };
                        fakeAjaxSuccess(saveErrorResponse);
                        this.firstSave(lastSnapshot, currentSnapshot, resolve, reject);

                        expect(reject).toHaveBeenCalled();
                        var rejectArg = reject.calls.mostRecent().args[0];
                        expect(rejectArg).toEqual({
                            errorCode: saveErrorResponse.errorCode,
                            errorDescription: saveErrorResponse.errorDescription,
                            errorType: errors.save.UNKNOWN_SERVER_ERROR
                        });
                    });
                });
            });

            describe('When ajax fails', function () {
                it('Should call reject() with expected reject object', function () {
                    var ajaxErrorResponse = {
                        status: 500,
                        statusText: 'Save failed'
                    };
                    fakeAjaxError(ajaxErrorResponse);
                    this.firstSave(lastSnapshot, currentSnapshot, resolve, reject);

                    var rejectArg = reject.calls.mostRecent().args[0];
                    expect(rejectArg).toEqual({
                        errorCode: ajaxErrorResponse.status,
                        errorDescription: ajaxErrorResponse.statusText,
                        errorType: errors.save.HTTP_REQUEST_ERROR
                    });
                });
            });

            describe('Data To Save', function () {

                it('Should have all current data items in the dataNodes property', function () {
                    this.firstSave(lastSnapshot, currentSnapshot, resolve, reject);

                    var dataToSave = ajaxSpy.calls.mostRecent().args[0].data;
                    expect(dataToSave.dataNodes).toEqual(aggregateDataFromPages(currentSnapshot.pagesData, 'document_data'));
                });

                it('Should have a single document object in the document property', function () {
                    this.firstSave(lastSnapshot, currentSnapshot, resolve, reject);

                    var dataToSave = ajaxSpy.calls.mostRecent().args[0].data;
                    expect(dataToSave.documents.length).toEqual(1);
                });

                it('Should have masterPage structure in the document, with the updated pages as components (children) of the pageGroup', function () {
                    this.firstSave(lastSnapshot, currentSnapshot, resolve, reject);

                    var dataToSave = ajaxSpy.calls.mostRecent().args[0].data;

                    var expectedMasterPage = currentSnapshot.pagesData.masterPage.structure;
                    // NOTE: we are adding the page structures to the pageGroup children that we expect,
                    // since this is how the pages are sent in firstSave in the old client, and the endpoint will not be fixed to expect a different payload anytime soon
                    var pagesContainer = _.find(expectedMasterPage.children, {componentType: "wysiwyg.viewer.components.PagesContainer"});
                    var pageGroup = pagesContainer.components[0];
                    pageGroup.components = _(currentSnapshot.pagesData).omit('masterPage').map('structure').value();

                    var masterPageFromPayload = dataToSave.documents[0];
                    expect(masterPageFromPayload.children).toEqual(expectedMasterPage.children);
                    expect(masterPageFromPayload.mobileComponents).toEqual(expectedMasterPage.mobileComponents);
                    expect(masterPageFromPayload.type).toEqual(expectedMasterPage.type);
                });

                it('Should have all current components properties in the document', function () {
                    this.firstSave(lastSnapshot, currentSnapshot, resolve, reject);

                    var dataToSave = ajaxSpy.calls.mostRecent().args[0].data;
                    expect(dataToSave.documents[0].componentProperties).toContain(aggregateDataFromPages(currentSnapshot.pagesData, 'components_properties'));
                });

                it('Should have all current style items in the document', function () {
                    this.firstSave(lastSnapshot, currentSnapshot, resolve, reject);

                    var dataToSave = ajaxSpy.calls.mostRecent().args[0].data;
                    expect(dataToSave.documents[0].themeData).toContain(aggregateDataFromPages(currentSnapshot.pagesData, 'theme_data'));
                });

                it('Should have the current siteMetaData', function () {
                    this.firstSave(lastSnapshot, currentSnapshot, resolve, reject);

                    var dataToSave = ajaxSpy.calls.mostRecent().args[0].data;
                    expect(dataToSave.siteMetaData).toEqual(getExpectedSiteMetaData(currentSnapshot.rendererModel.siteMetaData));
                });

                it('Should have the current routers data', function () {
                    testUtils.experimentHelper.openExperiments('sv_dpages');

                    currentSnapshot = createSnapshot(null, {
                        configMap: {
                            1: {
                                prefix: 'recipes',
                                appDefinitionId: 'dataBinding',
                                config: {}
                            }
                        }
                    });
                    var expectedConfigMap = {configMap: {1: {prefix: 'recipes', appId: -1, config: {}}}};

                    this.firstSave(lastSnapshot, currentSnapshot, resolve, reject);

                    var dataToSave = ajaxSpy.calls.mostRecent().args[0].data;
                    expect(dataToSave.routers).toEqual(expectedConfigMap);
                });

                it('Should have undefined routers object, if there current routers are undeined', function () {
                    this.firstSave(lastSnapshot, currentSnapshot, resolve, reject);

                    var dataToSave = ajaxSpy.calls.mostRecent().args[0].data;
                    expect(dataToSave.routers).toBeUndefined();
                });

                it('Should have the current protectedPagesData', function () {
                    currentSnapshot.rendererModel.pageToHashedPassword = {pageId: 'new password'};
                    this.firstSave(lastSnapshot, currentSnapshot, resolve, reject);

                    var dataToSave = ajaxSpy.calls.mostRecent().args[0].data;
                    expect(dataToSave.protectedPagesData).toEqual(currentSnapshot.rendererModel.pageToHashedPassword);
                });

                it('Should have the current wixCodeAppDatas', function () {
                    this.firstSave(lastSnapshot, currentSnapshot, resolve, reject);

                    var dataToSave = ajaxSpy.calls.mostRecent().args[0].data;
                    expect(dataToSave.wixCodeAppData).toEqual({
                        codeAppId: currentSnapshot.rendererModel.wixCodeModel.appData.codeAppId,
                        signedAppRenderInfo: currentSnapshot.rendererModel.wixCodeModel.signedAppRenderInfo
                    });
                });

                it('Should not contain wixCodeAppData if it is not present in the data model', function () {
                    currentSnapshot.rendererModel.wixCodeModel = undefined;
                    this.firstSave(lastSnapshot, currentSnapshot, resolve, reject);

                    var dataToSave = ajaxSpy.calls.mostRecent().args[0].data;
                    expect(dataToSave.wixCodeAppData).toBeUndefined();
                });

                it('Should have the current metaSiteData', function () {
                    this.firstSave(lastSnapshot, currentSnapshot, resolve, reject);

                    var expectedMetaSiteData = _.merge({adaptiveMobileOn: true}, currentSnapshot.documentServicesModel.metaSiteData);
                    var dataToSave = ajaxSpy.calls.mostRecent().args[0].data;
                    expect(dataToSave.metaSiteData).toEqual(expectedMetaSiteData);
                });

                it('Should have the adaptiveMobileOn in the metaSiteData for the dataToSave, even though it is in the siteMetaData in the models (this is due to the old client unfortunately)', function () {
                    this.firstSave(lastSnapshot, currentSnapshot, resolve, reject);

                    var dataToSave = ajaxSpy.calls.mostRecent().args[0].data;
                    expect(typeof dataToSave.metaSiteData.adaptiveMobileOn).toBe('boolean');
                    expect(typeof dataToSave.siteMetaData.adaptiveMobileOn).toBe('undefined');
                });

                it('Should have the siteId in the sourceSiteId property', function () {
                    this.firstSave(lastSnapshot, currentSnapshot, resolve, reject);

                    var dataToSave = ajaxSpy.calls.mostRecent().args[0].data;
                    expect(dataToSave.sourceSiteId).toEqual(currentSnapshot.rendererModel.siteInfo.siteId);
                });

                it('Should have the site name in the targetName property', function () {
                    this.firstSave(lastSnapshot, currentSnapshot, resolve, reject);

                    var dataToSave = ajaxSpy.calls.mostRecent().args[0].data;
                    expect(dataToSave.targetName).toEqual(currentSnapshot.documentServicesModel.siteName);
                });

                it('should send behaviors_data map as part of the payload', function () {
                    var siteData = testUtils.mockFactory.mockSiteData();
                    var newSnapshot = createSnapshot(siteData.pagesData);

                    this.firstSave(lastSnapshot, newSnapshot, resolve, reject);

                    var dataToSave = ajaxSpy.calls.mostRecent().args[0].data;
                    expect(_.get(dataToSave, 'behaviors')).toEqual({});
                });

                it('should send connections as part of the payload if connectionsData experiment is open', function () {
                    testUtils.experimentHelper.openExperiments('connectionsData');
                    var siteData = testUtils.mockFactory.mockSiteData();
                    var newSnapshot = createSnapshot(siteData.pagesData);

                    this.firstSave(lastSnapshot, newSnapshot, resolve, reject);

                    var dataToSave = ajaxSpy.calls.mostRecent().args[0].data;
                    expect(_.get(dataToSave, 'connections')).toEqual({});
                });

                it('should not send connections as part of the payload if connectionsData experiment is closed', function () {
                    var siteData = testUtils.mockFactory.mockSiteData();
                    var newSnapshot = createSnapshot(siteData.pagesData);

                    this.firstSave(lastSnapshot, newSnapshot, resolve, reject);

                    var dataToSave = ajaxSpy.calls.mostRecent().args[0].data;
                    expect(_.get(dataToSave, 'connections')).toBeUndefined();
                });

            });

        });

        describe('publish', function () {

            it('Should call the publish end point with expected data', function () {
                var siteId = currentSnapshot.rendererModel.siteInfo.siteId;
                var metaSiteId = currentSnapshot.rendererModel.metaSiteId;
                var editorSessionId = currentSnapshot.documentServicesModel.editorSessionId;

                this.publish(lastSnapshot, resolve, reject);

                var actualPublishUrl = ajaxSpy.calls.mostRecent().args[0].url;
                var expectedPublishUrl = currentSnapshot.serviceTopology.editorServerRoot + '/api/publish/' + siteId + '?' + ('editorSessionId=' + editorSessionId) + '&' + ('metaSiteId=' + metaSiteId);
                expect(actualPublishUrl).toEqual(expectedPublishUrl);
            });

            it('should add the X-Wix-Editor-Version header', function () {
                this.publish(currentSnapshot, resolve, reject);
                var headers = ajaxSpy.calls.mostRecent().args[0].headers;
                expect(headers).toContain({'X-Wix-Editor-Version': 'new'});
            });

            it('should call puslish hook', function () {
                var hooksSpy = spyOn(hooks, 'executeHook');
                this.publish(currentSnapshot, resolve, reject);
                expect(hooksSpy.calls.mostRecent().args[0]).toBe(hooks.HOOKS.PUBLISH.BEFORE);
            });


            describe('When task succeeds', function () {
                it('Should update to the version & revision from the server + isPublished should be set to TRUE', function () {
                    //note that server only sends us updated version, but we would also need to update revision if server updated it
                    var publishSuccessResponse = {
                        success: true,
                        payload: {version: 2, revision: 2}
                    };
                    fakeAjaxSuccess(publishSuccessResponse);
                    this.publish(currentSnapshot, resolve, reject);
                    expect(resolve).toHaveBeenCalled();
                    var resolveArg = resolve.calls.mostRecent().args[0];
                    expect(resolveArg).toEqual({
                        'documentServicesModel.revision': publishSuccessResponse.payload.revision,
                        'documentServicesModel.version': publishSuccessResponse.payload.version,
                        'documentServicesModel.isPublished': true
                    });
                });

            });

            describe('When task fails', function () {

                it('Should call reject() callback', function () {
                    fakeAjaxError({});
                    this.publish(currentSnapshot, resolve, reject);
                    expect(reject).toHaveBeenCalled();
                });

            });

        });

        describe('autosave', function () {

            it('should not call the autosave endpoint if there are no changes', function () {
                this.autosave(lastSnapshot, currentSnapshot, resolve, reject);
                expect(ajaxSpy).not.toHaveBeenCalled();
            });

            describe('when data was changed', function () {
                beforeEach(function () {
                    _.merge(currentSnapshot.pagesData.currentPage.data.document_data, {
                        newDataItem: {id: 'dataItem-new'}
                    });

                    _.merge(currentSnapshot.rendererModel.siteMetaData, {
                        adaptiveMobileOn: false
                    });
                });

                it('should call the autosave endpoint with expected data', function () {
                    this.autosave(lastSnapshot, currentSnapshot, resolve, reject);
                    var ajaxOptions = ajaxSpy.calls.mostRecent().args[0];
                    var expectedAutosaveUrl = 'http://editor.' + currentSnapshot.serviceTopology.baseDomain + '/html/autosave/save_diff';
                    expect(ajaxOptions.url).toBe(expectedAutosaveUrl);
                    var ajaxData = ajaxOptions.data;
                    expect(ajaxData.siteId).toBe(currentSnapshot.rendererModel.siteInfo.siteId);
                    expect(ajaxData.metaSiteId).toBe(currentSnapshot.rendererModel.metaSiteId);
                    expect(ajaxData.siteVersion).toBe(currentSnapshot.documentServicesModel.version);
                    expect(ajaxData.diffPayload).toEqual(JSON.stringify(immutableDiff(wixImmutable.fromJS(lastSnapshot), wixImmutable.fromJS(currentSnapshot)).toJS()));
                });

                it('should call the resolve() callback with expected result object if the task succeeds', function () {
                    fakeAjaxSuccess({
                        success: true,
                        payload: {diffId: 7}
                    });
                    this.autosave(lastSnapshot, currentSnapshot, resolve, reject);
                    expect(resolve.calls.mostRecent().args[0]).toEqual({
                        'documentServicesModel.autoSaveInfo.previousDiffId': 7
                    });
                });
                it('should call the reject() callback if ajax succeeds but task fails', function () {
                    var saveErrorResponse = {
                        success: false,
                        errorCode: 1020,
                        errorDescription: 'desc'
                    };
                    fakeAjaxSuccess(saveErrorResponse);
                    this.autosave(lastSnapshot, currentSnapshot, resolve, reject);
                    expect(reject).toHaveBeenCalled();
                    expect(reject.calls.mostRecent().args[0]).toEqual({
                        errorCode: saveErrorResponse.errorCode,
                        errorDescription: saveErrorResponse.errorDescription,
                        errorType: errors.save.UNKNOWN_SERVER_ERROR
                    });
                });
                it('should call reject() with reject object when ajax fails', function () {
                    var ajaxErrorResponse = {
                        status: 500,
                        statusText: 'Save failed'
                    };
                    fakeAjaxError(ajaxErrorResponse);
                    this.autosave(lastSnapshot, currentSnapshot, resolve, reject);
                    expect(reject.calls.mostRecent().args[0]).toEqual({
                        errorCode: ajaxErrorResponse.status,
                        errorDescription: ajaxErrorResponse.statusText,
                        errorType: errors.save.HTTP_REQUEST_ERROR
                    });
                });
            });

            describe('when irrelevant data was changed', function () {
                it('should not call the autosave endpoint for irrelevant changes', function () {
                    _.merge(currentSnapshot.rendererModel.clientSpecMap, {1337: {key: 'value'}});
                    this.autosave(lastSnapshot, currentSnapshot, resolve, reject);
                    expect(ajaxSpy).not.toHaveBeenCalled();
                });
            });
        });
    });
});
