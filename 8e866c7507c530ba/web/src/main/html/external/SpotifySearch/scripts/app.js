//Helper function
window.getQueryString = function() { var result = {}, re = /([^&=]+)=([^&]*)/g, m, queryString = location.search.substring(1); while (m = re.exec(queryString)) { result[decodeURIComponent(m[1])] = decodeURIComponent(m[2]); } return result; };

window.SpotifySearch = {
    queryParams: window.getQueryString()
};

(function parseTabsConfig(){
    var queryParams = window.SpotifySearch.queryParams;
    var config = {};

    //Tabs to show
    try { config.tabs = JSON.parse(queryParams['tabs']); }
    catch(e) { config.tabs = ['tracks', 'albums', 'artists']; }  //Fallback to all tabs

    //Default tab
    var defaultTab = queryParams['default_tab'];
    config.defaultTab = (config.tabs.indexOf(defaultTab) > -1) ? defaultTab : config.tabs[0];  //Fallback to first tab

    window.SpotifySearch.config = config;  //Save it to be used by the main controller
})();

angular.module('SpotifySearchApp', ['pascalprecht.translate'])
    .config(function ($routeProvider, $httpProvider, $translateProvider) {
        $routeProvider
            .when('/albums', {
                templateUrl: 'views/albums.html'
            })
            .when('/tracks', {
                templateUrl: 'views/tracks.html'
            })
            .when('/artists', {
                templateUrl: 'views/artists.html'
            })
            .otherwise({
                redirectTo: '/' + window.SpotifySearch.config.defaultTab
            });

        //Enable CORS requests
        $httpProvider.defaults.useXDomain = true;
        delete $httpProvider.defaults.headers.common['X-Requested-With'];

        //Configure translations
        $translateProvider.useStaticFilesLoader({
            prefix: 'locale/spotify_search_',
            suffix: '.json'
        });
        var lang = window.getQueryString()['lang'] || 'en';
        $translateProvider.preferredLanguage(lang);
    })

    .run(function ($route, $http, $templateCache, $rootScope) {
        var queryParams = window.SpotifySearch.queryParams;

        (function fetchFonts(){
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
angular.module('SpotifySearchApp').
    filter('artistsOnly', function() {
        return function(textKeyObj) {
            var suffix = (textKeyObj.isArtistsOnly) ? 'ArtistsOnly' : '';
            return  (textKeyObj.textKey + suffix);
        }
    });
