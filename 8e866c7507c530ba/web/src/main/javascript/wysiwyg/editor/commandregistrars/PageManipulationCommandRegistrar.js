/**@class  wysiwyg.editor.commandregistrars.PageManipulationCommandRegistrar*/
define.Class('wysiwyg.editor.commandregistrars.PageManipulationCommandRegistrar', function (classDefinition) {
    /**@type bootstrap.managers.classmanager.ClassDefinition */
    var def = classDefinition;

    def.resources(['W.Commands', 'W.Preview']);
    def.binds(['_pastePage', '_updatePageMenuItem', '_afterDuplicatePage']);

    /**@lends wysiwyg.editor.commandregistrars.PageManipulationCommandRegistrar*/
    def.methods({
        initialize: function () {
        },

        //Experiment HomepageSettings.New was promoted to feature on Wed Oct 10 12:26:36 IST 2012
        registerCommands: function () {
            var cmdmgr = this.resources.W.Commands;

            this._pageTransitionCommand = cmdmgr.registerCommandAndListener("WEditorCommands.PageTransition", this, this._onPageTransitionChanged);
            this._deletePageCommand = cmdmgr.registerCommandAndListener("WEditorCommands.DeletePage", this, this._onDeletePage);
            this._duplicatePageCommand = cmdmgr.registerCommandAndListener("WEditCommands.DuplicatePage", this, this._onDuplicatePage);
            this._addPageCommand = cmdmgr.registerCommandAndListener("WEditorCommands.AddPage", this, this._onWAddPage);
            this._addPageByPageTemplateIDCommand = cmdmgr.registerCommandAndListener("WEditorCommands.AddPageByPageTemplateID", this, this._addPageByPageTemplateID);
            this._setHomepage = cmdmgr.registerCommandAndListener("WEditorCommands.SetHomepage", this, this._onSetHomepage);
            this._setHomepageButtonIndication = cmdmgr.registerCommandAndListener("WEditorCommands.SetHomepageButtonIndication", this, this._onSetHomepageButtonIndication);
            this._setPageVisibility = cmdmgr.registerCommandAndListener("WEditorCommands.SetPageVisibility", this, this._onSetPageVisibility);
        },

        //############################################################################################################
        //# P A G E   M A N I P U L A T I O N    C O M M A N D S
        //############################################################################################################

        _onPageTransitionChanged: function (param, cmd) {
            var pageGroup = W.Preview.getPreviewManagers().Viewer.getPageGroup();
            pageGroup.setComponentProperty("transition", param);
        },


        //Experiment HomepageSettings.New was promoted to feature on Wed Oct 10 12:26:36 IST 2012
        _onDeletePage: function (pageData, cmd) {
            this.injects().Editor.deletePage(pageData);
            this.injects().UndoRedoManager.clear();
        },


        _onDuplicatePage: function (params) {
            var newPageName = params.newPageName;
            var newPageParent = params.pageParent;
            var pageLogic = W.Preview.getCompLogicById(params.pageHtmlId);
            var clip = W.ClipBoard.copyComponent(pageLogic);
            var promise = this._pastePage(clip, newPageName, newPageParent);
            promise.then(this._afterDuplicatePage);
        },


        _onWAddPage: function (param) {
            var page = param.page;
            var parent = param.parent;
            // Report log event
            LOG.reportEvent(wixEvents.ADD_PAGE, {'c1': page.name});

            var componentDataInstances = [];

            var appComponentTypes = [
                "wixapps.integration.components.AppPart", "tpa.viewer.components.TPASection", "tpa.viewer.components.TPAWidget"
            ];

            var parseComponentData = function (compData) {
                if (compData.data) {
                    compData.data.metaData.isPreset = true;
                }
                if (compData.components) {
                    compData.components.forEach(parseComponentData);
                }

                // Add app components to an data structure
                if (appComponentTypes.contains(compData.componentType)) {
                    componentDataInstances.push(compData);
                }
            };

            page.serializedPageData.components.forEach(parseComponentData);

            var runner = {
                _tasks: [],
                onComplete: null,
                add: function (name, func) {
                    this._tasks.push({ name: name, func: func });
                },
                run: function () {
                    if (this._tasks.length < 1) {
                        if (this.onComplete) {
                            this.onComplete();
                        }
                        return;
                    }
                    var n = this._tasks.shift();
                    n.func(this.run.bind(this));
                }
            };

            runner.onComplete = function () {
                this._onWAddPageRunnerCompletion(param, page, parent);
            }.bind(this);

            componentDataInstances.forEach(function (compData) {
                // notify the app part that this is a first time run
                if (compData.data && compData.data.appLogicParams) {
                    compData.data.appLogicParams["wixapps:first-load-after-add-to-stage"] = {type: "AppPartParam", value: "true"};
                }
                runner.add("provision " + compData.id, function (done) {
                    this._provisionAppComponent(compData, done);
                }.bind(this));
            }.bind(this));

            runner.run();
        },

        _onWAddPageRunnerCompletion : function(params, page, parent) {
            var currentPageId = this.resources.W.Preview.getPreviewManagers().Viewer.getCurrentPageId() ;
            this._pastePage(page.serializedPageData, page.name, parent, params.dontGoToPageUponCreation, function(logic){
                var pageComponents = logic.getPageComponents();

                _.forEach(pageComponents, function (component) {
                    component.fireEvent('addedToStage');
                });

                this.resources.W.Commands.executeCommand(
                    'WEditorCommands.AddPageCompleted',
                    {page: logic, pageComponents: pageComponents, previousPageId: currentPageId}
                );

                if(params.callback)
                {
                    params.callback(logic);
                }
            }.bind(this));
        },

        _updateViewerOnAddPage: function (clip, id, newPageNode) {
            var pageData = _.cloneDeep(clip);
            pageData.id = id;
            pageData.dataQuery = newPageNode.get("dataquery");

            var viewer = W.Preview.getPreviewManagers().Viewer;
            viewer.addPage(pageData, newPageNode);
            viewer.indexPages();
            viewer.updatePagesData();
        },

        _pastePage: function(clip, newPageName, parent, dontGoToPageUponCreation, callback) {
            var sitePagesContainer = this._getPageContainer(),
                deferred = Q.defer();

            W.ClipBoard.pasteFromClip(sitePagesContainer, true, clip, false, function(logic){
                var newPageNode = logic.getViewNode();
                var oldPageId = W.Preview.getPreviewCurrentPageId();
                var newPageId = logic.getID();

                // sorry for checking like this but NBC_WCD is after WixAppsPage in the experiments-order and we
                // need some functionality here
                if(W.Editor.getPageConfigPromise) {
                    var pageData = logic.getDataItem();
                    W.Editor.getPageConfigPromise(pageData.getData()).then(function(config){
                        if(config.handlePastePage) {
                            config.handlePastePage(pageData);
                        }
                    });
                }

                W.Preview.getPreviewManagers().Data.getDataByQuery(newPageNode.get("dataquery"), function(dataItem){
                    var id = dataItem.get("id");
                    newPageNode.set('id', id);
                    var pageUriSEO = W.Utils.convertToValidUrlPart(newPageName) || dataItem.get("pageUriSEO") || '';

                    // URI can be cryptic since the page title also appears in the link
                    dataItem.set("pageUriSEO", pageUriSEO);
                    dataItem.set("title", newPageName);

                    this._updatePageMenuItem(parent, dataItem);

                    this._updateViewerOnAddPage(clip, id, newPageNode);

                    newPageNode.getLogic().preparePageForShow();

                    if(!dontGoToPageUponCreation) {
                        this.resources.W.Commands.executeCommand("EditorCommands.gotoSitePage", id);
                    }
                }.bind(this));

                if(callback) {
                    callback(logic);
                }
                var paramsForAfterDuplicateCommand = {oldPageId: oldPageId, newPageId: newPageId};
                deferred.resolve(paramsForAfterDuplicateCommand);
            }.bind(this));

            return deferred.promise;
        },

        _afterDuplicatePage: function (params) {
            this.resources.W.Commands.executeCommand("WEditCommands.AfterDuplicatePage", params, this);
        },

        _getPageContainer: function(){
            return W.Preview.getPageGroupElement();
        },

        _updatePageMenuItem: function (parent, dataItem) {
            var navigationData = W.Preview.getPreviewManagers().Data.getDataByQuery('#MAIN_MENU');
            navigationData.createAndAddNavigationItem('#' + dataItem.get('id'), parent);
        },

        _onSetHomepage: function (params) {
            var dataManager = W.Preview.getPreviewManagers().Data;
            var siteStructure = dataManager.getDataMap().SITE_STRUCTURE;
            var mainPageDataQuery = siteStructure.get('mainPage') || '#mainPage';
            var currentHomePageId = mainPageDataQuery.slice(1),//slice off the hash. The reason we get mainPage and not mainPageId is because mainPageId is not always there
                currentPageId = params.currentPageId;

            dataManager.getDataByQueryList(['#' + currentHomePageId, '#' + currentPageId], function(resultDataMap){
                var homePageData = resultDataMap['#' + currentHomePageId],
                    currentPageData = resultDataMap['#' + currentPageId];
                var isHomePageIndexable = homePageData.get('indexable'),
                    isCurrentPageIndexable = currentPageData.get('indexable');

                if(isHomePageIndexable && !isCurrentPageIndexable){
                    homePageData.set('indexable', isCurrentPageIndexable);
                    currentPageData.set('indexable', isHomePageIndexable);
                }
            });

            siteStructure.set('mainPage', '#' + currentPageId);
            siteStructure.set('mainPageId', currentPageId);
        },


        //Experiment HomepageSettings.New was promoted to feature on Wed Oct 10 12:26:36 IST 2012
        _onSetPageVisibility: function (data, cmd) {
            // do nothing; PageSettingsPanel listens to this command and sets the button's state
        },


        //Experiment HomepageSettings.New was promoted to feature on Wed Oct 10 12:26:36 IST 2012
        _onSetHomepageButtonIndication: function (visibility, cmd) {
            // do nothing; SiteNavigationButton listens to this command and changes its indications
        },


        //Experiment AppAddPage.New was promoted to feature on Wed Nov 14 16:04:02 IST 2012
        // Used when adding an "add page" that contains an app component.
        _provisionAppComponent: function (compData, done) {
            var componentType = compData.componentType;

            var appType = W.AppStoreManager.getAppTypeByClassName(componentType); // wixappsPart | tpaWidget | tpaSection
            var appManager = W.AppStoreManager.getAppManager(appType);
            var appInnerIDFieldName = appManager.getApplicationIdFieldName();

            var appInnerID = compData.data[appInnerIDFieldName];

            if (appInnerID == undefined) { // jshint ignore:line
                this.fireEvent("error");
                LOG.reportError("App inner ID for [" + appType + "] is blank", 'PageManipulationRegistrar', '_provisionAppComponent');
                return;
            }

            // Id the appInnerID is a number (ordinal), then it means that the application is
            // already provisioned on the meta-site. (and has an applicationId / appInnerId)
            if (W.Utils.isNumber(appInnerID)) {
                done();
                return;
            }

            var guidRegEx = /\w{8}-\w{4}-\w{4}-\w{4}-\w{12}/i; // The application ID could be the appDefinitionId (GUID) - typically when this page definition is transported from another page ("Add Page" scenario)
            var matchArr = appInnerID.match(guidRegEx);

            if (!matchArr || matchArr.length != 1) {
                this.fireEvent("error");
                LOG.reportError("App inner ID for [" + appType + "] contains illegal value", 'PageManipulationRegistrar', '_provisionAppComponent');
                return;
            }

            var appDefinitionId = matchArr[0];
            var appDefinitionData = {
                appDefinitionId: appDefinitionId
            };

            W.AppStoreManager.provisionAndRegisterComponent(appType, appDefinitionData, null, function (appTechnicalData) {
                if (appType == "wixappsPart") {
                    // load the application if not loaded already
                    var appsManager = W.Preview.getPreviewManagers().Apps;
                    if (!appsManager.getAppByPackageName(appTechnicalData.packageName)) {
                        appsManager.loadApplication(appTechnicalData);
                    }
                }

                compData.data[appInnerIDFieldName] = appTechnicalData.applicationId;
                done();
            });
        },

        /**
         * @param {object} params
         *      @param {string} params.pageTemplateId
         *      @param {string} [params.pageName]
         *      @param {function} [params.callback]
         * @private
         */
        _addPageByPageTemplateID: function(params){
            var pageTemplateId = params.pageTemplateId,
                pageName = params.pageName;
            W.Data.getDataByQuery('#PAGE_TYPES', function(pageTypes){
                var pageDataList = pageTypes.get('items') || [];
                var pageTemplateData = _.find(pageDataList, {'name' : pageTemplateId});
                if(!pageTemplateData){
                    W.Utils.debugTrace('Cannot find page date for page template ID: '+ pageTemplateId);
                    return;
                }
                pageTemplateData = _.cloneDeep(pageTemplateData);
                var pageNameLangKey = pageTemplateData.group || pageTemplateData.name;
                pageName = pageName || W.Resources.get('EDITOR_LANGUAGE', pageNameLangKey);
                pageTemplateData.name = pageName;

                this._onWAddPage({page: pageTemplateData, callback: params.callback});
            }.bind(this));
        }
    });
});
