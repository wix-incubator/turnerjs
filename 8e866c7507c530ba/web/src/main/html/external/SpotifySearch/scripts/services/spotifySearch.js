angular.module('SpotifySearchApp')
    .service('spotifySearchService', ['$q', '$http', function spotifySearchService($q, $http) {

        var baseUrl = 'http://ws.spotify.com/search/1/{{type}}.json?q={{searchTerm}}';
        var _searchTerm;
        var searchFunctions = {};

        function search(searchTerm, tabsArr){
            var deferred = $q.defer();
            var promises = [];

            _searchTerm = searchTerm;
            tabsArr.forEach(function (tab) {
                promises.push(searchFunctions[tab.name]());
            });

            $q.all(promises).then(function (results){
                var resultObj = {
                    albums: results.filter(function(result){ return (result && result['albums'] !== undefined) })[0],
                    tracks: results.filter(function(result){ return (result && result['tracks'] !== undefined) })[0],
                    artists: results.filter(function(result){ return (result && result['artists'] !== undefined) })[0]
                };

                //Flatten the result object and set empty array for tabs without results
                for(var attr in resultObj) {
                    if(resultObj.hasOwnProperty(attr)) {
                        resultObj[attr] = (resultObj[attr]) ? resultObj[attr][attr] : [];
                    }
                }

                deferred.resolve(resultObj);
            });

            return deferred.promise;
        }

        searchFunctions.albums = function searchAlbum(){
            var deferred = $q.defer();
            var url = baseUrl.replace('{{type}}', 'album').replace('{{searchTerm}}', encodeURIComponent(_searchTerm));
            var transformResponseFunc = function(data) {
                try { data = JSON.parse(data); } catch(e) { return null; }
                if(!data || !data.albums || !data.albums.length) { return null }

                var albums = [];
                angular.forEach(data.albums, function(value, index){
                    albums.push({
                        index: index,
                        artistName: (value.artists && value.artists[0] && value.artists[0].name) ? value.artists[0].name : '',
                        albumName: value.name || '',
                        uri: value.href || ''
                    });
                });

                return { albums: albums };
            };

            doRequest(url, transformResponseFunc, deferred);

            return deferred.promise;
        }

        searchFunctions.artists = function searchArtist(){
            var deferred = $q.defer();
            var url = baseUrl.replace('{{type}}', 'artist').replace('{{searchTerm}}', encodeURIComponent(_searchTerm));
            var transformResponseFunc = function(data) {
                try { data = JSON.parse(data); } catch(e) { return null; }
                if(!data || !data.artists || !data.artists.length) { return null }

                var artists = [];
                angular.forEach(data.artists, function(value, index){
                    artists.push({
                        index: index,
                        artistName: value.name || '',
                        uri: value.href || ''
                    });
                });

                return { artists: artists };
            };

            doRequest(url, transformResponseFunc, deferred);

            return deferred.promise;
        }

        searchFunctions.tracks = function searchTrack(){
            var deferred = $q.defer();
            var url = baseUrl.replace('{{type}}', 'track').replace('{{searchTerm}}', encodeURIComponent(_searchTerm));
            var transformResponseFunc = function(data) {
                try { data = JSON.parse(data); } catch(e) { return null; }
                if(!data || !data.tracks || !data.tracks.length) { return null }

                var tracks = [];
                angular.forEach(data.tracks, function(value, index){
                    tracks.push({
                        index: index,
                        artistName: (value.artists && value.artists[0] && value.artists[0].name) ? value.artists[0].name : '',
                        albumName: (value.album && value.album.name) ? value.album.name : '',
                        trackName: value.name || '',
                        uri: value.href || ''
                    });
                });

                return { tracks: tracks };
            };

            doRequest(url, transformResponseFunc, deferred);

            return deferred.promise;
        }

        function doRequest(url, transformResponseFunc, deferred){
            $http({ method: 'GET', url: url, transformResponse: transformResponseFunc }).
                success(function(data) {
                    deferred.resolve(data);
                }).
                error(function() {
                    deferred.reject(null);
                });
        }

        return {
            search: search
        };
    }]);
