/*global window, document, $, Wix, angular, translation*/

translation.service('translationService', [function(){
    this.data = {
        translation: {}
    };

    this.setTranslation = function(translation){
        this.data.translation = translation;
    };
}]);