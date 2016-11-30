describe("LocalDataResolver", function(){
    testRequire().classes('wysiwyg.viewer.managers.pages.data.LocalDataResolver');

    var fullSiteData = {
        'masterPage':{
            'structure':{
                'children':{'m': 1},
                'mobileComponents':{'m': 2}
            },
            'data': {}
        },
        'pages':{
            'page1':{
                'structure':{
                    'id': 'page1',
                    'components': {'p1': 1},
                    'mobileComponents':{'p1': 2}
                },
                'data': {}
            },
            'page2':{
                'structure':{
                    'id': 'page2',
                    'components': {'p2': 1},
                    'mobileComponents':{'p2': 2}
                },
                'data': {}
            }
        }
    };


    describe("LocalDataResolver", function(){
        describe("_getSerializedStructureForSingleView_ partial structure loaded", function(){

            beforeEach(function(){
                this._resolver = new this.LocalDataResolver(fullSiteData);
                this._resolver._pagesData = {'page2': fullSiteData.pages['page2']};
                spyOn(this._resolver, '_setData');
                spyOn(this._resolver, 'getMainPageId').andReturn('page2');
            });
            it("should return the single desktop structure", function(){
                var structure = this._resolver._getSerializedStructureForSingleView_('DESKTOP');
                var expected = {
                    'masterPage':{
                        'children':{'m': 1}
                    },
                    'pages':{
                        'page2':{
                            'id': 'page2',
                            'components': {'p2': 1}
                        }
                    }
                };
                expect(structure).toBeEquivalentTo(expected, null, JSON.stringify(structure));
            });

            it("should return the single partial mobile structure", function(){
                var structure =  this._resolver._getSerializedStructureForSingleView_('MOBILE');
                var expected = {
                    'masterPage':{
                        'children':{'m': 2}
                    },
                    'pages':{
                        'page2':{
                            'id': 'page2',
                            'components':{'p2': 2}
                        }
                    }
                };
                expect(structure).toBeEquivalentTo(expected, null, JSON.stringify(structure));
            });
        });

    });
});