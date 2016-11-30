define.experiment.Class('wysiwyg.viewer.components.traits.MediaTextHandler.BlogManager', function (classDefinition, experimentStrategy) {

    /**@type bootstrap.managers.classmanager.ClassDefinition*/
    var def = classDefinition;
    /**@type bootstrap.managers.experiments.ExperimentStrategy*/
    var strategy = experimentStrategy;

    def.methods({
        getCompCoverPhoto: function(mediaText) {
            var wixCompRegEx = /wix-comp=[\"']({.*?})[\"']/g;
            var allImages = this._getAllMatches(mediaText, /\<\s*img[^>]*\>/g);
            var coverPhoto = _.filter(allImages, function(img) {
                return _.contains(img[0], 'post-cover-photo');
            });

            var selectedCover = (coverPhoto.length ? coverPhoto[0] : allImages[0]);
            if(selectedCover) {
                var selectedWixComp = wixCompRegEx.exec(selectedCover[0]);
                if(selectedWixComp) {
                    return JSON.parse(this._decodeJsonData(selectedWixComp[1]));
                }
                else {
                    return {componentType: "default"};
                }
            } else {
                return {componentType: "default"};
            }
        },

        getCoverImage: function(mediaText) {
            var allImages = this._getAllMatches(mediaText, /<\s*img[^>]*\>/g);
            var coverPhoto = _.filter(allImages, function(img) {
                return _.contains(img[0], 'post-cover-photo');
            });

            var selectedCover = (coverPhoto.length ? coverPhoto[0] : allImages[0]);
            if(selectedCover) {
                return selectedCover[0];
            }
        }
    });
});