/** @lends Define */
define.addDefinitions({
    /**
     * Defines a migration procedure
     * @param {String} name migration name
     * @param {Function} definition definition(deploymentDef) is called when it's time for migration.
     * deploymentDef is of type {@link bootstrap.bootstrap.deploy.DeploymentDefinition}
     */
    deployment:function (name, definition) {
    },

    /**
     *
     * @param name
     * @param definition
     */
    bootstrapClass:function (name, definition) {
    },

    /**
     * @param {string} name
     * @param {function(bootstrap.managers.classmanager.ClassDefinition)} definition
     */
    Class:function (name, definition) {
    },

    /**
     *
     * @param {Object} oldClassDefinition
     */
    oldClass:function (oldClassDefinition) {
    },

    /**
     *
     * @param {Object} oldComponentDefinition
     */
    oldComponent:function (oldComponentDefinition) {
    },

    /**
     *
     * @param {Object} oldSkinDefinition
     */
    oldSkin:function (oldSkinDefinition) {
    },

    /**
     *
     * @param {Object} oldTraitDefinition
     */
    oldTrait:function (oldTraitDefinition) {
    },

    /**
     *
     * @param name
     * @param value
     */
    Const:function (name, value) {
    },

    /**
     *
     * @param name
     * @param definition
     */
    utils:function (name, definition) {
    },

    /**
     *
     * @param {string} name
     * @param {function(core.managers.component.ComponentDefinition)} definition
     */
    component:function (name, definition) {
    },

    /**
     *
     * @param {string} name
     * @param {function(core.managers.skin.SkinDefinition)} definition
     */
    skin:function (name, definition) {
    },

    /**
     *
     * @param name
     * @param definition
     */
    dataItem:function (name, definition) {
    },

    /**
     *
     * @param name
     * @param definition
     */
    dataThemeItem:function (name, definition) {
    },

    /**
     *
     * @param name
     * @param definition
     */
    dataPropertyItem:function (name, definition) {
    },

    /**
     *
     * @param name
     * @param definition
     */
    dataSchema:function (name, definition) {
    },

    experimentPlugin:function (name, definition) {

    },

    animation: function(name, definition){
    },

    animationEditorPart: function(name, definition){
    },

    transition: function(name, definition){

    },

    experiment:{
        /**
         *
         * @param {String} name - [the original class name].[exp name].[group name]
         * @param {function(bootstrap.managers.classmanager.ClassDefinition, bootstrap.managers.experiments.ExperimentStrategy)} definition
         * @constructor
         */
        Class:function (name, definition) {},

        /**
         *
         * @param {String} name [the original class name].[exp name].[group name]
         * @param {function(bootstrap.managers.classmanager.ClassDefinition)} definition
         * @constructor
         */
        newClass:function (name, definition) {},

        /**
         *
         * @param {string} name
         * @param {function(core.managers.component.ComponentDefinition)} definition
         */
        component:function (name, definition) {},

        /**
         *
         * @param {string} name
         * @param {function(core.managers.component.ComponentDefinition)} definition
         */
        newComponent:function (name, definition) {},

        /**
         *
         * @param name
         * @param value
         */
        Const:function (name, value) {},

        /**
         *
         * @param name
         * @param value
         */
        newConst:function (name, value) {},


        /**
         *
         * @param {String} name -  the name of the skin.ExpName.New
         * @param {function(core.managers.skin.SkinDefinition, bootstrap.managers.experiments.ExperimentStrategy)} definition
         */
        skin:function(name, definition){},

        newSkin:function(name,definition){},

        dataSchema:function(name,value){},

        newDataSchema:function(name,value){},

        /**
         * @param {String} name - [name of data item].[exp name].[group name]
         * @param {function(bootstrap.managers.experiments.ExperimentStrategy): Object} value -
         *      the function should return the data item raw data
         */
        dataItem:function(name, value){},

        newDataItem:function(name,value){},

        dataThemeItem:function(name, value){},

        newDataThemeItem:function(name,value){},

        dataPropertyItem:function(name, value){},

        newDataPropertyItem:function(name,value){},

        newAnimation: function(name, definition){},

        animation: function(name, definition){},

        newAnimationEditorPart: function(name, definition){},

        animationEditorPart: function(name, definition){},

        newTransition: function(name, definition){},

        transition: function(name, definition){}

    },

    /**
     *
     * @param {String} resourceName
     * @param {*?} value use <b>undefined</b> for url-only resources with no default value
     * @param {String?} url
     */
    resource:function (resourceName, value, url) {
    },
    activity:function(name, aliases, def) {
    }
});
