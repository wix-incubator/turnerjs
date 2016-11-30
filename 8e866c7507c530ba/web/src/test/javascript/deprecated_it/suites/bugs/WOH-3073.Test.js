testRequire().classes('wysiwyg.deployment.JasmineEditorHelper');

describe("Highlighting of the site address after publish:", function () {

    beforeEach(function() {
        window.editor = window.editor || new this.JasmineEditorHelper();
    });

    describe("Publish dialog", function () {
        var siteAddressLabel;

        beforeEach(function() {
            W.Commands.executeCommand("WEditorCommands.OpenPublishDialog", {});

            waitsFor(function () {
                siteAddressLabel = siteAddressLabel || getSiteAddressElement();
                return siteAddressLabel;
            }, "publish dialog to load", 1000);
        });

        it('Should run this test only in editor mode of a published site', function (){
            var isSitePublished = (window.editorModel) ? editorModel.siteHeader.published : false;

            expect(isSitePublished).toBeTruthy();
        });

        it("Should have the site address be selectable", function () {
            var userSelectAttr = siteAddressLabel.getComputedStyle('-webkit-user-select');

            expect(userSelectAttr).toEqual('text');
        });
    });


    function getSiteAddressElement(){
        try {
            var publishDialogChildren = $$('[comp=wysiwyg.editor.components.dialogs.PublishWebsiteDialog] div[skinpart=content]')[0].getChildren();
            var siteAddressContainer = publishDialogChildren.filter(function(el){return el.innerHTML.indexOf(W.Resources.get('EDITOR_LANGUAGE','PUBLISH_WEB_URL_LABEL')) > -1;})[0];
            var siteAddressLabel = siteAddressContainer.getChildren()[0].getChildren('.buttonTextArea span[skinpart=button] span[skinpart=label]')[0];
        } catch(e) {
            return null;
        }

        return siteAddressLabel;
    }
});