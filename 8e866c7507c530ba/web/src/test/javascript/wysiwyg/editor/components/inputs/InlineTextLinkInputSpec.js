// InlineTextLinkInput adds just tiny bits of pieces to ButtonInput, so hardly any tests are needed

describe('wysiwyg.editor.components.inputs.InlineTextLinkInput', function()
{
    testRequire().
        components('wysiwyg.editor.components.inputs.InlineTextLinkInput');

    describe('Generic component tests', function() {
    // General component tests
    ComponentsTestUtil.runBasicComponentTestSuite('wysiwyg.editor.components.inputs.InlineTextLinkInput', 'wysiwyg.editor.skins.inputs.InlineTextLinkInputSkin',  '', {'componentReadyTimeout':1000});
    });

});
