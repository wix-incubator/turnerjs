/**
 * @class wysiwyg.deployment.JasmineViewerHelper
 */
define.Class("wysiwyg.deployment.JasmineViewerHelper", function (classDefinition) {
    var def = classDefinition;

    //def.resources(['W.Data', 'W.CommandsNew', 'W.Commands']);

    def.methods({

//        initialize: function (compId, viewNode, args) {
//            window.viewer = this;
//        },

        isReady: function () {
            return true;
        },

        containsComponent: function (comp) {
            return document.getElements('div[comp=' + comp + ']').length > 0;
        }

    });
});