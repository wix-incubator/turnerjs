//Helper function
window.getQueryString = function () {
	var result = {}, re = /([^&=]+)=([^&]*)/g, m, queryString = location.search.substring(1);
	while (m = re.exec(queryString)) {
		result[decodeURIComponent(m[1])] = decodeURIComponent(m[2]);
	}
	return result;
};

window.VideoSearch = {
	queryParams: window.getQueryString()
};

(function parseTabsConfig() {
	var queryParams = window.VideoSearch.queryParams;
	var config = {};

	config.tabs = ['youtube', 'vimeo'];

	config.defaultTab = config.tabs[0];

	config.id = queryParams.id;

	window.VideoSearch.config = config;  // Save it to be used by the main controller
})();

angular.module('VideoSearchApp', ['translation'])
	.config(function ($routeProvider, $httpProvider) {
		$routeProvider
			.when('/vimeo', {
				templateUrl: 'views/vimeo.html'
			})
			.when('/youtube', {
				templateUrl: 'views/youtube.html'
			})
			.otherwise({
				redirectTo: '/' + window.VideoSearch.config.defaultTab
			});

		//Enable CORS requests
		$httpProvider.defaults.useXDomain = true;
		delete $httpProvider.defaults.headers.common['X-Requested-With'];

	})

	.run(function($rootScope, translationService){

		window.addEventListener('message', handleMessageFromEditor, false);

		function handleMessageFromEditor(e){
			var msgData;

			try { // error handling for good JSON
				msgData = JSON.parse(e.data);
			} catch (ee) {
				return;
			}

			if(msgData.translations){
				$rootScope.$apply(function(){
					translationService.setTranslation(msgData.translations);
				});
			}



		}
	})

	.run(function ($route, $http, $templateCache, $rootScope) {
		var queryParams = window.VideoSearch.queryParams;

		(function fetchFonts() {
			var ss = document.createElement("link");
			ss.type = "text/css";
			ss.rel = "stylesheet";
			ss.href = decodeURIComponent(queryParams['fontFaceUrl']);
			document.getElementsByTagName("head")[0].appendChild(ss);
		})();

		angular.forEach($route.routes, function (r) {
			if (r.templateUrl) {
				$http.get(r.templateUrl, {cache: $templateCache});
			}
		});

		$rootScope.safeApply = function safeApply(scope, fn) {
			(scope.$$phase || scope.$root.$$phase) ? fn() : scope.$apply(fn);
		};
	});


//Filter for changing translation keys (for artists only mode)
angular.module('VideoSearchApp').
	filter('artistsOnly', function () {
		return function (textKeyObj) {
			var suffix = (textKeyObj.isArtistsOnly) ? 'ArtistsOnly' : '';
			return  (textKeyObj.textKey + suffix);
		};
	});


