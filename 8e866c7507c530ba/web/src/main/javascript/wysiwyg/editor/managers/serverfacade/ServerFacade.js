/**
 *  @class ServerFacade
 *  Server API facade for server communication
 */

define.Class('wysiwyg.editor.managers.serverfacade.ServerFacade', function(classDefinition){
    /** @type bootstrap.managers.classmanager.ClassDefinition */
    var def = classDefinition;

    def.inherits('bootstrap.managers.BaseManager');

    def.utilize([
        'core.editor.managers.serverfacade.ServerApiUrls',
        'core.managers.serverfacade.WixRESTClient',
        'wysiwyg.editor.managers.serverfacade.WServerApiUrlsForSiteMembers',
        'wysiwyg.editor.managers.serverfacade.WServerApiUrls',
        'wysiwyg.editor.managers.serverfacade.WServerApiUrlsForApps'
    ]);

    def.resources(['W.Data', 'W.Preview', 'W.Config', 'W.Commands', 'W.Css']);

    def.binds([
        'clearBackupSave',
        '_restoreBackupData',
        '_callbackOnWindowExit',
        '_notifyBeforeSave'
    ]);

    function onlyDeletedPasswords(currentProtectedPagesData){
        return function(lastPasswordHash, pageId){
            return !currentProtectedPagesData[pageId];
        };
    }

    function changedOrAddedPasswords(previousProtectedPagesData){
        return function (currentPasswordHash, pageId){
            return currentPasswordHash !== 'HASHED_FROM_SERVER' && currentPasswordHash !== previousProtectedPagesData[pageId];
        };
    }

    def.methods({
        /**
         * @constructor
         */
        initialize: function() {
            var WServerApiUrlsForSMClass = this.imports.WServerApiUrlsForSiteMembers;
            var WServerApiUrlsClass =this.imports.WServerApiUrls;
            var WServerApiUrlsForAppsClass = this.imports.WServerApiUrlsForApps;

            var RESTClientClass = this.imports.WixRESTClient;
            this._restClient = new RESTClientClass();
            this._urlBuilder = new WServerApiUrlsClass();
            this._urlBuilderForApps = new WServerApiUrlsForAppsClass();

            this._smUrlBuilder = new WServerApiUrlsForSMClass();

            this._version = this.resources.W.Config.getEditedSiteLoadTimeVersion();
            this._revision = this.resources.W.Config.getEditedSiteRevision();

            if (!window.navigator.userAgent.test('Chrome')){
                return;
            }

            if(this._isTemplate()) {
                return;
            }
            this._restoreBackupData();
            this._registerCommandListeners();
            this._overloadExitCodeForCleanBackupData();
            this._backgroundSavingActive = true;
        },

        _registerCommandListeners: function(){
            var cmdMgr = this.resources.W.Commands;
            cmdMgr.registerCommandListenerByName("EditorCommands.SiteLoaded", this, this._startBackgroundBackupProcess);
            cmdMgr.registerCommandAndListener("WEditorCommands.UnlockSaveFreezeAfterException", this, this._removeSaveTimeout);
        },

        _removeSaveTimeout: function(){
            if(this._saveTimeout){
                clearTimeout(this._saveTimeout);
                this._saveTimeout = null;
            }
        },

        _isTemplate : function(){
            if(!window.editorModel.siteHeader){
                return true;
            }
            return window.editorModel.siteHeader.documentType==='template';
        },

        _startBackgroundBackupProcess : function(){
            this._backgroundCrashIndicatorProcess();
            this._backgroundCrashIndicatorProcessId = window.setInterval(this._backgroundCrashIndicatorProcess.bind(this), 300000);
        },

        _temporaryBlockBackgroundSaving: function(){
            this._backgroundSavingActive = false;
            W.Utils.callLater(function(){this._backgroundSavingActive = true;}, null, this, 10000);
        },

        _backgroundCrashIndicatorProcess: function(){
            window.localStorage.setItem('crashIndication_' + this._getSiteId(), LOG.getSessionTime());
        },

        _overloadExitCodeForCleanBackupData : function(){
            window._onExitCallbacks_ = window._onExitCallbacks_ || [];
            window._onExitCallbacks_.unshift(this._callbackOnWindowExit.bind(this));
        },

        _getSiteId : function(){
            return window.editorModel.siteHeader.id;
        },

        _silentAnnoyUserPopup: function(){
            window._onExitCallbacks_ = [];
        },

        _callbackOnWindowExit: function(){
            this._temporaryBlockBackgroundSaving();
            this.clearBackupSave();
        },

        _getSaveUrl: function(){
            return this._urlBuilder.getPartiallySaveDocumentUrl();
        },

        getSaveDocumentParams: function(siteId, site) {
            return this.getPartialSaveDocumentParams(siteId, site);
        },

        getPartialSaveDocumentParams : function(siteId, site, backgroundSave) {
            this._addUsedFontsToData();
            this._fixDataBeforeSave();
            var changedStructure = this.resources.W.Preview.getFullStructureSerializer().getChangedFullSiteStructure(backgroundSave);
            var dataDelta = this.resources.W.Preview.getSiteDataSerializer().serializeDataDelta(site);
            var pagesToUpdate = this._mergedUpdatedPages(changedStructure.updatedPages, dataDelta.detached_pages_to_update) ;
            delete dataDelta.detached_pages_to_update;
            var params = {
                id:             siteId,
                masterPage :    changedStructure.masterPage,
                updatedPages:   pagesToUpdate,
                deletedPageIds: changedStructure.deletedPageIds,
                dataDelta:      dataDelta,
                version:        this._version,
                revision:       this._revision,
                protectedPagesData: this.getProtectedPagesDataDiff()
            };

            this._appendSiteMetaData(params);

            this._appendMetaSiteData(params);

            this._appendHacksParam(params);

            return params;
        },

        getFullSaveDocumentParams : function(siteId, site) {
            this._addUsedFontsToData();
            this._fixDataBeforeSave();
            var serializer = this.resources.W.Preview.getFullStructureSerializer();
            var fullStructure    = serializer.getFullSiteStructureUpdateSecondary();
            var changedStructure = serializer.getChangedFullSiteStructure();

            var dataDelta = this.resources.W.Preview.getSiteDataSerializer().serializeDataDelta(site);
            var pagesToUpdate = this._mergedUpdatedPages(_.toArray(fullStructure.pages), dataDelta.detached_pages_to_update) ;
            delete dataDelta.detached_pages_to_update ;

            var params = {
                id:              siteId,
                masterPage :     fullStructure.masterPage,
                updatedPages:    pagesToUpdate,
                deletedPageIds:  changedStructure.deletedPageIds,
                dataDelta:       dataDelta,
                version:         this._version,
                revision:        this._revision,
                protectedPagesData: this.getProtectedPagesDataDiff()
            };

            this._appendSiteMetaData(params);

            this._appendMetaSiteData(params);

            this._appendHacksParam(params);

            return params;
        },

        _mergedUpdatedPages: function(pageGroup1, pageGroup2) {
            var result  = {};
            pageGroup1  = _.union(pageGroup1, []);
            pageGroup2  = _.union(pageGroup2, []);

            _.map(pageGroup1, function(page) {
                result[page.id] = page ;
            }) ;

            _.map(pageGroup2, function(page) {
                result[page.id] = page ;
            }) ;

            return _.values(result);
        },

        _appendMetaSiteData: function (params) {
            var metaSiteData = this._getMetaSiteData();
            params['metaSiteData'] = metaSiteData || {};
            this._appendMultipleStructureConfig(params['metaSiteData']);

        },

        _appendSiteMetaData: function(params) {
            if(this.wasDataChanged()) {
                params.siteMetaData = {
                    quickActions: {}
                };

                this._appendContactInformation(params);
                params.siteMetaData.quickActions.socialLinks = this._getSocialLinks();
                this._appendQuickActionsConfiguration(params);
                this._appendUserMetaTagsData(params);
            }
        },

        validateUserMetaTags: function(userMetaTags, onSuccess, onError) {
            var url = this.resources.W.Config.getCurrentOrigin() + '/html/head-tags/validate';
            var callbacks = this._wrapSuccessErrorCallbacks(onSuccess, onError);
            this._restClient.post(url, userMetaTags, callbacks);
        },

        _appendUserMetaTagsData: function (params) {
            var userMetaTagsData = this.resources.W.Data.getDataByQuery('#USER_META_TAGS');
            params.siteMetaData.headTags = userMetaTagsData.get("userMetaTags");
        },

        wasDataChanged: function () {
            var dirtyMap = this.resources.W.Data.getDirtyDataObjectsMap();
            return  dirtyMap['CONTACT_INFORMATION'] ||
                dirtyMap['QUICK_ACTIONS'] ||
                dirtyMap['SOCIAL_LINKS'] ||
                dirtyMap['MULTIPLE_STRUCTURE'] ||
                dirtyMap['USER_META_TAGS'];
        },

        _appendContactInformation: function (params) {
            var contactDataItem = this.resources.W.Data.getDataByQuery('#CONTACT_INFORMATION');
            params.siteMetaData.contactInfo = {
                "companyName": contactDataItem.get('companyName'),
                "phone": contactDataItem.get('phone'),
                "email": contactDataItem.get('email'),
                "address": contactDataItem.get('address'),
                "fax": contactDataItem.get('fax')
            };

            params.siteMetaData.preloader = {
                "enabled": contactDataItem.get('preloaderEnabled')
            };

            if (!!contactDataItem.get("logoUrl")) {
                params.siteMetaData.preloader.uri = contactDataItem.get("logoUrl").uri;
            }
        },

        _convertToServerLinksArray: function (socialLinks) {
            var key;
            var socialLinksServerArray = [];
            for (key in socialLinks.getSchema()) {
                var sLink = socialLinks.get(key);
                if (sLink && sLink !== "") {
                    socialLinksServerArray.push({
                        'id' : key,
                        'url': sLink
                    });
                }
            }
            return socialLinksServerArray;
        },

        _getSocialLinks: function () {
            var socialLinks = this.resources.W.Data.getDataByQuery('#SOCIAL_LINKS');
            var socialLinksServerArray = this._convertToServerLinksArray(socialLinks);
            return socialLinksServerArray;
        },

        _appendQuickActionsConfiguration: function (params) {
            var quickActionsConfiguration = this.resources.W.Data.getDataByQuery('#QUICK_ACTIONS');
            params.siteMetaData.quickActions.colorScheme = quickActionsConfiguration.get('colorScheme');
            params.siteMetaData.quickActions.configuration = {
                "quickActionsMenuEnabled": quickActionsConfiguration.get('quickActionsMenuEnabled'),
                "navigationMenuEnabled": quickActionsConfiguration.get('navigationMenuEnabled'),
                "phoneEnabled": quickActionsConfiguration.get('phoneEnabled'),
                "emailEnabled": quickActionsConfiguration.get('emailEnabled'),
                "addressEnabled": quickActionsConfiguration.get('addressEnabled'),
                "socialLinksEnabled": quickActionsConfiguration.get('socialLinksEnabled')
            };
        },

        /**
         * here you can (but shouldn't :)) add hacks that will be saved in the server, and you'll get them back on load
         * unless Shai deleted the hacks table
         * @param params
         * @private
         */
        _appendHacksParam: function(params){},

        _getMetaSiteData : function(){
            if(W.Data.getDirtyDataObjectsMap()['SITE_SETTINGS'] || W.Data.getDirtyDataObjectsMap()['MULTIPLE_STRUCTURE']) {
                return this._getMetaSiteDto();
            }
        },

        getEditUrl: function(id) {
            // this._validators.siteId(id);

            return this._urlBuilder.getSiteEditorUrl(id);
        },

        getExperimentsApps: function() {
            return this._urlBuilderForApps._getExperimentsApps();
        },
        _addMetaSiteDescription: function (dataItem, dto) {
            if (this._isValidItem(dataItem.get("siteDescriptionSEO"))) {
                dto.metaTags = dto.metaTags || [];
                dto.metaTags.push({"name": "description", "value": dataItem.get("siteDescriptionSEO")});
            }
        },
        _addMetaSiteTitle: function (dataItem, dto) {
            if (this._isValidItem(dataItem.get("siteTitleSEO"))) {
                var emptyTitle = dataItem.get('siteTitleSEO').length === 0;

                // server cannot save emp empty strings and requires null
                emptyTitle ? dto.title = null
                    : dto.title = dataItem.get("siteTitleSEO");
            }
        },

        //Experiment SocialPanel.New was promoted to feature on Mon Jul 23 14:28:11 IDT 2012
        _getMetaSiteDto: function() {
            //Meta site data
            var dataItem = W.Data.getDataByQuery('#SITE_SETTINGS');
            var dto = {};

            // Thumbnail
            if (this._isValidItem(dataItem.get("thumbnail"))) {
                dto.thumbnail = dataItem.get("thumbnail");
            }

            // Favicon
            if (this._isValidItem(dataItem.get("favicon"))) {
                dto.favicon = dataItem.get("favicon");
            }

            // Title
            this._addMetaSiteTitle(dataItem, dto);

            // Indexable
            if (this._isValidItem(dataItem.get("allowSEFindSite"))) {
                dto.indexable = dataItem.get("allowSEFindSite");
            }

            // Suppress Tracking Cookies (EU Laws)
            if (this._isValidItem(dataItem.get("suppressTrackingCookies"))) {
                dto.suppressTrackingCookies = dataItem.get("suppressTrackingCookies");
            }

            // FB Admin username
            if (this._isValidItem(dataItem.get("fbAdminsUserId"))) {
                dto.metaTags = dto.metaTags || [];
                dto.metaTags.push({"name": "fb_admins_meta_tag", "value": dataItem.get("fbAdminsUserId")});
            }

            // Keywords
            if (this._isValidItem(dataItem.get("keywordsSEO"))) {
                dto.metaTags = dto.metaTags || [];
                dto.metaTags.push({"name": "keywords", "value": dataItem.get("keywordsSEO")});
            }

            // Description
            this._addMetaSiteDescription(dataItem, dto);

            return dto;
        },

        _provisionAppWithUrlBuilderFunc: function(urlBuilderFuncName, urlBuilderParam, onSuccess, onError, params) {
            params = params || {};

            var callbacks = this._wrapSuccessErrorCallbacks(onSuccess, onError);
            var urlBuilderFunc = this._urlBuilderForApps[urlBuilderFuncName];
            if (typeof urlBuilderFunc !== 'function') {
                LOG.reportError(wixErrors.TPA_EXPECTED_FUNCTION, urlBuilderParam, '_provisionAppWithUrlBuilderFunc', urlBuilderFunc);
                return;
            }

            var url = urlBuilderFunc.call(this._urlBuilderForApps, urlBuilderParam);
            this._restClient.post(url, params, callbacks);
        },

        provisionApp: function(appDefinitionId, onSuccess, onError) {
            this._provisionAppWithUrlBuilderFunc('getProvisionAppUrl', appDefinitionId, onSuccess, onError);
        },

        provisionAppDemoBeforeMetasiteSave: function(appId,  onSuccess, onError) {
            this._provisionAppWithUrlBuilderFunc('getPreSaveDemoProvisionUrl', appId, onSuccess, onError);
        },

        //same json, with applicationId = -1, and with instanceId
        provisionAppBeforeMetasiteSave: function (appDefinitionId,  onSuccess, onError) {
            this._provisionAppWithUrlBuilderFunc('getPreSaveProvisionAppUrl', appDefinitionId, onSuccess, onError);
        },

        // returns saved json, with real application Id
        completeProvisionAfterMetasiteSave: function ( apps, onSuccess, onError) {
            this._provisionAppWithUrlBuilderFunc('getCompleteProvisionUrl', null, onSuccess, onError, apps);
        },

        //TODO - refactor this to use some kind of a restClient wrapper
        revokeAppsPermissions: function(appIds, onSuccess, onError, context) {
            var callbacks = this._wrapSuccessErrorCallbacks(onSuccess, onError);
            var urlBuilderFunc = this._urlBuilderForApps['getRevokeAppsPermissionsUrl'];
            if (typeof urlBuilderFunc !== 'function') {
                LOG.reportError(wixErrors.TPA_EXPECTED_FUNCTION, appIds, 'revokeAppsPermissions', urlBuilderFunc);
                return;
            }
            var url = urlBuilderFunc.call(this._urlBuilderForApps, appIds, context);
            this._restClient.post(url, {}, callbacks);
        },

        grantAppPermissions: function(appId, permissions, onSuccess, onError, context) {
            var callbacks = this._wrapSuccessErrorCallbacks(onSuccess, onError);
            var urlBuilderFunc = this._urlBuilderForApps.getGrantAppsPermissionsUrl;
            if (typeof urlBuilderFunc !== 'function') {
                LOG.reportError(wixErrors.TPA_EXPECTED_FUNCTION, appId, 'grantAppsPermissions', urlBuilderFunc);
                return;
            }
            var url = urlBuilderFunc.call(this._urlBuilderForApps, appId, context);
            this._restClient.post(url, permissions, callbacks);
        },

        _notifyBeforeSave: function(){
            this.resources.W.Commands.executeCommand("WEditorCommands.BeforeSave");
        },

        saveDocument:function(siteId, site, onSuccess, onError, param) {
            this._notifyBeforeSave();
            var blockArea = new Element('div', {
                id:'TEMP_SAVE_FREEZE',
                styles:{
                    background:'rgba(0, 0, 0, 0.2)',
                    position:'fixed',
                    top:0,
                    bottom:0,
                    left:0,
                    right:0,
                    'z-index':99999999999999,
                    'cursor':'progress'
                }
            });
            var themeDir = this.injects().Theme.getProperty('WEB_THEME_DIRECTORY');

            var msg = (param!==undefined && param.isPublished!==undefined && param.isPublished===true) ? 'WAIT_FOR_PUBLISH' : 'WAIT_FOR_SAVE';
            var saveMsg = this.injects().Resources.get('EDITOR_LANGUAGE', msg);
            blockArea.innerHTML = '<div style="text-align: center;">' +
                '<div style="display: inline-block; width: auto; margin: 0px auto; height: auto;  padding-bottom: 35px; background: url(' + themeDir + 'panel/gradients_for_main_nav.png) 0px -20px repeat-x #F7F7F7; border-radius: 0 0 5px 5px; box-shadow: black -3px 0px 50px 0px; padding: 45px;">' +
                '<div style="display: inline-block; background-image: url(' + themeDir + 'icons/save_publish.png); background-position: -2px 0px; background-repeat: no-repeat no-repeat; width: 30px; height: 30px; margin-right: 20px; vertical-align: middle; margin-top: -17px;"></div>' +
                '<div class="thin" style="display: inline-block; font-size: 32px; color: #404040;">' + saveMsg + '</div></div></div>';
            $(document.body).appendChild(blockArea);
            // Set timeout to remove the block

            var params = this.getSaveDocumentParams(siteId, site);

            var timeoutLength = 30000;
            if(params.updatedPages && params.updatedPages.length > 50){
                var additionalPages = params.updatedPages.length - 50;
                var additionalTimeoutLength =  additionalPages * 1000;
                timeoutLength = timeoutLength + additionalTimeoutLength;
            }

            this._saveTimeout = setTimeout(function(){
                onError("","Timeout");
            }, timeoutLength);

            var saveTimeout = this._saveTimeout;
            var successWrapper = function() {
                clearTimeout(saveTimeout);
                saveTimeout = null;
                onSuccess && onSuccess.apply(this, arguments);
            };

            var errorWrapper = function() {
                clearTimeout(saveTimeout);
                saveTimeout = null;
                onError && onError.apply(this, arguments);
            };

            this._checkForCorruptedPagesInMainMenu();

            var url = this._getSaveUrl();
            successWrapper = this._wrapSuccessCallbackWithVersionUpdater(successWrapper);
            var callbacks = this._wrapSuccessErrorCallbacks(successWrapper, errorWrapper);


            if(!this.resources.W.Data.getDirtyDataObjectsMap()['SITE_SETTINGS']) {
                delete params['metaSiteData'];
            }

            this._restClient.post(url, params, callbacks);

            this.clearBackupSave();
        },

        /**
         * Saves a document fully, overriding the one that currently exist on the server
         */
        overrideSaveDocument: function(siteId, site, onSuccess, onError, param) {
            this._notifyBeforeSave();
            this.showSaveFreezeMessage(param);
            this._checkForCorruptedPagesInMainMenu();
            var url = this._getOverrideSaveUrl();
            this._prepareDataForFullSave();
            onSuccess = this._wrapSuccessCallbackWithVersionUpdater(onSuccess);
            var callbacks = this._wrapSuccessErrorCallbacks(onSuccess, onError);
            var params = this.getFullSaveDocumentParams(siteId, site);
            if(!this.resources.W.Data.getDirtyDataObjectsMap()['SITE_SETTINGS']) {
                delete params['metaSiteData'];
            }
            this._restClient.post(url, params, callbacks);
        },

        clearBackupSave : function(){
            window.localStorage.removeItem('crashIndication_' + this._getSiteId());
        },

        //Experiment SM.New was promoted to feature on Wed Oct 17 17:43:57 IST 2012
        smProvision: function( onSuccess, onError ) {
            var url = this._smUrlBuilder.getProvisionUrl();
            var callbacks = this._wrapSuccessErrorCallbacks(onSuccess, onError);
            var params = {};
            this._restClient.jsonp(url, params, callbacks, true);
        },

        //Experiment SM.New was promoted to feature on Wed Oct 17 17:43:57 IST 2012
        smProvisionAppBeforeMetasiteSave: function ( onSuccess, onError) {
            var url = this._smUrlBuilder.getPreSaveProvisionUrl();
            var callbacks = this._wrapSuccessErrorCallbacks(onSuccess, onError);
            var params = {};
            this._restClient.jsonp(url, params, callbacks, true);
        },

        //Experiment SM.New was promoted to feature on Wed Oct 17 17:43:57 IST 2012

        // returns saved json, with real application Id
        smCompleteProvisionAfterMetasiteSave: function ( smCollectionId, onSuccess, onError) {
            if (!smCollectionId) {
                LOG.reportError("collection Id is unavailable [" + smCollectionId + "] to complete SM provision", this.$className, "smCompleteProvisionAfterMetasiteSave");
            }

            var url =  this._smUrlBuilder.getCompleteProvisionUrl( smCollectionId );
            var callbacks = this._wrapSuccessErrorCallbacks(onSuccess, onError);
            this._restClient.jsonp(url, {}, callbacks, true);
        },

        _restoreBackupData : function(){
            var didSiteCrash = window.localStorage.getItem('crashIndication_' + this._getSiteId());
            if(didSiteCrash){
                LOG.reportError(wixErrors.SITE_CRASHED_IN_PREVIOUS_SESSION, 'site probably crashed in the previous session', didSiteCrash);
                this.clearBackupSave();
            }
        },

        /**
         * @param {window} site - window of the document for clone
         * @param {String} sourceSiteId - source document id
         * @param {String} targetName - requested document name for the clone
         * @param {function=} onSuccess - success callback
         * @param {function=} onError - error callback
         */
        cloneDocument: function(site, sourceSiteId, targetName, onSuccess, onError) {
            this._notifyBeforeSave();
            this.showSaveFreezeMessage();
            this._checkForCorruptedPagesInMainMenu();
            var url = this.getCloneURL();
            this._prepareDataForFullSave();
            this._markAllDataAsDirtyThusForcingFullSave();
            var callbacks = this._wrapSuccessErrorCallbacks(onSuccess, onError);

            var params = this._getFullSaveDocumentParamsOld(site, sourceSiteId, targetName);

            this._appendSiteMetaData(params);

            if(W.Utils.isSiteNameAlreadyExist(targetName)) {
                LOG.reportError(wixErrors.DUPLICATE_METASITE_NAME, "ServerFacade", "cloneDocument", {siteName:targetName, usedMetaSiteNames:W.Utils.getUsedMetaSiteNames().join(', ')});
                onError(wixErrors.DUPLICATE_METASITE_NAME.desc, wixErrors.DUPLICATE_METASITE_NAME.errorCode);
                return;
            }
            this._restClient.post(url, params, callbacks);
        },

        _prepareDataForFullSave: function()
        {
            this._instantiateAllPendingDefinedData();
            this._markAllDataAsDirtyThusForcingFullSave();
        },

        _instantiateAllPendingDefinedData: function()
        {
            var siteManagers = this.resources.W.Preview.getPreviewManagers();
            var dataManagers = [siteManagers.Data, siteManagers.Theme, siteManagers.ComponentData];

            for(var i = 0; i < dataManagers.length; i++)
            {
                var manager = dataManagers[i];
                var definedData = manager.define.getDefinition(manager.DEFINE_NAMESPACE);

                for (var id in definedData) {
                    if(manager.dataMap[id] == null)
                    {
                        manager.addDataItem(id, definedData[id]);
                    }
                }
            }
        },

        getCloneURL: function(){
            var url = this._urlBuilder.getFirstSaveUrl();
            return url;
        },

        _getOverrideSaveUrl: function(){
            return this._urlBuilder.getOverrideSaveUrl();
        },

        /**
         * @param {window} site - window of the document for clone
         * @param {String} sourceSiteId - source document id
         * @param {String} targetName - requested document name for the clone
         * @param {function=} onSuccess - success callback
         * @param {function=} onError - error callback
         */
        saveAs: function(site, sourceSiteId, targetName, onSuccess, onError) {
            this._notifyBeforeSave();
            this.showSaveFreezeMessage();
            var url = this._urlBuilder.getSaveAsUrl();
            var callbacks = this._wrapSuccessErrorCallbacks(onSuccess, onError);

            var params = this._getFullSaveDocumentParamsOld(site, sourceSiteId, targetName);

            this._restClient.post(url, params, callbacks);
        },


        /**
         * Save site as new facebook site in the same metasite
         * @param {window} site - window of the document for save
         * @param {function=} onSuccess - success callback
         * @param {function=} onError - error callback
         */
//        saveDocumentAsFacebook: function(site, onSuccess, onError) {
//            var url = this._urlBuilder.getSaveAsFacebookUrl();
//            this._markAllDataAsDirtyThusForcingFullSave();
//            // ToDo: change site size to the new facebook size
//
//            var callbacks = this._wrapSuccessErrorCallbacks(onSuccess, onError);
//            var params = {
//                documents:      [this._siteSerializer.serializeSiteStructure(site)],
//                dataNodes:      this._siteSerializer.serializeSiteData(site)
//            };
//
//            //~ this._restClient.post(url, params, callbacks);
//        },

        /**
         * Mark all data on site as dirty (Data, Properties ad Theme)
         */
        _markAllDataAsDirtyThusForcingFullSave: function(){
            var siteManagers = this.resources.W.Preview.getPreviewManagers();
            siteManagers.Data.markAllDirty();
            siteManagers.Theme.markAllDirty();
            siteManagers.ComponentData.markAllDirty();
        },

        /**
         * @param {String} siteId - site id (GUID)
         * @param {function=} onSuccess - success callback
         * @param {function=} onError - error callback
         */
        publishDocument: function(siteId, onSuccess, onError) {
            var url = this._urlBuilder.getPublishDocumentUrl(siteId);
            onSuccess = this._wrapSuccessCallbackWithVersionUpdater(onSuccess);
            var callbacks = this._wrapSuccessErrorCallbacks(onSuccess, onError);
            var params = {};
            this._restClient.post(url, params, callbacks);
            this._reportUsedFontsBI();
        },

        _reportUsedFontsBI: function(){
            var usedFontsList = this.resources.W.Preview.getPreviewManagers().Css.getCachedUsedFontsList();
            this.resources.W.Css.reportSiteFontsBiEvent(usedFontsList);
        },

        /**
         * Copy document as template into the template db collection
         * @param {String} siteId - site id (GUID)
         * @param {function=} onSuccess - success callback
         * @param {function=} onError - error callback
         */
        publishTemplate: function(siteId, onSuccess, onError) {
            if(W.isExperimentOpen('PublishTemplateFlowChanges')) {
                W.Editor._siteIsTemplate = true;
                this.resources.W.Commands.executeCommand('WEditorCommands.Publish');
            }

            var url = this._urlBuilder.getPublishTemplateUrl(siteId);
            var callbacks = this._wrapSuccessErrorCallbacks(onSuccess, onError);
            var params = {};

            this._restClient.post(url, params, callbacks);
        },

        /**
         * Sends an email with the site address to site owner
         * @param {String} siteId - site id (GUID)
         * @param {function=} onSuccess - success callback
         * @param {function=} onError - error callback
         */
        sendAddressToMail: function(siteId, onSuccess, onError) {
            var url = this._urlBuilder.getSendEmailUrl(siteId);
            var callbacks = this._wrapSuccessErrorCallbacks(onSuccess, onError);
            var params = {};

            this._restClient.post(url, params, callbacks);
        },

        _getFullSaveDocumentParamsOld: function(site, sourceSiteId, targetName){
            this._fixDataBeforeSave();
            var fullStructure = this.resources.W.Preview.getFullStructureSerializer().getFullSiteStructureForFirstSave();
            var document = this._addPagesToSiteStructure(fullStructure.masterPage, fullStructure.pages);
            var data = this.resources.W.Preview.getSiteDataSerializer().serializeDataDelta(site);
            var params = {
                sourceSiteId:   sourceSiteId,
                targetName:     targetName,
                documents:      this._addDataToDocument(document, data),
                dataNodes:      data.document_data,
                metaSiteData:   this._getMetaSiteDataForClone(),
                protectedPagesData: this.getProtectedPagesDataDiff()
            };

            this._appendHacksParam(params);
            return params;
        },

        _addDataToDocument: function(document, data){
            var customData = {
                componentProperties: data.component_properties,
                themeData: data.theme_data
            };
            var wrappedDocument = [_.merge(document, customData)];
            return wrappedDocument;
        },

        //when merging the _appendMultipleStructureConfig should be merged into _getMetaSiteDto
        _getMetaSiteDataForClone: function () {
            var metaSiteData = this._getMetaSiteDto() || {};
            this._appendMultipleStructureConfig(metaSiteData);
            return metaSiteData;
        },

        _addPagesToSiteStructure: function(site, pages){
            var pageContainer = _.find(site.children, function(item){
                return item.id === "PAGES_CONTAINER";
            });
            var pageGroup = _.find(pageContainer.components, function(item){
                return item.id === "SITE_PAGES";
            });
            _.forOwn(pages, function(page){
                pageGroup.components.push(page);
            });
            return site;
        },

        _addMoblieFallbackFontsToDesktopSystemFonts: function(dataMap){
            var regex = /(<[^>]+\"font-family:)(comic sans ms|impact|courier new|tahoma)(;\")/g;
            _.each(dataMap, function(item){
                var data = item.getData();
                if(data.type == "StyledText" && regex.test(data.text)){
                    data.text = data.text.replace(regex, function(match, $0, $1, $2, offset, string){
                        switch($1){
                            case 'comic sans ms':
                                $1 = 'comic sans ms,comic-sans-w01-regular,comic-sans-w02-regular,comic-sans-w10-regular';
                                break;
                            case 'impact':
                                $1 = 'impact,impact-w01-2010,impact-w02-2010,impact-w10-2010';
                                break;
                            case 'courier new':
                                $1 = 'courier new,courier-ps-w01,courier-ps-w02,courier-ps-w10';
                                break;
                            case 'tahoma':
                                $1 = 'tahoma,tahoma-w01-sc,tahoma-w02-regular,tahoma-w10-regular';
                                break;
                        }
                        return $0 + $1 + $2;
                    });

                    item.setData(_.clone(data));
                }
            });
        },

        updateLastProtectedPagesData: function(){
            var wData = this.resources.W.Preview.getPreviewManagers().Data;
            wData.lastProtectedPagesDataForPasswordMigration = this.getCurrentProtectedPagesData();
        },

        getCurrentProtectedPagesData: function(){
            var wData = this.resources.W.Preview.getPreviewManagers().Data;
            var dataMap = wData.getDataMap();

            return _.chain(dataMap)
                .pick(function(dataItem){
                    var data = dataItem.getData();
                    return data.type === "Page" && data.pageSecurity && data.pageSecurity.passwordDigest;
                })
                .mapValues(function(dataItem){
                    return dataItem.getData().pageSecurity.passwordDigest;
                })
                .value();
        },

        getProtectedPagesDataDiff: function(){
            var wData = this.resources.W.Preview.getPreviewManagers().Data;
            var previousProtectedPagesData = wData.lastProtectedPagesDataForPasswordMigration || {};

            var currentProtectedPagesData = this.getCurrentProtectedPagesData();
            var deletedPagesMap = _.chain(previousProtectedPagesData)
                .pick(onlyDeletedPasswords(currentProtectedPagesData))
                .mapValues(_.constant(null))
                .value();

            return _.chain(currentProtectedPagesData)
                .pick(changedOrAddedPasswords(previousProtectedPagesData))
                .merge(deletedPagesMap)
                .value();
        },

        _fixDataBeforeSave: function(){
            var dataMap = this.resources.W.Preview.getPreviewManagers().Data.getDataMap();
            this._addMoblieFallbackFontsToDesktopSystemFonts(dataMap);
        },

        /**
         * ToDo: fix this api call to the server
         * this api call will not work because the THEME_DATA node is no longer
         * in the content-data data map. need to add a server api call to different
         * data maps (content, properties, theme)
         * @param {String} siteId - site id (GUID)
         * @param {function=} onSuccess - success callback
         * @param {function=} onError - error callback
         */
        getThemeDataJson: function(siteId, onSuccess, onError) {
            throw new Error('getThemeDataJson is not working any more. please help by fixing it.');
            /*
             var url = this.URLS.GET + siteId + "/data_node?dataNodeId=THEME_DATA";
             var callbacks = this._wrapSuccessErrorCallbacks(onSuccess, onError);
             var params = {};

             this._restClient.get(url, params, callbacks);
             */
        },

        /**
         * Saves html to static server
         * @param {String} html - html string
         * @param {function=} onSuccess - success callback
         * @param {function=} onError - error callback
         */
        saveHtmlAsTempStaticUrl: function(html, onSuccess, onError) {
            var url = this._urlBuilder.getSaveHtmlTempUrl();
            var callbacks = this._wrapSuccessErrorCallbacks(onSuccess, onError);
            var params = {
                html: html
            };

            this._restClient.post(url, params, callbacks);
        },

        /**
         * Retrieves content text from statics
         * @param {String} url - address of the static file
         * @param {function=} onSuccess - success callback
         * @param {function=} onError - error callback
         */
        getContentFromStaticUrl: function(url, onSuccess, onError) {
            var absoluteUrl = this._urlBuilder.getGetContentFromStaticUrlUrl(url);
            var callbacks = this._wrapSuccessErrorCallbacks(onSuccess, onError);
            var params = {};

            this._restClient.get(absoluteUrl, params, callbacks);
        },

        /**
         * ToDo: fix this api call to the server
         * this api call will not work because the server stopped supporting it
         * @param {function=} onComplete
         */
        getPremiumFlag: function(onComplete) {
            throw new Error('getPremiumFlag is not working any more. please help by fixing it.');
            /*
             // window.editorUrl set on server side, see: edit.vm
             var url = window.editorUrl + "/premium/name/" + siteHeader.siteName + "?accept=javascript&callback=W.ServerFacade._setPremiumFlagCallback";
             var callbacks = this._wrapSuccessErrorCallbacks(onComplete, null);

             this._restClient.jsonp(url, null, callbacks);
             */
        },

        /**
         * Retrives the preview url of the site
         * @param {String} siteId - site id (GUID)
         */
        getPreviewUrl: function(siteId) {
            // this._validators.siteId(id);

            return this._urlBuilder.getSitePreviewUrl(siteId);
        },

        isReady: function() {
            return true;
        },

        clone: function(newDefine) {
            return this.parent(newDefine);
        },

        _setVersion:function(version) {
            this._version = version;
        },

        _setRevision: function(revision) {
            this._revision = revision;
        },

        _wrapSuccessErrorCallbacks: function(successCallback, errorCallback) {
            return {
                'onSuccess': successCallback,
                'onError': errorCallback
            };
        },

        _wrapSuccessCallbackWithVersionUpdater: function (successHandler) {
            var _serverFacade = this;
            return function(response){
                if (response){
                    if (response.version) {
                        _serverFacade._setVersion(response.version);
                    }
                    if (response.revision) {
                        _serverFacade._setRevision(response.revision);
                    }
                }
                _serverFacade.updateLastProtectedPagesData();
                successHandler(response);
            };
        },

        _isValidItem: function(item) {
            return item !== undefined;
        },

        //This is done due to corruption issues that were found in automation and we dont know what causes them
        _checkForCorruptedPagesInMainMenu:function() {
            var previewManagers = this.resources.W.Preview.getPreviewManagers();
            var siteStructureData = previewManagers.Data.getDataByQuery('#SITE_STRUCTURE');
            var pages = siteStructureData.get('pages');
            if (!previewManagers.Data.isDataAvailable('#MAIN_MENU')) {
                return;
            }
            var mainMenuData = previewManagers.Data.getDataByQuery('#MAIN_MENU');
            var menuItems = mainMenuData.getAllItems();

            //remove menu items for pages which dont exist
            for (var i = 0; i < menuItems.length; i++) {
                var currentItemRefId = menuItems[i].get('refId');
                if (!pages.contains(currentItemRefId)) {
                    mainMenuData.deleteNavigationItem(currentItemRefId);
                    LOG.reportError(wixErrors.MENU_CORRUPTION_UNKNOWN_PAGE, "ServerFacade", "_checkForCorruptedPagesInMainMenu-removeMenuItems", currentItemRefId);
                }
            }

            //create menu items for pages which dont have them
            for (i = 0; i < pages.length; i++) {
                var currentPageId = pages[i];
                if (!mainMenuData.getItemByRefId(currentPageId)) {
                    mainMenuData.createAndAddNavigationItem(currentPageId, null, i);
                    LOG.reportError(wixErrors.MENU_CORRUPTION_MISSING_PAGE, "ServerFacade", "_checkForCorruptedPagesInMainMenu-createMenuItems", currentPageId);
                }
            }
        },

        _appendMultipleStructureConfig:function(metaSiteData){
            var multipleStructureConfiguration = this.resources.W.Data.getDataByQuery('#MULTIPLE_STRUCTURE');
            var hasMobileStructure = multipleStructureConfiguration.get('hasMobileStructure');
            if( W.Data.getDirtyDataObjectsMap()['SITE_SETTINGS'] || W.Data.getDirtyDataObjectsMap()['MULTIPLE_STRUCTURE']){
                metaSiteData.adaptiveMobileOn = hasMobileStructure;
                var siteSettingsData = this.resources.W.Data.getDataByQuery('#SITE_SETTINGS');
                siteSettingsData.markDataAsDirty();
            }
        },

        _addUsedFontsToData: function(){
            try{
                var managers = this.resources.W.Preview.getPreviewManagers();
                var usedFonts = managers.Css.getUsedFonts();
                var siteStructureData = managers.Data.getDataByQuery('#SITE_STRUCTURE');
                siteStructureData.set("usedFonts", usedFonts);
                siteStructureData.markDataAsDirty();
            }
            catch(error){
                LOG.reportError(wixErrors.SITE_FONTS_LIST_COMPUTATION_FAILED, {c1: JSON.stringify(error)});
            }
        },

        handleFirstSave:function(firstSaveResponseData) {
            this._setVersion(firstSaveResponseData.siteHeader.version);
            this._setRevision(firstSaveResponseData.siteHeader.revision);
        },

        showSaveFreezeMessage: function(param){
            var blockArea = new Element('div', {
                id:'TEMP_SAVE_FREEZE',
                styles:{
                    background:'rgba(0, 0, 0, 0.2)',
                    position:'fixed',
                    top:0,
                    bottom:0,
                    left:0,
                    right:0,
                    'z-index':99999999999999,
                    'cursor':'progress'
                }
            });
            var themeDir = this.injects().Theme.getProperty('WEB_THEME_DIRECTORY');

            var msg = (param!==undefined && param.isPublished!==undefined && param.isPublished===true) ? 'WAIT_FOR_PUBLISH' : 'WAIT_FOR_SAVE';
            var saveMsg = this.injects().Resources.get('EDITOR_LANGUAGE', msg);
            blockArea.innerHTML = '<div style="text-align: center;">' +
                '<div style="display: inline-block; width: auto; margin: 0px auto; height: auto;  padding-bottom: 35px; background: url(' + themeDir + 'panel/gradients_for_main_nav.png) 0px -20px repeat-x #F7F7F7; border-radius: 0 0 5px 5px; box-shadow: black -3px 0px 50px 0px; padding: 45px;">' +
                '<div style="display: inline-block; background-image: url(' + themeDir + 'icons/save_publish.png); background-position: -2px 0px; background-repeat: no-repeat no-repeat; width: 30px; height: 30px; margin-right: 20px; vertical-align: middle; margin-top: -17px;"></div>' +
                '<div class="thin" style="display: inline-block; font-size: 32px; color: #404040;">' + saveMsg + '</div></div></div>';
            $(document.body).appendChild(blockArea);
        }

    });
});
