/**@class wysiwyg.common.components.newmusicplayer.viewer.compmembers.MiscFunctions*/
define.Class('wysiwyg.common.components.singleaudioplayer.viewer.compmembers.MiscFunctions', function (classDefinition) {
    /**@type bootstrap.managers.classmanager.ClassDefinition*/
    var def = classDefinition;

    /**@lends wysiwyg.common.components.newmusicplayer.viewer.compmembers.MiscFunctions*/
    def.methods({
        switchSelectors: function (elem, addSelector, removeSelector) {
            elem.addClass(addSelector);
            elem.removeClass(removeSelector);
        },

        toggleSelectors: function (condition, element, addSelector, removeSelector) {
            if (condition) {
                this.switchSelectors(element, addSelector, removeSelector);
            } else {
                this.switchSelectors(element, removeSelector, addSelector);
            }
        }
    });
});