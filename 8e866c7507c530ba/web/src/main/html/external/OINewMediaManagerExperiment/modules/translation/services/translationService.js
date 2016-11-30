/*global window, document, $, angular, translation*/
/**
 * Translation service
 * 
 * Its setTranslation method has to be called to setup the module
 */
translation.service('translationService', [function(){
    /**
     * @type {Object} - data holder for the translation service
     */
    this.translation = {
        /**
         * @type {string} - lang code
         */
        lang: 'en',
        /**
         * @type {Object} - translation key-value map 
         */
        map: {}
    };

    /**
     * Sets translation data for the module. 
     * This method has to be called to setup the module
     * 
     * @param {Object} data - settings object which has to be full set of params or at least a key-value translation map 
     */
    this.setTranslation = function(data){
        this.translation.map = data.map || data;
        
        if (data.lang){
            this.translation.lang = data.lang;
        }
    };

    /**
     * Gets language code
     * 
     * @returns {string}
     */
    this.getLang = function(){
        return this.translation.lang;
    };

    /**
     * Translates by key
     * 
     * @param key - a key to be searched in the translation map
     * @returns {string} - translation or key as it is
     */
    this.translate = function(key){
        return this.translation.map[key] || key;
    };
}]);