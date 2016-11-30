angular.module('VideoSearchApp')
	.service('youtubeSearchService', ['$q', '$http', function youtubeSearchService($q, $http) {

		var API_KEY = 'AIzaSyC-ng5IjTpBKjvltNqCt8kSXwhgDKARGww';
		var domain = 'https://www.googleapis.com/youtube/v3/search';
		var itemsPerPage = '24';
		var baseUrl = domain + '?part=snippet&q={{searchTerm}}&key=' + API_KEY + '&type=video&maxResults=' + itemsPerPage + '&pageToken={{pageToken}}' + '&callback=JSON_CALLBACK';


		var search = function searchYoutube(searchTerm, pageToken, indexOffset) {
			var deferred = $q.defer();

			pageToken = pageToken || '';

			indexOffset = indexOffset || 0;

			var url = baseUrl
							.replace('{{searchTerm}}', encodeURIComponent(searchTerm))
							.replace('{{pageToken}}', encodeURIComponent(pageToken));

			var transformResponseFunc = function (data) {
				var result = {};

				result.videos = [];

//				try {
//					data = JSON.parse(data);
//				} catch (e) {
//					return result;
//				}

				if (!data || !data.items || !data.items.length) {
					return result;
				}

				angular.forEach(data.items, function (value, index) {
					result.videos.push({
						index: indexOffset + index,
						videoId: value.id.videoId,
						title: value.snippet.title || '',
						description: value.snippet.description || '',
						thumbnail: value.snippet.thumbnails.medium.url || null
					});
				});

				result.totalResults = data.pageInfo.totalResults;
				result.nextPageToken = data.nextPageToken;

				return result;
			};

			doRequest(url, transformResponseFunc, deferred);

			return deferred.promise;
		};


		function doRequest(url, transformResponseFunc, deferred) {
			$http.jsonp(url, { transformResponse: transformResponseFunc }).
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
