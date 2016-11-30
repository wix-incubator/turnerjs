define([
        'lodash',
        'testUtils',
        'documentServices/saveAPI/saveAPI',
        'documentServices/saveAPI/lib/saveRunner',
        'documentServices/saveAPI/lib/registry',
        'documentServices/saveAPI/preSaveOperations/preSaveOperations',
        'documentServices/mockPrivateServices/privateServicesHelper',
        'documentServices/bi/bi',
        'documentServices/bi/errors',
        'documentServices/errors/errors',
        'documentServices/constants/constants',
        'documentServices/mobileConversion/mobileConversionFacade',
        'documentServices/siteMetadata/generalInfo',
        'utils'
    ],
    function (_, testUtils, saveAPI, saveRunner, registry, preSaveOperations, privateServicesHelper, bi, biErrors, documentServicesErrors, constants, mobileConversionFacade, generalInfo, utils) {
        'use strict';

        var privateServices;
        var onSuccess, onError;

        function setSiteFirstSave(isFirstSave) {
            var neverSavedPointer = privateServices.pointers.general.getNeverSaved();
            privateServices.dal.set(neverSavedPointer, isFirstSave);
        }

        function createPrivateServicesWithUserId(userId) {
            var siteData = testUtils.mockFactory.mockSiteData()
                .addPageWithDefaults('page1', [{
                    id: 'comp1',
                    dataQuery: 'data1',
                    propertyQuery: 'prop1',
                    componentType: 'type1'
                }])
                .addPageWithDefaults('page2', [{
                    id: 'comp2',
                    dataQuery: 'data2',
                    propertyQuery: 'prop2',
                    componentType: 'type2'
                }])
                .addData({id: 'data1', metaData: {isPreset: false}}, 'page1')
                .addData({id: 'data2', metaData: {isPreset: false}}, 'page2')
                .addData({id: 'dataInMasterPage', metaData: {isPreset: false}}, 'masterPage')
                .setUserId(userId);

            privateServices = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData, {
                siteData: [
                    {
                        path: ['urlFormatModel'],
                        optional: true
                    }]
            });
        }

        function mockPrivateServices(rendererModel, dsModel) {
            var siteModel = testUtils.mockFactory.mockSiteModel({
                documentServicesModel: dsModel || {},
                rendererModel: rendererModel || {}
            });
            var siteData = testUtils.mockFactory.mockSiteData(siteModel, true);
            return privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);
        }

        function getSiteDataItems() {
            var pageIds = privateServices.dal.getKeysByPath(['pagesData']);
            var pointersHelper = privateServices.pointers.page;
            return _(pageIds)
                .map(pointersHelper.getPageData, pointersHelper)
                .map(privateServices.dal.get, privateServices.dal)
                .reduce(function (res, pageDataItems) {
                    var itemsWithMetaData = _.pick(pageDataItems, function (dataItem) {
                        return dataItem.metaData;
                    });
                    return _.assign(res, itemsWithMetaData);
                }, {});
        }

        describe("saveAPI", function () {
            beforeEach(function () {
                spyOn(utils.log, 'error'); //no logging console.error during these test, save normally does log to console.error on failure
                onSuccess = jasmine.createSpy('onSuccess');
                onError = jasmine.createSpy('onError');

                privateServices = privateServicesHelper.mockPrivateServicesWithRealDAL();
                setSiteFirstSave(false);
                this.spyOnRunner = function(){
                    _.forOwn(saveRunner, function(method, methodName){
                        spyOn(saveRunner, methodName);
                    });
                };

                spyOn(mobileConversionFacade, 'convertMobileStructure');
            });

            describe('On boarding migration', function () {

                function createPrivateServicesWithOnBoardingSpec(inUse) {
                    var siteModel = testUtils.mockFactory.mockSiteModel({
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
                            publicUrl: 'http://sharag.wix.com/icopiedthisfromshragastest',
                            usedMetaSiteNames: ['A', 'B']
                        }
                    });
                    var siteData = testUtils.mockFactory.mockSiteData(siteModel)
                        .updateClientSpecMap(testUtils.mockFactory.clientSpecMapMocks.onboarding({inUse: inUse}));

                    return privateServicesHelper.mockPrivateServicesWithRealDAL(siteData, {
                        siteData: [{
                            path: ['urlFormatModel'],
                            optional: true
                        }]
                    });
                }

                beforeEach(function () {
                    testUtils.experimentHelper.openExperiments('sv_obMigrationFlow');
                });

                it('should migrate if site is using onboarding and dsOrigin is santa editor', function () {
                    var ps = createPrivateServicesWithOnBoardingSpec(true);
                    ps.config.origin = 'Editor1.4';

                    expect(generalInfo.isSiteFromOnBoarding(ps)).toBe(true);

                    saveAPI.save(ps, onSuccess, onError);

                    expect(generalInfo.isSiteFromOnBoarding(ps)).toBe(false);

                });

                it('should not migrate if site is using onboarding and dsOrigin is not santa editor', function () {
                    var ps = createPrivateServicesWithOnBoardingSpec(true);
                    ps.config.origin = 'otherOrigin';

                    saveAPI.save(ps, onSuccess, onError);

                    expect(generalInfo.isSiteFromOnBoarding(ps)).toBe(true);
                });

                it('should not change migration if site already migrated', function () {
                    var ps = createPrivateServicesWithOnBoardingSpec(true);
                    ps.config.origin = 'Editor1.4';
                    generalInfo.setUseOnBoarding(ps, false);
                    spyOn(generalInfo, 'setUseOnBoarding');

                    saveAPI.save(ps, onSuccess, onError);

                    expect(generalInfo.setUseOnBoarding).not.toHaveBeenCalled();
                });

                it('should not migrate if site is not from OB', function () {
                    var ps = createPrivateServicesWithOnBoardingSpec(false);
                    ps.config.origin = 'Editor1.4';

                    spyOn(generalInfo, 'setUseOnBoarding');

                    saveAPI.save(ps, onSuccess, onError);

                    expect(generalInfo.setUseOnBoarding).not.toHaveBeenCalled();
                });

                it('should not migrate if experiment is off', function () {
                    testUtils.experimentHelper.closeExperiments('sv_obMigrationFlow');

                    var ps = createPrivateServicesWithOnBoardingSpec(true);
                    ps.config.origin = 'Editor1.4';

                    spyOn(generalInfo, 'setUseOnBoarding');

                    saveAPI.save(ps, onSuccess, onError);

                    expect(generalInfo.setUseOnBoarding).not.toHaveBeenCalled();
                });
            });

            describe("save()", function () {
                it("should be defined", function () {
                    expect(saveAPI.save).toBeDefined();
                });
                it("should receive 4 arguments: DAL, onSuccess, onError, isFullSave", function () {
                    expect(saveAPI.save.length).toBe(4);
                });
                it("should run the first save if the site was never saved before", function () {
                    this.spyOnRunner();
                    setSiteFirstSave(true);
                    saveAPI.save(privateServices, onSuccess, onError);
                    expect(saveRunner.runFirstSaveTasks).toHaveBeenCalled();
                });
                it("should run the full save if the isFullSave parameter was given", function () {
                    this.spyOnRunner();
                    saveAPI.save(privateServices, onSuccess, onError, true);
                    expect(saveRunner.runFullSaveTasks).toHaveBeenCalled();
                });
                it("should run a partial save normally", function () {
                    this.spyOnRunner();
                    saveAPI.save(privateServices, onSuccess, onError);

                    expect(saveRunner.runPartialSaveTasks).toHaveBeenCalled();
                });
                describe('when running a partial save and failing several times', function () {
                    beforeEach(function () {
                        var timesToSave = 0;
                        var afterSaveCB;

                        function runSave() {
                            if (timesToSave > 0) {
                                timesToSave--;
                                saveAPI.save(privateServices, runSave, runSave);
                            } else {
                                afterSaveCB();
                            }
                        }

                        spyOn(registry, 'getSaveTasksConfig').and.callFake(function(){
                            return this.taskRegistry;
                        }.bind(this));
                        this.saveXtimes = function (x, callback) {
                            timesToSave = x;
                            afterSaveCB = callback;
                            runSave();
                        };

                        var serverValidationErrorCode = -10104;
                        this.errorObject = {
                            errorCode: serverValidationErrorCode,
                            errorType: documentServicesErrors.save.DATA_REFERENCE_MISMATCH,
                            errorDescription: 'mock error in test'
                        };
                        spyOn(saveRunner, 'runPartialSaveTasks').and.callThrough();
                        testUtils.experimentHelper.openExperiments('block_after_third_invalid_save');

                    });
                    describe('and the failure was due to an invalidation error in the document task', function () {
                        it('if it failed twice in a row, it should allow you to save again', function (done) {
                            this.taskRegistry = new testUtils.MockTaskRegistryBuilder()
                                .setPrimaryTask({
                                    fail: true,
                                    error: this.errorObject
                                })
                                .build();

                            this.saveXtimes(3, function () {
                                expect(saveRunner.runPartialSaveTasks).toHaveBeenCalledTimes(3);
                                done();
                            });
                        });
                        it('if it failed 3 times in a row, it should block further saves', function (done) {
                            this.taskRegistry = new testUtils.MockTaskRegistryBuilder()
                                .setPrimaryTask({
                                    fail: true,
                                    error: this.errorObject
                                })
                                .build();

                            function saveShouldHaveBeenBlockedSoThisShouldntHappen(){
                                expect('this save passed and onSuccess was called').toBe('and it should have been blocked and rejected');
                            }

                            this.saveXtimes(4, function () {
                                expect(saveRunner.runPartialSaveTasks).toHaveBeenCalledTimes(3);
                                saveAPI.save(privateServices, saveShouldHaveBeenBlockedSoThisShouldntHappen, function(err){
                                    expect(err.documentServices.errorType).toBe(documentServicesErrors.save.SAVE_BLOCKED_BY_DOCUMENT_SERVICES);
                                    done();
                                });
                            });
                        });
                        it('if it failed twice and then succeeded, it should allow you up to 3 failures', function (done) {
                            this.taskRegistry = new testUtils.MockTaskRegistryBuilder()
                                .setPrimaryTask([
                                    {
                                        fail: true,
                                        error: this.errorObject
                                    },
                                    {
                                        fail: true,
                                        error: this.errorObject
                                    },
                                    {
                                        fail: false
                                    },
                                    {
                                        fail: true,
                                        error: this.errorObject
                                    },
                                    {
                                        fail: true,
                                        error: this.errorObject
                                    },
                                    {
                                        fail: true,
                                        error: this.errorObject
                                    },
                                    {
                                        fail: true, //4th failure after passing
                                        error: this.errorObject
                                    }
                                ])
                                .build();

                            this.saveXtimes(7, function () {
                                expect(saveRunner.runPartialSaveTasks).toHaveBeenCalledTimes(6);
                                done();
                            });
                        });
                    });
                    describe('and the failure was due to some other error', function(){
                        it('should not block after 3 failures', function(done){
                            this.errorObject.errorCode = 123;
                            this.errorObject.errorType = 'some other type';
                            this.taskRegistry = new testUtils.MockTaskRegistryBuilder()
                                .setPrimaryTask({
                                    fail: true,
                                    error: this.errorObject
                                })
                                .build();
                            this.saveXtimes(4, function(){
                                expect(saveRunner.runPartialSaveTasks).toHaveBeenCalledTimes(4);
                                done();
                            });
                        });
                    });
                });
                it("should run the mobile conversion/merge algorithm before the save", function () {
                    saveAPI.save(privateServices, onSuccess, onError);
                    expect(mobileConversionFacade.convertMobileStructure).toHaveBeenCalled();
                });
                it('should call the onError callback if a pre-save operation fails', function () {
                    var err = 'some error';
                    spyOn(preSaveOperations, 'save').and.throwError(err);
                    saveAPI.save(privateServices, onSuccess, onError);
                    expect(onError).toHaveBeenCalledWith({
                        preSaveOperation: new Error(err)
                    });
                });
            });

            describe("publish()", function () {
                it("should be defined", function () {
                    expect(saveAPI.publish).toBeDefined();
                });
                it("should receive 3 arguments: documentServices, onSuccess, onError", function () {
                    expect(saveAPI.publish.length).toBe(3);
                });
            });

            describe('saveAsTemplate', function () {
                describe('allowed user', function () {
                    beforeEach(function () {
                        var allowedUserId = '84770f67-ecbd-44b6-b35a-584f2dc15af1';
                        createPrivateServicesWithUserId(allowedUserId);
                    });
                    it('should change all data items isPreset value to true', function () {
                        saveAPI.saveAsTemplate(privateServices, onSuccess, onError);

                        var dataItems = getSiteDataItems();
                        var itemsWithFalsyIsPreset = _.find(dataItems, function (dataItem) {
                            return dataItem.metaData && !dataItem.metaData.isPreset;
                        });
                        expect(itemsWithFalsyIsPreset).toBeUndefined();
                    });
                    it('should call save', function () {
                        spyOn(saveAPI, 'save');

                        saveAPI.saveAsTemplate(privateServices, onSuccess, onError);

                        expect(saveAPI.save).toHaveBeenCalled();
                    });
                    describe('When pre save operation fail', function () {
                        it('should call the onError callback and not continue to save', function () {
                            var error = 'some error';
                            spyOn(preSaveOperations, 'saveAsTemplate').and.throwError(error);
                            spyOn(saveAPI, 'save');

                            saveAPI.saveAsTemplate(privateServices, onSuccess, onError);

                            expect(onError).toHaveBeenCalledWith({preSaveAsTemplateOperation: new Error(error)});
                            expect(saveAPI.save).not.toHaveBeenCalled();
                        });
                    });
                });
            });

            describe('canUserPublish', function () {
                it('should return true if user is site owner', function () {
                    var ps = mockPrivateServices({}, {
                        permissionsInfo: {
                            isOwner: true,
                            permissions: []
                        }
                    });
                    spyOn(generalInfo, 'isFirstSave').and.returnValue(false);

                    expect(saveAPI.canUserPublish(ps)).toBe(true);
                });

                it('should return true if site was never saved', function () {
                    var ps = mockPrivateServices({}, {
                        permissionsInfo: {
                            isOwner: false,
                            permissions: []
                        }
                    });
                    spyOn(generalInfo, 'isFirstSave').and.returnValue(true);

                    expect(saveAPI.canUserPublish(ps)).toBe(true);
                });

                it('should return true if user has permission for it when not owner and not first save', function () {
                    var ps = mockPrivateServices({}, {
                        permissionsInfo: {
                            isOwner: false,
                            permissions: [constants.PERMISSIONS.PUBLISH]
                        }
                    });
                    spyOn(generalInfo, 'isFirstSave').and.returnValue(false);

                    expect(saveAPI.canUserPublish(ps)).toBe(true);
                });

                it('should false if user has no permission for it when not owner and not first save', function () {
                    var ps = mockPrivateServices({}, {
                        permissionsInfo: {
                            isOwner: false,
                            permissions: [constants.PERMISSIONS.SAVE]
                        }
                    });
                    spyOn(generalInfo, 'isFirstSave').and.returnValue(false);

                    expect(saveAPI.canUserPublish(ps)).toBe(false);
                });
            });

            describe("autosave()", function () {
                it("should be defined", function () {
                    expect(saveAPI.autosave).toBeDefined();
                });

                it("should run the autosave task", function () {
                    this.spyOnRunner();

                    saveAPI.autosave(privateServices, onSuccess, onError);

                    expect(saveRunner.runAutosaveTasks).toHaveBeenCalled();
                    var passedRegistry = saveRunner.runAutosaveTasks.calls.mostRecent().args[0];
                    expect(passedRegistry.primaryTask).toBeTruthy();
                });
            });
        });
    });
