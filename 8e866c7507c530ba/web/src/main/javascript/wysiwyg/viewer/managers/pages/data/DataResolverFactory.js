define.Class('wysiwyg.viewer.managers.pages.data.DataResolverFactory', function (classDefinition) {
    "use strict";
    /**@type bootstrap.managers.classmanager.ClassDefinition */
    var def = classDefinition;


    def.utilize(['wysiwyg.viewer.managers.pages.data.LocalDataResolver',
                 'wysiwyg.viewer.managers.pages.data.RemoteDataResolver',
                 'wysiwyg.viewer.managers.pages.data.StructureDataResolver']);

    def.methods({

        initialize:function(){

        },

        getDataResolver:function () {

            var dataResolver;

            if(window.publicModel && window.publicModel.pageList){
                dataResolver = new this.imports.RemoteDataResolver(window.publicModel);
            } else if(window.siteAsJson) {
                dataResolver = new this.imports.LocalDataResolver(window.siteAsJson);
            } else if(window.wixData){
                dataResolver = new this.imports.StructureDataResolver();
            }

            return dataResolver;
        }
    });
});
