angular.module('VideoSearchApp')
	.controller('MainCtrl', ['$scope', '$location', 'translationService', 'youtubeSearchService', function ($scope, $location, translationService, youtubeSearchService) {

		$scope.tabs = [];
		$scope.selectedTab = window.VideoSearch.config.defaultTab;
		$scope.searchTerm = '';
		$scope.showWelcome = true;
		$scope.videoPreview = {};
		$scope.searchResults = {
			youtube: []
		};


		(function init() {
//			var tabsAlias = { 'youtube': 'youtube' };

			// for future, if it will be more tabs than one
			$scope.tabs = [
				{name: 'youtube', alias: 'Youtube'}
			];

		})();


		/**
		 * Initialize searching
		 */
		$scope.doSearch = function () {
			if (!$scope.searchTerm) {
				return;
			}

			// sends postMessage for "Searching" BI event
			var msgData = JSON.stringify({action: 'bi', state: 'searching', id: VideoSearch.config.id});
			window.parent.postMessage(msgData, "*");

			$scope.selectedItemInfo = {
				tab: '',
				index: -1
			};

			// do actually search, youtube
			youtubeSearchService.search($scope.searchTerm).then(function (searchResults) {
				$scope.showWelcome = false;
				$scope.searchResults.youtube = searchResults.videos;
				$scope.searchResults.youtube_total = searchResults.totalResults;
				$scope.nextPageToken = searchResults.nextPageToken;

				//
				$scope.resetScrollTop = (new Date).getTime();
			});

		};


		/**
		 * Change current tab
		 * Not need for now
		 * @param tabName
		 */
		$scope.switchTab = function (tabName) {
			$location.path('/' + tabName);
			$scope.selectedTab = tabName;
		};

		/**
		 * Set current item params from selectedItem parameter
		 * @param selectedItem
		 */
		$scope.selectItem = function (selectedItem) {


			$scope.selectedItemInfo = {
				tab: $scope.selectedTab,
				index: selectedItem.index,
				videoId: selectedItem.videoId
			};
		};

		/**
		 * Called from DOM, initiate selectItem() function and closes dialog
		 * @param selectedItem
		 */
		$scope.chooseItem = function (selectedItem) {
			$scope.selectItem(selectedItem);
			$scope.closeDialog(true, true);
		};


		/**
		 * Open preview popup for selected video
		 * Called from DOM
		 *
		 * @param selectedItem
		 * @param event
		 */
		$scope.previewItem = function (selectedItem, event) {
			event.preventDefault();

			$scope.videoPreview.visible = true;

			$scope.videoPreview.title = selectedItem.title;

			// video embedded code. youtube only
			var code = '<iframe width="640" height="340" src="//www.youtube.com/embed/{{videoId}}" frameborder="0" allowfullscreen></iframe>';

			$scope.videoPreview.embeddedCode = code.replace('{{videoId}}', selectedItem.videoId);

			var msgData = JSON.stringify({action: 'previewItem', state: true, id: VideoSearch.config.id});
			window.parent.postMessage(msgData, "*");
		};


		/**
		 * Hides video preview popup, clears preview data
		 */
		$scope.hideVideoPreview = function () {
			$scope.videoPreview.visible = false;
			$scope.videoPreview.title = null;
			$scope.videoPreview.embeddedCode = null;

			// sends postMessage with preview action
			var msgData = JSON.stringify({action: 'previewItem', state: false, id: VideoSearch.config.id});
			window.parent.postMessage(msgData, "*");
		};

		/**
		 * Load more videos function, work with youtube only
		 * Called from DOM
		 *
		 * @param e
		 */
		$scope.loadMore = function (e) {
			e.preventDefault();

			$scope.loadMoreInProgress = true;

			youtubeSearchService
				.search($scope.searchTerm, $scope.nextPageToken, $scope.searchResults.youtube.length)
				.then(function (searchResults) {

					$scope.showWelcome = false;
					$scope.loadMoreInProgress = false;

					searchResults.videos.forEach(function (item) {
						$scope.searchResults.youtube.push(item);
					});

					$scope.nextPageToken = searchResults.nextPageToken;

					$scope.searchResults.youtube_total = searchResults.totalResults;
				});

		};

		/**
		 * Closes dialog and sends postMessage to editor with selected video uri
		 *
		 * @param sendUri
		 */
		$scope.closeDialog = function (sendUri, dbClicked) {

			var isOkBtnDisabled = !$scope.selectedItemInfo || $scope.selectedItemInfo.index == -1;

			if (isOkBtnDisabled && sendUri) {
				return;
			}

			sendUri = sendUri && !isOkBtnDisabled;

			// create data for sending
			var msgData = JSON.stringify({
				closeSearchDialog: true,
				type: dbClicked ? 'doubleclick' : 'ok',
				uri: (sendUri) ? ($scope.selectedItemInfo.videoId) : false,
				id: VideoSearch.config.id
			});

			window.parent.postMessage(msgData, "*");
		};

	}]);
