/**
 * @class wysiwyg.editor.managers.preview.PreviewPageStuff
 * @lends wysiwyg.editor.managers.WPreviewManager
 * I think MobileEditor1 should remove this class
 */
define.Class('wysiwyg.editor.managers.preview.PreviewPageStuff', function(classDefinition){
    /** @type bootstrap.managers.classmanager.ClassDefinition */
    var def = classDefinition;

    /** @lends wysiwyg.editor.managers.WPreviewManager */
    def.methods({
        // TODO (URI): this should be in W.PageManager (when it will be created)
        savePagesHashes : function(){
            W.PageManager = W.PageManager || {};
            W.PageManager._hashes = {};

            var pages = W.Preview.getPreviewManagers().Viewer.getPages();
            for(var pageName in pages) {
                var page = pages[pageName];
                var hash = 'not-rendered';
                if(page.getLogic && page.getLogic().isContentReady()){
                    var serializedPage = JSON.stringify(W.CompSerializer.serializeComponent(page));
                    hash = W.Utils.hashing.SHA256.hex_sha256(serializedPage);
                }
                W.PageManager._hashes[page.get('id')] = hash;
            }

            this._saveMasterPageHash();
        },

        _saveMasterPageHash : function(){
            var site =  W.Preview.getPreviewSite();
            var htmlStructure = W.Preview.getSiteNode();
            var components = W.CompSerializer.serializeComponents(
                htmlStructure.getChildren("[comp]"),
                undefined,

                function(node) {
                    return W.Editor.isPageComponent(node.get('comp'));
                }
            );
            var serializedMasterPage = {
                "type" : "Document",
                "children" : components
            };
            var masterPageHash = W.Utils.hashing.SHA256.hex_sha256(JSON.stringify(serializedMasterPage));
            W.PageManager._hashes['masterPage'] = masterPageHash;
        }
    });
});