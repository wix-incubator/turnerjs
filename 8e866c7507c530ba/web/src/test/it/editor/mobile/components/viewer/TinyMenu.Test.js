//integration.requireExperiments(['tinytextalign:new']);

describe("Mobile Tiny Menu Component", function () {
    it("should set text alignment", function () {
        automation.Utils.waitsForPromise(function() {
            return Q.resolve()
                .then(function(){
                    return automation.controllers.States.switchToMobileEditor();
                })
                .then(function() {
                    this._tinyMenu = W.Preview.getPreviewManagers().Viewer.getCompByID('mobile_TINY_MENU').getLogic();
                    W.Editor.setSelectedComp(this._tinyMenu);
                    this._tinyMenu.setComponentProperty('direction', 'center');
                })
                .then(function() {
                    W.Commands.executeCommand('WEditorCommands.WSetEditMode', {editMode: "PREVIEW"});
                })
                .then(function() {
                    var comp = this._tinyMenu; //W.Editor.getSelectedComp();

                    var items = comp._skinParts.menuContainer
                        .getChildren('ul')[0]
                        .getChildren('li');

                    var invalidAlignments = _.filter(items, function(item) {
                        return item.getChildren('a')[0].getStyle('text-align') != 'center';
                    }).length;

                    // fail test if no items available
                    if (!!!items.length) {
                        expect(!!items.length).toBeTruthy();
                        return false;
                    }

                    // expect 0 invalid alignments
                    expect(!!invalidAlignments).toBeFalsy();

                });
        });
    });
});
