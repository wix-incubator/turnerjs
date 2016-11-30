define([
	'lodash',
	'bluebird',
	'documentServices/mockPrivateServices/privateServicesHelper',
	'documentServices/dataAccessLayer/wixImmutable',
	'testUtils',
	'documentServices/wixapps/services/savePublish',
	'documentServices/wixapps/services/serverApi',
	'documentServices/wixapps/utils/appBuilder'
], function (_, Promise, privateServicesHelper, wixImmutable, /** testUtils */testUtils, savePublish, serverApi, appBuilderUtils) {
    'use strict';

    function createDiffObject(created, updated, deleted) {
        return {
            created: created || [],
            updated: updated || [],
            deleted: _.pluck(deleted, '_iid') || []
        };
    }

    function getEmptyDescriptor() {
        return {
            types: [],
            parts: {},
            dataSelectors: [],
            views: []
        };
    }

    describe('Wixapps save and publish Document Services', function () {

        var anItem, fakeBiCallbacks;

        beforeEach(function () {
            anItem = {_iid: 'item1', _type: 'type1', title: 'item1'};
            fakeBiCallbacks = {
                error: jasmine.createSpy('bi.error'),
                event: jasmine.createSpy('bi.event')
            };
        });

	    function getImmutable(siteData) {
		    var DAL = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData).dal;
		    DAL.fullJsonDal.dynamicallyLoadedPaths.push({
			    path: ['siteData', 'wixapps', 'appbuilder'],
			    immutableData: wixImmutable.fromJS(siteData.wixapps.appbuilder)
		    });
		    return DAL.full.immutable.getInitialSnapshot();
	    }

        describe('firstSave', function () {
            it('should not save if no repo and no items', function (done) {
	            var firstSnapshot = getImmutable(testUtils.mockFactory.mockSiteData());
                var currentSnapshot = getImmutable(testUtils.mockFactory.mockSiteData().updateClientSpecMap({type: 'appbuilder', instanceId: '401B67D5-8C57-447E-916E-23C1568E6300'}));

                function resolved() {
                    expect(serverApi.saveRepoAndItems).not.toHaveBeenCalledWith();
                    done();
                }

                var reject = testUtils.jasmineHelper.getFailTestMethod('reject', done);
                spyOn(serverApi, 'saveRepoAndItems').and.returnValue(Promise.resolve({}));

                savePublish.firstSave(firstSnapshot, currentSnapshot, resolved, reject);
            });

            it('should not publish if no repo and no items', function () {
                var currentSnapshot = getImmutable(testUtils.mockFactory.mockSiteData().updateClientSpecMap({type: 'appbuilder', instanceId: '401B67D5-8C57-447E-916E-23C1568E6300'}));

                var resolve = jasmine.createSpy('resolve');
                var reject = testUtils.jasmineHelper.getFailTestMethod('reject', _.noop);
                spyOn(serverApi, 'publish').and.callThrough();

                savePublish.publish(currentSnapshot, resolve, reject);
                expect(serverApi.publish).not.toHaveBeenCalledWith();
            });

            it('should call success with the changes returned from saveRepoAndItems', function (done) {
                var firstSnapshot = getImmutable(testUtils.mockFactory.mockSiteData());
                var currentSnapshot = getImmutable(testUtils.mockFactory.mockSiteData()
                    .updateClientSpecMap({type: 'appbuilder', instanceId: '401B67D5-8C57-447E-916E-23C1568E6300'})
                    .addItem(anItem));

                var changes = {change1: 'newValue'};

                function resolved(actualChanges) {
                    expect(actualChanges).toBe(changes);
                    done();
                }

                var reject = testUtils.jasmineHelper.getFailTestMethod('reject', done);

                spyOn(serverApi, 'saveRepoAndItems').and.returnValue(Promise.resolve(changes));

                savePublish.firstSave(firstSnapshot, currentSnapshot, resolved, reject);
            });

            it('should call the reject callback with the parameter passed from the reject of saveRepoAndItems', function (done) {
                var firstSnapshot = getImmutable(testUtils.mockFactory.mockSiteData());
                var currentSnapshot = getImmutable(testUtils.mockFactory.mockSiteData()
                    .updateClientSpecMap({type: 'appbuilder', instanceId: '401B67D5-8C57-447E-916E-23C1568E6300'})
                    .addItem(anItem));

                var resolved = testUtils.jasmineHelper.getFailTestMethod('resolved', done);

                var result = {errorCode: jasmine.any(Number), errorDescription: jasmine.any(String), changes: null};

                function reject(error) {
                    expect(serverApi.saveRepoAndItems).toHaveBeenCalled();
                    expect(error).toEqual(result);
                    done();
                }

                spyOn(serverApi, 'saveRepoAndItems').and.returnValue(Promise.reject(result));

                savePublish.firstSave(firstSnapshot, currentSnapshot, resolved, reject);
            });

            it('should call reject without even call the saveRepoAndItems if the application instanceId was not changes from the template id', function () {
                var firstSnapshot = getImmutable(testUtils.mockFactory.mockSiteData());
                var currentSnapshot = getImmutable(testUtils.mockFactory.mockSiteData());

                var resolved = testUtils.jasmineHelper.getFailTestMethod('resolved');

                function reject(error) {
                    expect(serverApi.saveRepoAndItems).not.toHaveBeenCalled();
                    expect(error).toEqual({errorCode: 1970, errorDescription: jasmine.any(String), changes: null});
                }

                spyOn(serverApi, 'saveRepoAndItems');

                savePublish.firstSave(firstSnapshot, currentSnapshot, resolved, reject);
            });
        });

        describe('partialSave', function () {
            it('should call saveRepoAndItems with new items in the created items payload', function (done) {

                var previousSnapshot = getImmutable(testUtils.mockFactory.mockSiteData());
                var currentSnapshot = getImmutable(testUtils.mockFactory.mockSiteData().addItem(anItem));

                function resolved() {
                    var applicationInstance = appBuilderUtils.getAppInstance(currentSnapshot);
                    var dataItems = createDiffObject([anItem]);
                    expect(serverApi.saveRepoAndItems).toHaveBeenCalledWith(applicationInstance, null, dataItems, fakeBiCallbacks);
                    done();
                }

                var reject = testUtils.jasmineHelper.getFailTestMethod('reject', done);

                spyOn(serverApi, 'saveRepoAndItems').and.returnValue(Promise.resolve());

                savePublish.partialSave(previousSnapshot, currentSnapshot, resolved, reject, fakeBiCallbacks);
            });

            it('should call saveRepoAndItems with new items in the updated items payload', function (done) {
                var existingItem = {_iid: 'item1', _type: 'type1', title: 'item1', _updatedAt: Date.now()};
                var updatedItem = _.defaults({title: 'new title', _updatedAt: Date.now()}, existingItem);

                var previousSnapshot = getImmutable(testUtils.mockFactory.mockSiteData().addItem(existingItem));
                var currentSnapshot = getImmutable(testUtils.mockFactory.mockSiteData().addItem(updatedItem));

                function resolved() {
                    var applicationInstance = appBuilderUtils.getAppInstance(currentSnapshot);
                    var dataItems = createDiffObject(null, [_.defaults({_timestamp: existingItem._updatedAt}, updatedItem)]);
                    expect(serverApi.saveRepoAndItems).toHaveBeenCalledWith(applicationInstance, null, dataItems, fakeBiCallbacks);
                    done();
                }

                var reject = testUtils.jasmineHelper.getFailTestMethod('reject', done);

                spyOn(serverApi, 'saveRepoAndItems').and.returnValue(Promise.resolve());

                savePublish.partialSave(previousSnapshot, currentSnapshot, resolved, reject, fakeBiCallbacks);
            });

            it('should call saveRepoAndItems with new items in the deleted items payload', function (done) {
                var deletedItem = {_iid: 'item1', _type: 'type1', title: 'item1'};

                var previousSnapshot = getImmutable(testUtils.mockFactory.mockSiteData().addItem(deletedItem));
                var currentSnapshot = getImmutable(testUtils.mockFactory.mockSiteData());

                function resolved() {
                    var applicationInstance = appBuilderUtils.getAppInstance(currentSnapshot);
                    var dataItems = createDiffObject(null, null, [deletedItem]);
                    expect(serverApi.saveRepoAndItems).toHaveBeenCalledWith(applicationInstance, null, dataItems, fakeBiCallbacks);
                    done();
                }

                var reject = testUtils.jasmineHelper.getFailTestMethod('reject', done);

                spyOn(serverApi, 'saveRepoAndItems').and.returnValue(Promise.resolve());

                savePublish.partialSave(previousSnapshot, currentSnapshot, resolved, reject, fakeBiCallbacks);
            });

            it('should call saveRepoAndItems with the updated repo', function (done) {
                var dataSelector = {
                    forType: "tempType",
                    id: "selectorId",
                    itemIds: ["item1"],
                    logicalTypeName: "IB.ManualSelectedList"
                };

                var previousSnapshot = getImmutable(testUtils.mockFactory.mockSiteData().addDataSelector(dataSelector));
                var currentSnapshot = getImmutable(testUtils.mockFactory.mockSiteData());

                function resolved() {
                    var applicationInstance = appBuilderUtils.getAppInstance(currentSnapshot);
                    expect(serverApi.saveRepoAndItems).toHaveBeenCalledWith(applicationInstance, getEmptyDescriptor(), createDiffObject(), fakeBiCallbacks);
                    done();
                }

                var reject = testUtils.jasmineHelper.getFailTestMethod('reject', done);

                spyOn(serverApi, 'saveRepoAndItems').and.returnValue(Promise.resolve());

                savePublish.partialSave(previousSnapshot, currentSnapshot, resolved, reject, fakeBiCallbacks);
            });

            it('should pass no repo and no items when no repo was loaded', function (done) {
                // nothing
                var previousSnapshot = wixImmutable.fromJS({wixapps: {appbuilder: {}}});
                // empty data
                var currentSnapshot = wixImmutable.fromJS({
                    wixapps: {
                        appbuilder: {
                            "descriptor": {
                                "views": {},
                                "types": {},
                                "parts": {},
                                "dataSelectors": {},
                                "pages": {}
                            },
                            "items": {},
                            "deletedItems": {}
                        }
                    }});

                function resolved() {
                    expect(serverApi.saveRepoAndItems).not.toHaveBeenCalledWith();
                    done();
                }

                var reject = testUtils.jasmineHelper.getFailTestMethod('reject', done);
                spyOn(serverApi, 'saveRepoAndItems');

                savePublish.partialSave(previousSnapshot, currentSnapshot, resolved, reject);
            });

        });
    });
});
