//describeExperiment({'OpenSpecificPanelOnEditorLoaded': 'New'}, "OpenSpecificPanelOnEditorLoaded", function () {
//    describe('EditorUI component', function(){
//        beforeEach(function() {
//            this.testComp = W.Components.createComponent(
//                'wysiwyg.editor.components.EditorUI',
//                'wysiwyg.editor.skins.EditorUISkin',
//                undefined,
//                {labelText: ''},
//                null,
//                function(logic){
//                    this.logic = logic;
//                    this.logic.removeState('fullPreview', 'tabsPreview');
//                    this.logic._siteIsReady = true;
//                    this.logic._previewIsReady = true;
//                    this.isComplete = true;
//                }.bind(this)
//            );
//
//            waitsFor( function(){
//                return this.isComplete;
//            }.bind(this), 'EditorUI component creation', 1000);
//        });
//
//        it('should not open panel if query value is empty or wrong', function(){
//            spyOn(W.Commands, 'executeCommand');
//
//            this.logic._query = {'openpanel':'gaga'};
//            this.logic._openPanelByQueryValue();
//            expect(W.Commands.executeCommand).not.toHaveBeenCalled();
//
//            this.logic._query = null;
//            this.logic._openPanelByQueryValue();
//            expect(W.Commands.executeCommand).not.toHaveBeenCalled();
//        });
//
//        it('should open specific panel', function(){
//            spyOn(this.logic, '_executeCommand');
//
//            this.logic._query = {'openpanel':'social'};
//            this.logic._openPanelByQueryValue();
//            expect(this.logic._executeCommand).toHaveBeenCalled();
//
//            this.logic._query = {'openpanel':'statistics'};
//            this.logic._openPanelByQueryValue();
//            expect(this.logic._executeCommand).toHaveBeenCalled();
//        });
//
//        it('should return right value in _getValueByQueryParam', function(){
//            spyOn(W.Utils, 'getQueryStringAsObject').andCallFake(function() {
//                return {'openpanel':'social'};
//            });
//            expect(this.logic._getValueByQueryParam('openpanel')).toBe('social');
//        });
//
//    });
//});

//xdescribe({'FirstTimeVisitorEditorUIPreview': 'New'}, "FirstTimeVisitorEditorUIPreview", function () {
//    describe('EditorUI component', function(){
//        beforeEach(function() {
//            this.testComp = W.Components.createComponent(
//                'wysiwyg.editor.components.EditorUI',
//                'wysiwyg.editor.skins.EditorUISkin',
//                undefined,
//                {labelText: ''},
//                null,
//                function(logic){
//                    this.logic = logic;
//                    this.logic.removeState('fullPreview', 'tabsPreview');
//                    this.isComplete = true;
//                }.bind(this)
//            );
//
//            waitsFor( function(){
//                return this.isComplete;
//            }.bind(this), 'EditorUI component creation', 1000);
//        });
//
//        it('should set `fullPreview` state for FirstTimeUser', function(){
//            spyOn(this.logic, '_isFirstTimeUser').andReturn(true);
//            this.logic._setPreviewMode();
//            expect(this.logic.getState('tabsPreview')).toEqual('fullPreview');
//        });
//
//        it('should NOT set `fullPreview` FistTimeUser state to a NonFirstTimeUser', function(){
//            spyOn(this.logic, '_isFirstTimeUser').andReturn(false);
//            this.logic._setPreviewMode();
//            expect(this.logic.getState('tabsPreview')).toEqual('');
//        });
//
//        it('should add `previewUncollapsed` state to Tabs WButton after FirstTimeMouseOver by a FirstTimeUser', function(){
//            spyOn(this.logic, '_isFirstTimeUser').andReturn(true);
//
//            this.logic._skinParts.mainTabs.render();
//            this._btn = this.logic._skinParts.mainTabs.getItemsContainer().getChildren()[0];
//
//            waitsFor(function(){
//                return this._btn.getLogic != undefined;
//            }.bind(this), 'Tabs WButton creation', 1000);
//
//            runs(function() {
//                this.logic._setPreviewMode();
//                var invalidButtonStates = this.logic._skinParts.mainTabs.getItemsContainer().getChildren().filter(function(btn){
//                    return btn.getLogic().getState('tabButtonPreviewState') != 'previewUncollapsed'
//                }).length;
//
//                expect(!!invalidButtonStates).toBeFalsy();
//            }.bind(this));
//        });
//
//        it('should add `previewCollapsed` state to Tabs WButtons on mouseleave event', function(){
//            spyOn(this.logic, '_isFirstTimeUser').andReturn(true);
//
//            this.logic._skinParts.mainTabs.render();
//            this._btn = this.logic._skinParts.mainTabs.getItemsContainer().getChildren()[0];
//
//            waitsFor(function(){
//                return this._btn.getLogic != undefined;
//            }.bind(this), 'Tabs WButton creation', 1000);
//
//            runs(function() {
//                this.logic._setPreviewMode();
//                this.logic._onPreviewedButtonLeave({type:'mouseleave', target:this._btn});
//                expect(this._btn.getLogic().getState('tabButtonPreviewState')).toEqual('previewCollapsed');
//            }.bind(this));
//        });
//
//        it('should reset the entire `fullPreview` state when a tab button is clicked', function(){
//            spyOn(this.logic, '_isFirstTimeUser').andReturn(true);
//
//            this.logic._skinParts.mainTabs.render();
//            this._btn = this.logic._skinParts.mainTabs.getItemsContainer().getChildren()[0];
//
//            waitsFor(function(){
//                return this._btn.getLogic != undefined;
//            }.bind(this), 'Tabs WButton creation', 1000);
//
//            runs(function() {
//                this.logic._setPreviewMode();
//                this.logic._onPreviewedButtonClick({type:'click',target:this._btn});
//                expect(this.logic.toHaveBeenCalled()).toEqual("");
//            }.bind(this));
//        });
//    });
//});