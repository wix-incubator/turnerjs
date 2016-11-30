/*
* settings for lodash.js
*
* */

// configure lodash to support mustache-like templating
_.templateSettings = {
    'interpolate': /{{([\s\S]+?)}}/g
};

/**
 * _.inner : Will return an inner object for a datapath, and will create one if it doesn't exist.
 * @param {object} obj - the object to search for an inner object/property
 * @param {string} path - a string representing the inner object, in the way it would normally be accessed - i.e. 'property.innerProp.evenDeeperProp.whichIamNotSure.ThatItExists'
 */
_.mixin({
    'inner': function(obj,path){
        var dataPathParts = path.split('.');
        var result = obj;
        for(var i=0; i<dataPathParts.length; i++){
            var key = dataPathParts[i];
            if(!result[key]){
                result[key] = {};
            }
            result = result[key];
        }
        return result;
    }
});

