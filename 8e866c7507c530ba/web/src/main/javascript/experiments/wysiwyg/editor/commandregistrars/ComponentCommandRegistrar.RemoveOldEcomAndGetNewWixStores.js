define.experiment.Class('wysiwyg.editor.commandregistrars.ComponentCommandRegistrar.RemoveOldEcomAndGetNewWixStores', function (classDefinition, experimentStrategy) {
    /**@type core.managers.component.ClassDefinition*/
    var def = classDefinition;

    /**@type bootstrap.managers.experiments.ExperimentStrategy*/
    var strategy = experimentStrategy;

    def.resources(strategy.merge(['W.ServerFacade']));

    def.methods({
        //Experiment SM.New was promoted to feature on Wed Oct 17 17:43:56 IST 2012
        registerCommands: strategy.after(function() {
            var commandMgr = this.resources.W.Commands;
            commandMgr.registerCommandAndListener("WEditorCommands.DeleteOldEcom", this, this._onDeletingOldEcom);
            commandMgr.registerCommandAndListener("WEditorCommands.BeforeSave", this, this._doProvisionForWixStores);
        }),

        _doProvisionForWixStores: function () {
            if(this.hasOldEcomDeleteFlow){
                var event = {
                    'desc': 'site saved after removing online store',
                    'type': 40, //l.type.userAction,
                    'category': 1, //l.category.editor,
                    'biEventId': 62,
                    'biAdapter': 'ec2'
                };

                var params = {
                    src: 30
                };

                LOG.reportEvent(event, params);

                this.resources.W.ServerFacade.markOldEcomAsDeleted();
                var wixStoresAppDefId = "1380b703-ce81-ff05-f115-39571d94dfcd";
                this.resources.W.AppStoreManager.provisionApp('tpaSection', wixStoresAppDefId);
            }
        },

        _onDeletingOldEcom: function () {
            var event = {
                'desc': 'click on delete online store',
                'type': 40, //l.type.userAction,
                'category': 1, //l.category.editor,
                'biEventId': 60,
                'biAdapter': 'ec2'
            };

            var params = {
                src: 30
            };

            LOG.reportEvent(event, params);

            this.resources.W.EditorDialogs.openPromptDialog(
                W.Resources.get('EDITOR_LANGUAGE', 'DELETE_ECOMMERCE_DIALOG_TITLE'),
                W.Resources.get('EDITOR_LANGUAGE', 'DELETE_ECOMMERCE_MESSAGE'),
                undefined,
                this.resources.W.EditorDialogs.DialogButtonSet.DELETE_CANCEL,
                function(response) {
                    if (response.result == "DELETE") {
                        this.hasOldEcomDeleteFlow = true;
                        this._deleteOldEcomFromSite().then(function () {
                            this._showDialogAfterDeletion.bind(this)();
                        }.bind(this));
                    }
                }.bind(this)
            );
        },

        _deleteOldEcomFromSite: function () {
            var event = {
                'desc': 'click on delete online store in confirmation popup',
                'type': 40, //l.type.userAction,
                'category': 1, //l.category.editor,
                'biEventId': 61,
                'biAdapter': 'ec2'
            };

            var params = {
                src: 30
            };

            LOG.reportEvent(event, params);

            var deleteOldEcomDefered = Q.defer();
            var ecomAppPartNames = [
                "30b4a102-7649-47d9-a60b-bfd89dcca135",//gallery
                "adbeffec-c7df-4908-acd0-cdd23155a817",//shopping cart
                "f72a3898-8520-4b60-8cd6-24e4e20d483d",//productPage
                "c029b3fd-e8e4-44f1-b1f0-1f83e437d45c",//view cart
                "cd54a28f-e3c9-4522-91c4-15e6dd5bc514",//checkout button
                "c614fb79-dbec-4ac7-b9b0-419669fadecc",//add to cart button
                "5fca0e8b-a33c-4c18-b8eb-da50d7f31e4a" //joind cart
            ];

            //todo undo or clear stack
            var removeEcomComponents = function (pageComponents, ecomCompsOnPage) {
                _.forEach(pageComponents, function (pageComponent) {
                    _.forEach(ecomCompsOnPage, function (ecomComp) {
                        if(pageComponent.getDataItem() && pageComponent.getDataItem().get('id') === ecomComp.id){
                            W.Editor.deleteComponent(pageComponent, true);
                        }
                    });
                });
            };

            this._deleteEcomCompsFromMasterPage(ecomAppPartNames);

            W.Preview.getSiteDataHandlerPromise().then(function (siteDataHandler) {
                this._deleteEcomCompsFromSitePages(siteDataHandler, ecomAppPartNames, removeEcomComponents).then(function () {
                    deleteOldEcomDefered.resolve();
                });
            }.bind(this));
            return deleteOldEcomDefered.promise;
        },

        _deleteEcomCompsFromMasterPage: function (ecomAppPartNames) {
            var masterPageComps = this.resources.W.Preview.getMasterComponents();
            var masterPageEcomComps = _.filter(masterPageComps, function(masterPageComp){
                return masterPageComp.className === "wixapps.integration.components.AppPart" &&
                    masterPageComp._data && masterPageComp._data.get && _.contains(ecomAppPartNames, masterPageComp._data.get('appPartName'));
            });

            if (masterPageEcomComps.length > 0) {
                _.forEach(masterPageEcomComps, function (ecomComp) {
                    W.Editor.deleteComponent(ecomComp, true);
                });
            }
        },

        _deleteEcomCompsFromSitePages: function (siteDataHandler, ecomAppPartNames, removeEcomComponents) {
            var deferred = Q.defer();
            var thankYouPageId = "72b9eddf-3e36-4763-92a7-fb39dc9bcb7b";

            var viewer = this.resources.W.Preview.getPreviewManagers().Viewer;
            var pagesData = viewer.getPagesData();
            var loadPagePromises = [];

            _.forEach(pagesData, function (page) {
                var loadPageDefer = Q.defer();
                var _page = page;
                var pageData = _page.getData();
                var pageId = pageData.id;
                var pageNode = viewer.getCompByID(pageId);
                var AppPartCompsInPage = siteDataHandler.getComponentOfTypeInPage("wixapps.integration.components.AppPart", pageId);
                var ecomCompsOnPage = [];
                if (pageData.appPageId && pageData.appPageId === thankYouPageId) {
                    viewer.loadPageById(pageId, pageNode).then(function (pageData) {
                        var dontShowDialogOnDelete = true;
                        W.Editor._actualDeletePage(_page, loadPageDefer.resolve, true);
                    });
                } else {
                    _.forEach(AppPartCompsInPage, function (appPartComp) {
                        if (_.contains(ecomAppPartNames, appPartComp.appPartName)) {
                            ecomCompsOnPage.push(appPartComp);
                        }
                    });
                    if (ecomCompsOnPage.length > 0) {
                        viewer.loadPageById(pageId, pageNode).then(function (pageData) {
                            var ecomComponents = [];
                            var componentForDelete = viewer.getPageComponents(pageData.pageId, 'desktop');
                            removeEcomComponents(componentForDelete, ecomCompsOnPage);
                            loadPageDefer.resolve();
                        });
                    } else {
                        loadPageDefer.resolve();
                    }
                }
                loadPagePromises.push(loadPageDefer.promise);
            });

            Q.all(loadPagePromises).then(function () {
                deferred.resolve();
            });

            return deferred.promise;
        },

        _showDialogAfterDeletion: function () {
            this.resources.W.EditorDialogs.openPromptDialog(
                W.Resources.get('EDITOR_LANGUAGE', 'AFTER_DELETE_ECOMMERCE_DIALOG_TITLE'),
                W.Resources.get('EDITOR_LANGUAGE', 'AFTER_DELETE_ECOMMERCE_MASSAGE'),
                undefined,
                this.resources.W.EditorDialogs.DialogButtonSet.OK
            );
        },

        _onAddAppComponent: strategy.around(function(originalFunc, param){
            this._stopOrContinueUserAddAction(originalFunc, param);
        }),

        _onAddApp: strategy.around(function (originalFunc, param) {
            this._stopOrContinueUserAddAction(originalFunc, param);
        }),

        _stopOrContinueUserAddAction: function (originalFunc, param) {
            if(param && this._isHaveEcomComp(param) && this.hasOldEcomDeleteFlow){
                this._showDialogAfterDeletion();
                return; //stop
            }

            originalFunc(param); //continue
        },

        _isHaveEcomComp: function (param) {
            return  this._isWidgetIdIsEcomWidgetId(param.widgetId) || ( param.appDefinitionDataObj && this._isAppDefIdIsEcomAppDefId(param.appDefinitionDataObj.appDefinitionId) );
        },

        _isWidgetIdIsEcomWidgetId: function (widgetId) {
            var ecomAppIds = [
                "30b4a102-7649-47d9-a60b-bfd89dcca135",//gallery
                "5fca0e8b-a33c-4c18-b8eb-da50d7f31e4a", //joind cart
                "c029b3fd-e8e4-44f1-b1f0-1f83e437d45c",//view cart
                "c614fb79-dbec-4ac7-b9b0-419669fadecc" //add to cart button
            ];
            return widgetId && _.contains(ecomAppIds, widgetId);
        },

        _isAppDefIdIsEcomAppDefId: function (appDefId) {
            var ecomAppDefId = "55a88716-958a-4b91-b666-6c1118abdee4";
            return appDefId  === ecomAppDefId;
        }
    });
});
