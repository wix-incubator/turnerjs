/**
 * @class wysiwyg.deployment.it.editor.TempDriver
 *
 *
 * This "driver" is only for local modifications. Any functionality pushed on it will be reverted!!
 *
 */
define.Class("wysiwyg.deployment.it.editor.TempDriver", function (classDefinition) {
    /**
     * type
     */
    var def = classDefinition;

    /**
     * lends
     */
//    def.fields({
//
//    });

//    def.resources([]);

    /**
     * lends
     */
    def.methods({

        initialize: function () {

        },

        isReady: function () {
            return true;
        },

        foo: function () {
            return "Foo!";
        }


    });
});
