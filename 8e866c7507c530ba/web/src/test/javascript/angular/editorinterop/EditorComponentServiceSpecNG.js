describe('Unit: EditorComponent', function () {
    'use strict';


    var editorComponent, editedComponent;


    beforeEach(module('editorInterop'));

    beforeEach(inject(function (_editorComponent_) {
        editorComponent = _editorComponent_;
    }));

    describe('EditorComponent - ', function () {

        beforeEach(function () {
            editedComponent = W.Editor.getEditedComponent();
        });

        it('gets the edited component', function () {
            var currentEditedComponent = editorComponent.getEditedComponent();
            expect(currentEditedComponent).toEqual(editedComponent);
        });

        describe('get the correct component data', function(){

            var compData;
            beforeEach(function(){
                compData = editorComponent.getComponentData();
            });

            it ('gets the correct component Label', function(){
                expect(compData.label).toEqual('component');
            });

            describe('- Component help id -', function() {
                it('should be retrieved from the component\'s getHelpId method if exists', function() {
                    spyOn(editedComponent, 'getHelpId').and.returnValue('getHelpIdResult');

                    compData = editorComponent.getComponentData();

                    expect(compData.helpId).toEqual('getHelpIdResult');
                });

                it('should set it to the app definition id if comp is TPA', function() {
                    var origGetHelpId = editedComponent.getHelpId;
                    editedComponent.getHelpId = null;
                    editedComponent.isTpa = true;
                    editedComponent.getAppData = function() {
                        return {
                            appDefinitionId: 'someDefinition'
                        };
                    };

                    compData = editorComponent.getComponentData();

                    expect(compData.helpId).toEqual('/app/someDefinition');

                    // cleanup
                    editedComponent.getHelpId = origGetHelpId;
                    editedComponent.isTpa = false;
                    editedComponent.getAppData = null;
                });

                it('should fallback to component information helpId if available', function() {
                    var origGetHelpId = editedComponent.getHelpId;
                    editedComponent.getHelpId = null;

                    compData = editorComponent.getComponentData();

                    expect(compData.helpId).toEqual('my.very.nice.component_helpId');

                    // cleanup
                    editedComponent.getHelpId = origGetHelpId;
                });

                it('should fallback to default label by component class name', function() {
                    var origGetHelpId = editedComponent.getHelpId;
                    editedComponent.getHelpId = null;

                    var previewManagers = W.Preview.getPreviewManagers();
                    spyOn(previewManagers.Components, 'getComponentInformation');

                    compData = editorComponent.getComponentData();

                    expect(compData.helpId).toEqual('COMPONENT_PANEL_component');

                    // cleanup
                    editedComponent.getHelpId = origGetHelpId;
                });
            });

            it ('destroys old dataItem when setting two comps ', function(){
                var data = compData.data;
                spyOn(data, 'destroy');
                compData = editorComponent.getComponentData();
                expect(data.destroy).toHaveBeenCalled();
            });

            it ('destroys the comp data when calling destroy', function(){
                var data = compData.data;
                spyOn(data, 'destroy');
                compData.destroy();
                expect(data.destroy).toHaveBeenCalled();
            });
        });

        describe('it gets a correct legacy panel', function(){
           it ('it gets the legacy panel', function(){
               var panel = editorComponent.getLegacyPanel();
           });
        });




    });

});