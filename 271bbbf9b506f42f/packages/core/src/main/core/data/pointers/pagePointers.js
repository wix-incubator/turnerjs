define(['lodash', 'core/core/data/pointers/pointerGeneratorsRegistry'], function(_, pointerGeneratorsRegistry){
    "use strict";

    var PAGE_POINTER_TYPE = 'page';

    pointerGeneratorsRegistry.registerPointerType(PAGE_POINTER_TYPE, function(){ return null; }, function(){ return true; }, false, true);

    var getterFunctions = {
        isPointerPageType: function(getItemAtPath, cache, pointer) {
            return pointer && pointer.type === PAGE_POINTER_TYPE;
        },

        getNewPagePointer: function(getItemAtPath, cache, pageId){
            var path = ['pagesData', pageId];
            return cache.getPointer(pageId, PAGE_POINTER_TYPE, path);
        },

        getPagePointer: function(getItemAtPath, cache, pageId){
            var path = ['pagesData', pageId];
            var page = getItemAtPath(path);
            if (_.isUndefined(page)){
                return null;
            }
            return cache.getPointer(pageId, PAGE_POINTER_TYPE, path);
        },

        isExists: function(getItemAtPath, cache, pageId) {
            var path = ['pagesData', pageId];
            var page = getItemAtPath(path);
            return !_.isUndefined(page);
        },

        getAllPagesPointer: function(getItemAtPath, cache){
            return cache.getPointer('all', PAGE_POINTER_TYPE, ['pagesData']);
        },

        getNonDeletedPagesPointers: function(getItemAtPath, cache, includeMaster){
            includeMaster = _.isUndefined(includeMaster) ? false : includeMaster;
            var path = ['pagesData'];
            var pages = getItemAtPath(path);

            pages = _.pick(pages, function (value, pageId){
                if (!value){
                    return false;
                }

                if (!includeMaster && pageId === 'masterPage'){
                    return false;
                }

                return true;
            });

            return _.map(pages, function(value, pageId){
                return cache.getPointer(pageId, PAGE_POINTER_TYPE, path.concat(pageId));
            });
        },

        getPageData: function(getItemAtPath, cache, pageId){
            var path = ['pagesData', pageId, 'data', 'document_data'];
            var page = getItemAtPath(path);
            if (!page){
                return null;
            }
            return cache.getPointer(pageId + '_data', PAGE_POINTER_TYPE, path);
        },

        getPageProperties: function(getItemAtPath, cache, pageId){
            var path = ['pagesData', pageId, 'data', 'component_properties'];
            var page = getItemAtPath(path);
            if (!page){
                return null;
            }
            return cache.getPointer(pageId + '_prop', PAGE_POINTER_TYPE, path);
        },

        getPageDesignData: function(getItemAtPath, cache, pageId) {
            var path = ['pagesData', pageId, 'data', 'design_data'];
            var page = getItemAtPath(path);
            if (!page){
                return null;
            }
            return cache.getPointer(pageId + '_design', PAGE_POINTER_TYPE, path);
        }
    };

    pointerGeneratorsRegistry.registerDataAccessPointersGenerator(PAGE_POINTER_TYPE, getterFunctions);

});
