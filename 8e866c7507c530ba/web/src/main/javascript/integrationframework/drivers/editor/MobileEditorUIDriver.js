//#WOH-2715
/**
 * @class wysiwyg.deployment.it.editor.MobileEditorUIDriver
 */
define.Class("wysiwyg.deployment.it.editor.MobileEditorUIDriver", function (classDefinition) {
    var def = classDefinition;

    def.fields({});

    def.utilize(['wysiwyg.deployment.it.editor.StructureComparisonDriver']);

//    def.resources(['W.Data', 'W.CommandsNew', 'W.Commands', 'W.Preview', 'W.Skins']);
    def.resources([]);

    def.methods({

        initialize: function () {

            this._isRefactoredVersion = !W.Preview.getMultiViewersHandler()._responsiveAPI;
            this.algo = W.Preview.getMultiViewersHandler()._layoutAlgorithms;

            this._structureComparisonDriver = new this.imports.StructureComparisonDriver();
            this._secondaryPreviewReady = false;
            var viewerCommands = W.Preview.getPreviewManagers().Commands;
            W.Commands.registerCommandAndListener("WEditorCommands.SecondaryPreviewReady", this, function(){
                //otherwise people start deleting stuff (going back to the desktop) during transition
                viewerCommands.registerCommandAndListener("WViewerCommands.PageChangeComplete", this, function(){
                    var cmd = viewerCommands.getCommand("WViewerCommands.PageChangeComplete");
                    cmd.unregisterListener(this);
                    this._secondaryPreviewReady = true;
                });
            }.bind(this));
        },

        _setSecondaryPreviewReady: function(value) {
            this._secondaryPreviewReady = value;
        },

        isSecondaryPreviewReady: function() {
            return this._secondaryPreviewReady;
        },

        switchToMobileEditor: function(callback) {
            this._setSecondaryPreviewReady(false);
            W.Commands.executeCommand('WEditorCommands.SetViewerMode', {mode: "MOBILE",src: 'btn'});

            var that = this;
            waitsFor(function(){return that.isSecondaryPreviewReady();},
                'waiting for switchToMobileEditor to be done', 2500);
            runs(callback);
        },

        switchToDesktopEditor: function() {
            W.Commands.executeCommand('WEditorCommands.SetViewerMode', {mode: "DESKTOP",src: 'btn'});
        },

        regenerateWholeMobileStructureLayout: function(callback) {
            this._setSecondaryPreviewReady(false);
            W.Commands.executeCommand("WEditorCommands.RegenerateWholeMobileStructureLayout");

            var that = this;
            waitsFor(function(){return that.isSecondaryPreviewReady();},
                'waiting for regenerateWholeMobileStructureLayout to be done', 2500);

            runs(callback);
        },

        registerClassNameAsNonMobileRecommended: function(className) {
            var command = "WEditorCommands.RegisterClassNameToLayoutAlgo";
            W.Commands.executeCommand(command, {
                className: className,
                isMobileRecommendedFunc: function(){return false;}
            });

        },

        registerClassNameAsNonMobileReady: function(className) {
            var command = "WEditorCommands.RegisterClassNameToLayoutAlgo";
            W.Commands.executeCommand(command, {
                className: className,
                isMobileFunc: function(){return false;}
            });

        },

        clearLayoutAlgorithmRegistrarFromComponent: function(componentClassName, mapperType){
            var registrar = this._isRefactoredVersion? this.algo._config : this.algo._registrar;
            var mapper;
            switch (mapperType) {
                case 'extraOperationsFunc':
                    mapper = registrar._classNameToExtraOperationMapper;
                    break;
                case 'isMobileFunc':
                    mapper = registrar._componentMobileValidityMapper;
                    break;
                case 'isMobileRecommendedFunc':
                    mapper = registrar._componentMobileRecommendedMapper;
                    break;
                case 'isSuitableForProportionGroupingFunc':
                    mapper = registrar._isSuitableForProportionGroupingMapper;
                    break;
                case 'setMarginFromContainerFunc':
                    mapper = registrar._registerMarginFromContainerFunction;
                    break;
                case 'dimensionCalculatorFunc':
                    mapper = registrar._dimensionCalculatorMapper;
                    break;
            }

            delete mapper[componentClassName];
        },

        moveComponentToTop: function(compId) {
            if (compId && compId != "SELECTED_COMPONENT") {
                W.Editor.setSelectedComp(W.Preview.getCompByID(compId).getLogic());
            }
            W.Commands.executeCommand("WEditorCommands.MoveTop");
        },

        readdComponentToCurrentPage: function(compId, callback) {
            var currentPageId = W.Preview.getPreviewManagers().Viewer.getCurrentPageId();
            this._readdComponent(compId, currentPageId, callback);
        },

        readdComponentToMasterPage: function(compId, callback){
            this._readdComponent(compId, 'masterPage', callback);
        },

        _readdComponent: function(compId, pageId, callback) {
            this._setSecondaryPreviewReady(false);
            W.Commands.executeCommand('WEditorCommands.ReaddDeletedMobileComponent', {id: compId, pageId: pageId});//should add the case of masterPage

            var that = this;
            waitsFor(function(){return that.isSecondaryPreviewReady();},
                'waiting for readdComponent to be done', 2500);

            runs(callback);
        },

        /////// general methods - START


        sleep: function(timeToSleep, callback) {
            var timeoutPassed = false;
            setTimeout(function() {
                timeoutPassed = true;
            },timeToSleep);

            waitsFor(function(){return timeoutPassed;}, 'waiting for timeout to be done', timeToSleep + 50);

            runs(callback);
        },

        getAllSelectedComponentsData: function() {
            var selectedComponents = W.Editor.getAllSelectedComponents();
            var selectedComponentNodes = selectedComponents.map(function(comp){
                return comp.getViewNode();
            });
            var changedComponentData = W.CompSerializer.serializeComponents(selectedComponentNodes, true);
            return this._structureComparisonDriver.handleEscapeIssues(JSON.stringify(changedComponentData));
        },

        addComponentsToPage: function(componentsDataStringified, callback) {
            var currentPageId = W.Preview.getPreviewManagers().Viewer.getCurrentPageId();
            this.addComponentsToContainer(componentsDataStringified, currentPageId, callback);
        },

        addComponentsToHeader: function(componentsDataStringified, callback) {
            this.addComponentsToContainer(componentsDataStringified, "SITE_HEADER", callback);
        },

        addComponentsToContainer: function(componentsDataStringified, containerId, callback) {

            this.sleep(300, function(){

                var componentsData = JSON.parse(this._structureComparisonDriver.revertHandleEscapeIssues(componentsDataStringified));

                this._finishedAddingComponents = false;
                var that = this;
                W.CompDeserializer.createAndAddComponents(W.Preview.getCompByID(containerId), componentsData, true, true, undefined, function(){
                    that._finishedAddingComponents = true;
                }, true, true);

                waitsFor(function(){
                    return that._finishedAddingComponents;
                }, 'Added comp', 4000);

                runs(callback);

            }.bind(this));
        },


        selectAllPageComponents: function() {
            W.Editor.setSelectedComps(this.getAllPageComponents());
        },

        enforceAnchorsToAllPageComponents: function() {
            W.Preview.getPreviewManagers().Layout.enforceAnchors(this.getAllPageComponents());
        },

        getAllPageComponents: function() {
            return W.Preview.getPageComponents(W.Preview.getPreviewManagers().Viewer.getCurrentPageId(),Constants.ViewerTypesParams.TYPES.DESKTOP);
        },

        getContainerDirectChildrenIds: function(containerId, viewMode) {
            var containerComp = W.Preview.getCompByID(containerId, viewMode).$logic;
            var containerChildrenIds = containerComp.getChildren().map(function(view){return view.$logic.getComponentId()});
            return containerChildrenIds;
        },

        deleteComponent: function(compId) {
            W.Editor.setSelectedComp(W.Preview.getCompByID(compId).getLogic());
            W.Editor.doDeleteSelectedComponent();
        },

        moveResizeComponent: function(compId, params) {
            if (compId && compId != "SELECTED_COMPONENT") {
                W.Editor.setSelectedComp(W.Preview.getCompByID(compId).getLogic());
            }
            W.Commands.executeCommand("WEditorCommands.SetSelectedCompPositionSize", params);
        },

        attachToContainer: function(containerId, newChildId, initialChildPosition) {
            var containerLogic = W.Preview.getCompByID(containerId).getLogic();
            var childLogic = W.Preview.getCompByID(newChildId).getLogic();
            var oldParentLogic = childLogic.getParentComponent();
            containerLogic.addChild(childLogic);
            W.Preview.getPreviewManagers().Layout.reportReparent([containerLogic], oldParentLogic);

            initialChildPosition = initialChildPosition || {};
            initialChildPosition.x = initialChildPosition.x || 10;
            initialChildPosition.y = initialChildPosition.y || 10;
            this.moveResizeComponent(newChildId, initialChildPosition);
        },

        deleteAllCurrentPageComponents: function() {
            var pageCompIds = this.getAllPageComponents().map(function(comp) {return comp.getComponentId();});
            this.deleteComponents(pageCompIds);
        },

        deleteHeaderAndFooterComponents: function(viewMode) {
            viewMode = viewMode || Constants.ViewerTypesParams.TYPES.DESKTOP;
            var headerComponentIds = this.getContainerDirectChildrenIds('SITE_HEADER', viewMode);
            this.deleteComponents(headerComponentIds);
            var footerComponentIds = this.getContainerDirectChildrenIds('SITE_FOOTER', viewMode);
            this.deleteComponents(footerComponentIds);
        },

        deleteComponents: function(componentIds) {
            for (var i=0; i<componentIds.length; i++) {
                if (W.Preview.getCompByID(componentIds[i])) {
                    this.deleteComponent(componentIds[i]);
                }
            }
        },


        //TODO the callback does not ensure that the operation was completed!!! need to add sleep afterward
        addBlankPageAsync: function() {
            var addedPage = editor.addBlankPage();
//            waitsFor(function () {
//                return editor.isComponentReady(addedPage);
//            }, 'page to be ready', 1000);
//            runs(callback);
        },

        //TODO the callback does not ensure that the operation was completed!!! need to add sleep afterward
        deleteCurrentPageAsync: function() {
            var currentPageData = W.Preview.getPreviewManagers().Viewer.getCurrentPageNode().$logic.getDataItem();
            W.Editor._actualDeletePage(currentPageData);
        }


        /////// general methods - END

    });
});
