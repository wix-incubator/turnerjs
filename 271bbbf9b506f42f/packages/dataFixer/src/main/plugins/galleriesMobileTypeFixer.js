define(['lodash',
    'dataFixer/helpers/CompsMigrationHelper',
    'dataFixer/maps/galleryTypes'], function(_, CompsMigrationHelper, galleryTypes){
    'use strict';

    //we assume that the desktop page run before the mobile comps in the helper
    function compMigrationFunction(pageJson, cache, isMobile, comp){
        if (!isMobile){
            cache[comp.id] = comp;
            return;
        }
        var desktopComp = cache[comp.id];
        if (desktopComp.componentType === comp.componentType){
            return;
        }
        var correctCompType = desktopComp.componentType;
        comp.componentType = correctCompType;
        var compProperties = this.getComponentProperties(pageJson, comp);
        var correctPropType = galleryTypes[correctCompType].propType;
        if (correctCompType && (!compProperties || compProperties.type !== correctPropType)){
            comp.propertyQuery = desktopComp.propertyQuery;
        }
    }

    return {
        exec: function (pageJson) {
            var map = _.mapValues(galleryTypes, function(){
                return compMigrationFunction;
            });
            var helper = new CompsMigrationHelper(map);

            helper.migratePage(pageJson);

        }
    };
});
