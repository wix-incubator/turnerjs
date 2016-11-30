define.Class('wysiwyg.editor.managers.undoredomanager.BaseChange', function (classDefinition) {
    /**@type bootstrap.managers.classmanager.ClassDefinition */
    var def = classDefinition;

    def.inherits('bootstrap.utils.Events');

    def.binds(['_onChange']);

    def.methods({

        /** Abstract method (ya'ani) - please implement */
        startListen: function () {
            //override me!
        },

        /** Abstract method (ya'ani) - please implement */
        stopListen: function () {
            //override me!
        },

        /** Abstract method (ya'ani) - please implement */
        undo: function (changeData) {
            //override me!
        },

        /** Abstract method (ya'ani) - please implement */
        redo: function (changeData) {
            //override me!
        },


        initialize: function () {
        },

        getPreliminaryActions:function (data) {
            return null;
        },

        getModuleFinished: function () {
            return true;
        },

        postEnforceAnchors: function () {
            // do nothing
        },

        _onChange: function (ev) {
            var changeData = ev.data || ev;
            changeData.type = this.getOriginalClassName();
            this.fireEvent(Constants.UrmEvents.DATA_CHANGE_RECORDED, changeData);
        }


    });
});

