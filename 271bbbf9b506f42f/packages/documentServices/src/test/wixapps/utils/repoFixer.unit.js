define([
	'lodash',
	'testUtils',
	'documentServices/mockPrivateServices/privateServicesHelper',
	'documentServices/wixapps/services/appBuilder',
	'documentServices/wixapps/utils/repoFixer'
], function (_, testUtils, privateServicesHelper, appBuilder, repoFixer) {
	'use strict';

	describe('appbuilder repo fixer', function () {

		function addAppPart2(siteData, partName) {
			if (!_.has(siteData.pagesData, 'page1')) {
				siteData.addPageWithDefaults('page1');
			}

			var appPartData = siteData.mock.appPartData({
				appPartName: partName,
				viewName: _.get(siteData, ['wixapps', 'appbuilder', 'descriptor', 'parts', partName, 'viewName'], _.uniqueId('viewName-'))
			});

			testUtils.mockFactory.mockComponent(
				'wixapps.integration.components.AppPart2',
				siteData,
				'page1',
				{data: appPartData}
			);
		}

		describe('cleanRepoViews (success)', function () {
			beforeEach(function () {
				spyOn(appBuilder, 'save').and.callFake(function (ps, onSuccess) {
					onSuccess();
				});
			});

			it('should not break if components has no partDefinition in the repo', function (done) {
				var siteData = testUtils.mockFactory.mockSiteData();
				siteData.addFullWixappsDataForPart('otherTestPart');
				addAppPart2(siteData, 'testPart');

				var ps = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);
				repoFixer.cleanRepoViews(ps, function () {
					done();
				});
			});

			it('should call onSuccess without saving when there are no changes', function (done) {
				var siteData = testUtils.mockFactory.mockSiteData();
				var partName = 'testPart';
				siteData.addFullWixappsDataForPart(partName);
				addAppPart2(siteData, partName);

				var ps = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);
				repoFixer.cleanRepoViews(ps, function () {
					expect(appBuilder.save).not.toHaveBeenCalled();
					done();
				});
			});

			it('should not remove active component views', function (done) {
				var siteData = testUtils.mockFactory.mockSiteData();
				var partName = 'testPart';
				siteData.addFullWixappsDataForPart(partName);
				addAppPart2(siteData, partName);

				var ps = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);
				var expected = ps.dal.full.getByPath(['wixapps', 'appbuilder', 'descriptor']);

				repoFixer.cleanRepoViews(ps, function () {
					var actual = ps.dal.full.getByPath(['wixapps', 'appbuilder', 'descriptor']);
					expect(actual).toEqual(expected);
					done();
				});
			});

			it('should remove views from non existed components', function (done) {
				var siteData = testUtils.mockFactory.mockSiteData();
				var partName = 'testPart';
				siteData.addFullWixappsDataForPart(partName);

				var ps = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);
				var expected = _.defaults({views: {}}, ps.dal.full.getByPath(['wixapps', 'appbuilder', 'descriptor']));

				repoFixer.cleanRepoViews(ps, function () {
					var actual = ps.dal.full.getByPath(['wixapps', 'appbuilder', 'descriptor']);
					expect(actual).toEqual(expected);
					done();
				});
			});

			it('should keep existing parts views and remove non existing components data (single)', function (done) {
				var siteData = testUtils.mockFactory.mockSiteData();
				var partName = 'testPart';
				siteData.addFullWixappsDataForPart(partName);
				addAppPart2(siteData, partName);
				var expectedViews = _.cloneDeep(siteData.wixapps.appbuilder.descriptor.views);
				siteData.addFullWixappsDataForPart('otherPartName');

				var ps = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);
				var expected = _.defaults({views: expectedViews}, ps.dal.full.getByPath(['wixapps', 'appbuilder', 'descriptor']));

				repoFixer.cleanRepoViews(ps, function () {
					var actual = ps.dal.full.getByPath(['wixapps', 'appbuilder', 'descriptor']);
					expect(actual).toEqual(expected);
					done();
				});
			});

			it('should keep existing parts views and remove non existing components data (multiple)', function (done) {
				var siteData = testUtils.mockFactory.mockSiteData();
				siteData.addFullWixappsDataForPart('testPart');
				addAppPart2(siteData, 'testPart');
				siteData.addFullWixappsDataForPart('testPart2');
				addAppPart2(siteData, 'testPart2');
				var expectedViews = _.cloneDeep(siteData.wixapps.appbuilder.descriptor.views);

				siteData.addFullWixappsDataForPart('otherPartName');

				var ps = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);
				var expected = _.defaults({views: expectedViews}, ps.dal.full.getByPath(['wixapps', 'appbuilder', 'descriptor']));

				repoFixer.cleanRepoViews(ps, function () {
					var actual = ps.dal.full.getByPath(['wixapps', 'appbuilder', 'descriptor']);
					expect(actual).toEqual(expected);
					done();
				});
			});

			it('should remove views from non existed (multiple) components', function (done) {
				var siteData = testUtils.mockFactory.mockSiteData();
				siteData.addFullWixappsDataForPart('testPart');
				siteData.addFullWixappsDataForPart('testPart2');
				siteData.addFullWixappsDataForPart('testPart3');

				var ps = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);
				var expected = _.defaults({views: {}}, ps.dal.full.getByPath(['wixapps', 'appbuilder', 'descriptor']));

				repoFixer.cleanRepoViews(ps, function () {
					var actual = ps.dal.full.getByPath(['wixapps', 'appbuilder', 'descriptor']);
					expect(actual).toEqual(expected);
					done();
				});
			});
		});

		describe('cleanRepoViews (fail)', function () {
			it('should call onError when save fail after removing the views from the repo', function (done) {
				spyOn(appBuilder, 'save').and.callFake(function (ps, onSuccess, onError) {
					onError();
				});

				var siteData = testUtils.mockFactory.mockSiteData();
				var partName = 'testPart';
				siteData.addFullWixappsDataForPart(partName);

				var ps = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);
				var expected = _.defaults({views: {}}, ps.dal.full.getByPath(['wixapps', 'appbuilder', 'descriptor']));

				repoFixer.cleanRepoViews(ps, _.noop, function () {
					var actual = ps.dal.full.getByPath(['wixapps', 'appbuilder', 'descriptor']);
					expect(actual).toEqual(expected);
					done();
				});

			});
		});
	});
});