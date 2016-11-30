describe("test lock feature", function () {


    var component = null;


    it("test component lock action", function () {
        var compSize = null;
        automation.Utils.waitsForPromise(function() {
            return Q()
                .then(function () {
                    return automation.viewercomponents.ViewerComponent.addComponent("WPhoto");
                })
                .then(function(comp) {
                     component = comp;
                     W.Commands.executeCommand('EditCommands.Lock', {source:"FppLockButton"});
                     var compEditBox = W.Editor.getComponentEditBox();
                     expect(compEditBox.isComponentLocked()).toBeTruthy();
                 });

        });

    });


    it("test component lock action", function () {
        var compSize = null;
        automation.Utils.waitsForPromise(function() {
            return Q()
                .then(function () {
                    return automation.viewercomponents.ViewerComponent.addComponent("WPhoto");
                })
                then(function(comp) {
                    component = comp;
                    W.Commands.executeCommand('EditCommands.Lock', {source:"FppLockButton"});
                    var compEditBox = W.Editor.getComponentEditBox();
                    expect(compEditBox.isComponentLocked()).toBeTruthy();
                })
                .then(function(component) {
                    compSize = component.$view.getSize();
                    return automation.Component.resizeComponent(component, {x: 500, y: 500}, automation.Component.componentEdges.LEFT);
                })
                .then(function(){
                    expect(component.$view.getSize()).toEqual(compSize);
                });



        });

    });

    xit("test component unlock action", function () {
        var compSize = null;
        automation.Utils.waitsForPromise(function() {
            return Q()
                .then(function() {
                    W.Commands.executeCommand('EditCommands.UnLock', {source:"FppLockButton"});
                    var compEditBox = W.Editor.getComponentEditBox();
                    expect(!compEditBox.isComponentLocked()).toBeTruthy();
                })
                .then(function() {
                    compSize = component.$view.getSize();
                    var promise = automation.Component.resizeComponent(component, {x: 500, y: 500}, automation.Component.componentEdges.LEFT);
                    setTimeout(function () {
                        return promise;
                    }, 300);
                })
                .then(function(event){
                    expect(component.$view.getSize()).not.toEqual(compSize);
                })

        });

    });


    /*it('waitForDialogWithTitle - should be able to wait until a dialog with title exists', function () {

     automation.Utils.waitsForPromise(function() {
     return Q()
     .then(function() {
     W.EditorDialogs.openAdvancedSeoSettings();
     return automation.editorcomponents.Dialogs.waitForDialogOfType("wysiwyg.editor.components.dialogs.AdvancedSeoSettingsDialog");
     //var cmdParams = {
     //    showCategory: "blog",
     //    widgetId: "31c0cede-09db-4ec7-b760-d375d62101e6"
     //};
     //W.Commands.executeCommand("WEditorCommands.AddWixApp", cmdParams);
     })
     .then(function(dialogLogic) {

     expect(dialogLogic).toBeDefined();
     });
     });

     //W.EditorDialogs.openAdvancedSeoSettings();
     //return automation.editorcomponents.Dialogs.waitForDialogOfType("wysiwyg.editor.components.dialogs.AdvancedSeoSettingsDialog");
    .then(function(comp){
     //expect(comp).toBeDefined();
     return automation.Component.getExactNumberOfComponentsType("wysiwyg.viewer.components.WPhoto",W.Preview.getSiteNode(),1);
     })
     .then(function(comp){
     expect(comp[0].getAttribute("comp")).toEqual("wysiwyg.viewer.components.WPhoto");
     })
     /*
     .then(function(){
     return automation.controllers.Clipboard.paste();
     })
     .then(function () {
     return automation.Component.getExactNumberOfComponentsType("wysiwyg.viewer.components.MatrixGallery",W.Preview.getSiteNode(),2);
     })
     .then(function(comp){
     expect(comp.length).toEqual(2);
     expect(comp[0].getAttribute("comp")).toEqual("wysiwyg.viewer.components.MatrixGallery");
     expect(comp[1].getAttribute("comp")).toEqual("wysiwyg.viewer.components.MatrixGallery");
     });*/
});
