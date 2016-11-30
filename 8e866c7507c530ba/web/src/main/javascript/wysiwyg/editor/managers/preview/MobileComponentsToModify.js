define.Class('wysiwyg.editor.managers.preview.MobileComponentsToModify', function (classDefinition) {

    /**@type bootstrap.managers.classmanager.ClassDefinition */
    var def = classDefinition;

    def.methods({

        initialize: function () {
            this._componentsToModify = {
                'wysiwyg.viewer.components.MatrixGallery': {
                    'margin': function (compRawProp) {
                        if (compRawProp > 20) {
                            return 20;
                        } else {
                            return compRawProp;
                        }
                    },
                    'numCols': function (compRawProp) {
                        if (compRawProp >= 2) {
                            return 2;
                        } else {
                            return 1;
                        }
                    }
                },
                'wysiwyg.viewer.components.PaginatedGridGallery': {
                    'margin': function (compRawProp) {
                        if (compRawProp > 20) {
                            return 20;
                        } else {
                            return compRawProp;
                        }
                    },
                    'numCols': function (compRawProp) {
                        if (compRawProp >= 2) {
                            return 2;
                        } else {
                            return compRawProp;
                        }
                    }
                },
                'wysiwyg.viewer.components.WGooglePlusOne':{
                    'size':function(compRawProp){
                        return 'standard';
                    }
                },
                'wysiwyg.viewer.components.LinkBar':{
                    iconSize:function(){
                        return 40;
                    },
                    spacing:function(){
                        return 9;
                    }
                },
                'wysiwyg.viewer.components.Video':{
                    autoplay: function(compRawProp) {
                        return false;
                    }
                },
                'tpa.viewer.components.Thumbnails':{
                    textMode: function(compRawProp) {
                        return 'noText';
                    }
                },
				'tpa.viewer.components.Masonry':{
					numCols: function(compRawProp) {
						return 2;
					},
					margin: function(compRawProp) {
						return  (compRawProp <=3) ? compRawProp : 15;
					},
					textMode: function(compRawProp) {
						if (compRawProp == 'titleAndDescription') {
							compRawProp = 'titleOnly';
						} else if (compRawProp == 'descriptionOnly') {
							compRawProp = 'noText';
						}

						return compRawProp;
					}
				}
            };
        },

        getComponentsToModifyMap: function() {
            return this._componentsToModify;
        }
    });
});