angular.module('SpotifySearchApp')
    .controller('MainCtrl', ['$scope', '$location', '$translate', 'spotifySearchService', function ($scope, $location, $translate, spotifySearchService) {

        $scope.tabs = [];
        $scope.selectedTab = window.SpotifySearch.config.defaultTab;
        $scope.searchTerm = '';
        $scope.showWelcome = true;
        $scope.searchResults = {
            tracks: [],
            albums: [],
            artists: []
        };

        //Populate the $scope.tabs with the tabs from the configuration
        (function init () {
            var tabsAlias = { 'tracks': 'songs', 'albums': 'albums', 'artists': 'artists' };
            window.SpotifySearch.config.tabs.forEach(function (tab) {
                $scope.tabs.push({ name: tab, alias: tabsAlias[tab] });
            });
        })();

        $scope.doSearch = function() {
            if(!$scope.searchTerm) {
                return;
            }

            $scope.selectedItemInfo = {
                tab: '',
                index: -1
            };

            spotifySearchService.search($scope.searchTerm, $scope.tabs).then(function(searchResults){
                $scope.showWelcome = false;
                $scope.searchResults = searchResults;
            });
        };

        $scope.switchTab = function (tabName){
            $location.path('/' + tabName);
            $scope.selectedTab = tabName;
        };

        $scope.selectItem = function (selectedItem){
            $scope.selectedItemInfo = {
                tab: $scope.selectedTab,
                index: selectedItem.index
            };
        };

        $scope.chooseItem = function (selectedItem) {
            $scope.selectItem(selectedItem);
            $scope.closeDialog(true);
        };

        $scope.closeDialog = function (sendUri){
            var isOkBtnDisabled = !$scope.selectedItemInfo || $scope.selectedItemInfo.index == -1;
            sendUri = sendUri && !isOkBtnDisabled;

            var msgData = JSON.stringify({
                id: window.getQueryString()['id'],
                closeSearchDialog: true,
                uri: (sendUri) ? ($scope.searchResults[$scope.selectedItemInfo.tab][$scope.selectedItemInfo.index].uri) : false
            });
            window.parent.postMessage(msgData, "*");
        };

        $scope.conditionalText = function (textKey){
            var isArtistsOnly = ($scope.tabs.length === 1 && $scope.tabs[0].name === 'artists');
            return { textKey: textKey, isArtistsOnly: isArtistsOnly };
        };
    }]);
