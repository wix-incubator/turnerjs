define([
	'lodash',
	'documentServices/component/component',
	'documentServices/componentDetectorAPI/componentDetectorAPI',
	'documentServices/wixapps/utils/pathUtils',
	'documentServices/wixapps/services/appBuilder'
], function (_, component, componentDetectorAPI, pathUtils, appbuilder) {
	'use strict';

	function getAllActivePartNames(ps) {
		var parts = componentDetectorAPI.getAllComponents(ps, null, function (comp) {
			return component.getType(ps, comp) === 'wixapps.integration.components.AppPart2';
		});

		return _.map(parts, function (part) {
			return component.data.get(ps, part).appPartName;
		});
	}

	/**
	 * Removes all views of a non existing components in the site in order to reduce the size of the repo and save it.
	 * @param {PrivateDocumentServices} ps
	 * @param {function()} onSuccess callback that will be called after a successful save or when there were no changes.
	 * @param {function()} onError callback that will be called after a failure save.
	 */
	function cleanRepoViews(ps, onSuccess, onError) {
		var currentRepo = ps.dal.full.getByPath(pathUtils.getRepoPath());

		var usedViews = _(currentRepo.parts)
			.pick(getAllActivePartNames(ps))
			.map('viewName')
			.transform(function (acc, viewName) {
				var views = _.pick(currentRepo.views, function (view) {
					return view.name === viewName;
				});

				return _.assign(acc, views);
			}, {})
			.value();

		if (_.keys(usedViews).length === _.keys(currentRepo.views).length) {
			if (onSuccess) {
				onSuccess();
			}
			return;
		}

		// Replace views and save.
		ps.dal.full.removeByPath(pathUtils.getBaseViewsPath());
		ps.dal.full.setByPath(pathUtils.getBaseViewsPath(), usedViews);

		appbuilder.save(ps, onSuccess, onError);
	}

	return {
		cleanRepoViews: cleanRepoViews
	};
});