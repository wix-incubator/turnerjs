/**
 * @class bootstrap.managers.BaseManager
 * @extends bootstrap.utils.Events
 */
define.Class("bootstrap.managers.BaseManager", function (classDefinition) {
    /**@type bootstrap.managers.classmanager.ClassDefinition*/
    var def = classDefinition;

    def.inherits("bootstrap.utils.Events");

    /** @lends bootstrap.managers.BaseManager*/
    def.methods({

        isReady:function () {
            return true;
        },

        clone:function (newDefine) {
            var className = this.$className;
            var clone;
//
//            if(/skinManager/i.test(className)){
//                debugger
//            }

            newDefine.getResourceFetcher().getResourceValue('W.Classes', function (classManager) {
                classManager.getClass(className, function (ManagerClass) {
                    clone = new ManagerClass();
                });
            });

            if (!clone) {
                throw new Error('clone failed: ' + className);
            }
            return clone;
        }
    });
    });
