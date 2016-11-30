define.experiment.Class('wysiwyg.editor.managers.editormanager.WEditorManager.ConcurrentEditSessionWatch', function (def, strategy) {

  var CONCURRENCY_WATCHER_PATH = '/concurrent-editing-session-watcher/watcher/report';
  var initialEditorLoad = true;
  var firstTimeMessageIsShown = true;
  var currentUsersOnSiteList = [];
  var isDialogOpen;
  var loggedInUserName;
  var pollingInterval;

  def.methods({
    initialize: strategy.after(function (){
      this.resources.W.Commands.registerCommandAndListener('PreviewIsReady', this, this._initConcurrentSessionsWatch, null, true);
      this.resources.W.Commands.registerCommandAndListener("WEditorCommands.SaveSuccessDialog", this, this._startPollingAfterSave);
    }),

    _initConcurrentSessionsWatch: function(forcePolling) {
      var concurrencyWatchUrl = this._getConcurrencyWatcherPath() + this._getCurrentSessionParamsQueryString();
      var pollingIntervalTime = 1000 * 60; // 1 minute

      if (!W.Editor._siteIsTemplate || forcePolling) {
        loggedInUserName = editorModel.userInfo.name;
        this._startPollingWithInterval(concurrencyWatchUrl, pollingIntervalTime, this._handleConcurrencyIfDetected);
      }
    },

    _startPollingWithInterval: function (pollingUrl, pollingIntervalTime, concurrencyHandler) {
      var self = this;
      var editorReadyTimestamp = _.now();

      doConcurrencyCheck(); // make first check immediately
      pollingInterval = setInterval(doConcurrencyCheck, pollingIntervalTime);

      function doConcurrencyCheck() {
        if (self._userWasNotChanged()) {
          self._restClient.get(pollingUrl, null, {
            onSuccess: function (concurrentEditingData) {
              concurrencyHandler.call(self, concurrentEditingData, editorReadyTimestamp);
            }
          });
        }
      }
    },

    _startPollingAfterSave: function() {
      if (!pollingInterval) {
        this._initConcurrentSessionsWatch(true);
      }
    },

    _userWasNotChanged: function () {
      var wixClientCookie = W.CookiesManager.getCookie('wixClient');
      return wixClientCookie && wixClientCookie.indexOf(loggedInUserName) > -1;
    },

    _handleConcurrencyIfDetected: function (concurrentEditingData, editorReadyTimestamp) {
      if (concurrentEditingData.otherUsersOnSite.length) {
        var otherUserOnSite = this._maskWixStaffEmail(this._getOtherUserOnSite(concurrentEditingData.otherUsersOnSite));

        if (otherUserOnSite) {
          var timeSinceOpen = (_.now() - editorReadyTimestamp) / 1000;

          this._notifyUser(concurrentEditingData.otherUsersOnSite, this._getDialogText(otherUserOnSite));
          this._reportConcurrentEditSessionMessageShown(timeSinceOpen, concurrentEditingData.otherUsersOnSite.length + 1);
          firstTimeMessageIsShown = false;
        }

        this._updateCurrentUsersList(concurrentEditingData.otherUsersOnSite);
      }
      initialEditorLoad = false;
    },

    _maskWixStaffEmail: function(userEmail) {
      if (_.contains(userEmail, 'wixStaff') || _.contains(userEmail, '@wix.com')) {
        return 'Wix staff member';
      }
      return userEmail;
    },

    _getOtherUserOnSite: function(newEditingUsersList) {
      return _.find(newEditingUsersList, function (user) {
        return !_.contains(currentUsersOnSiteList, user);
      });
    },

    _getDialogText: function(newUserEmail) {
      var dialogTextTranslateKeys = {
        title:       initialEditorLoad ? 'CONCURRENT_EDITING_ALREADY_OPEN_TITLE'       : 'CONCURRENT_EDITING_SOMEBODY_JOINED_TITLE',
        description: initialEditorLoad ? 'CONCURRENT_EDITING_ALREADY_OPEN_DESCRIPTION' : 'CONCURRENT_EDITING_SOMEBODY_JOINED_DESCRIPTION'
      };

      return _.mapValues(dialogTextTranslateKeys, function (key) {
        return W.Resources.get('EDITOR_LANGUAGE', key).replace('${user_email}', newUserEmail);
      });
    },

    _updateCurrentUsersList: function(updatedUsersOnSiteList) {
      currentUsersOnSiteList = updatedUsersOnSiteList;
    },

    _notifyUser: function (usersArr, notificationText) {
      if (isDialogOpen) {
        return;
      }

      isDialogOpen = true;
      this.resources.W.EditorDialogs.openPromptDialog(
          notificationText.title,
          notificationText.description,
          "",
          this.resources.W.EditorDialogs.DialogButtonSet.OK,
          function onCloseDialog() {
            isDialogOpen = false;
          }
      );

    },

    _getConcurrencyWatcherPath: function() {
      return '//' + window.location.host + CONCURRENCY_WATCHER_PATH;
    },

    _getCurrentSessionParamsQueryString: function() {
      return '?msid=' + this.resources.W.Config.getMetaSiteId() + '&esi=' + this._getEditorSessionId();
    },

    _getEditorSessionId: function (){
      var esiQueryParam = this.resources.BrowserUtils.getQueryParams().esi;
      return (esiQueryParam && esiQueryParam[0]) || '';
    },

    _reportConcurrentEditSessionMessageShown: function (timeSinceOpen, numOfUsersInEditor) {
      var params = {};
      var rolesArray = editorModel.permissionsInfo.loggedInUserRoles || ['no-role-supplied'];

      params.c1 = initialEditorLoad ? 'CONCURRENT_EDITING_ALREADY_OPEN_TITLE' : 'CONCURRENT_EDITING_SOMEBODY_JOINED_TITLE';
      params.g1 = numOfUsersInEditor;
      params.i1 = timeSinceOpen;
      params.i2 = firstTimeMessageIsShown;
      params.roles = this.resources.W.Utils.RolesUtils.stringifyRoles(rolesArray);

      LOG.reportEvent(wixEvents.CONCURRENT_EDITING_MESSAGE_SHOWN, params);
    }
  });
});
