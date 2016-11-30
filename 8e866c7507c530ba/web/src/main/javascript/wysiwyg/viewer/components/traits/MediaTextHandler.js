define.Class('wysiwyg.viewer.components.traits.MediaTextHandler', function (classDefinition, strategy) {
    /**@type wysiwyg.viewer.components.traits.MediaTextHandler */
    var def = classDefinition;

    def.methods({

        /**
         * Parses html data in the format for media text with placeholders and returns them as json objects.
         * @param mediaText
         * @returns {Array|*}
         */
        getCompPlaceholdersJsonData: function(mediaText){

            var placeHolders = this._getAllMatches(mediaText, new RegExp("wix-comp=[\"']({.*?})[\"']", "g"));
            return _.map(placeHolders, function(currentPh){
                return JSON.parse(this._decodeJsonData(currentPh[1]));
            }.bind(this));
        },

        _createImagePropertiesItem: function(dataQuery){
            W.ComponentData.addDataItem(dataQuery, {
                type: "WPhotoProperties",
                displayMode: "fitWidth",
                id: dataQuery
            });
        },

        /**
         * Clear placeholders from text
         */
        cleanText: function(mediaRichText){
            // If the user inserted multiple images to a post, getting rid of them will result with empty hatuls which will create line breaks, so we get rid of them too
            var hatulStart = '<hatul[^>]*>';
            var hatulEnd = '</hatul>';
            var img = '<img[\\s\\S]+?wix-comp=[^>]*>';
            var res = mediaRichText.replace(new RegExp(hatulStart + img + hatulEnd + '\\s*(' + hatulStart + '&nbsp;' + hatulEnd + ')?', 'g'), '');
            // In an older version of the blog-manager images weren't werapped by hatuls - so remove them as well... (I know - it's a fucking complicated function)
            res = res.replace(/(<img[\s\S]+?wix-comp=[^>]*>)/g, "");
            return res;
        },

        _getAllMatches: function (str, regex) {
            var myArray, elements = [];
            while ((myArray = regex.exec(str)) !== null) {
                elements.push(myArray);
            }
            return elements;
        },

        _decodeJsonData: function(jsonStr) {
            return jsonStr.replace(/&amp;/g, "&").replace(/&quot;/g, "\"").replace(/&gt;/g, ">").replace(/&lt;/g, "<").replace(/&apos;/g, "'");
        },

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








