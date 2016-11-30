
// NOT WORKING

angular.module('VideoSearchApp')
	.service('vimeoSearchService', ['$q', '$http', function vimeoSearchService($q, $http) {

		// TODO replace to correct one
		var domain  = 'https://vimeo.com/api/rest/v2';
		var itemsPerPage  = '10';
		var baseUrl = domain + '?format=jsonp&method=vimeo.videos.search&query=cat&callback=JSON_CALLBACK' + auth;

//		https://vimeo.com/api/rest/v2?format=json&method=vimeo.videos.search&query=cat


		var search = function searchVimeo(searchTerm) {
			var deferred = $q.defer();

			var url = baseUrl;

			var transformResponseFunc = function (data) {

				var videos = [];

				try {
					data = JSON.parse(data);
				} catch (e) {
					return null;
				}
				if (!data || !data.items || !data.items.length) {
					return null;
				}
//
//				angular.forEach(data.items, function (value, index) {
//					videos.push({
//						index: index,
//						videoId: value.id.videoId,
//						title: value.snippet.title || '',
//						description: value.snippet.description || '',
//						thumbnail: value.snippet.thumbnails.medium.url || null
//					});
//				});

				return videos;
			};

			doRequest(url, transformResponseFunc, deferred);

			return deferred.promise;
		};


		function doRequest(url, transformResponseFunc, deferred) {


			$http({
				method: 'jsonp',
				url: url,
				transformResponse: transformResponseFunc
			}).
				success(function (data) {
					deferred.resolve(data);
				}).
				error(function () {
					deferred.reject(null);
				});
		}

		return {
			search: search
		};
	}]);
