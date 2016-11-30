describe("FullStructureSerializer", function(){
    testRequire().classes('wysiwyg.editor.managers.preview.FullStructureSerializer', 'wysiwyg.editor.managers.preview.MultipleViewersHandler').
        resources('W.Preview');

    var mockStructure1 = {
        'masterPage': {'a':1},
        'pages':{
            'page1': {'p':1},
            'page2': 'page2',
            'page3': {'p': 3}
        }
    };
    var mockStructureWithEmpty = {
        'masterPage': {'a': 2},
        'pages':{
            'page1': {'p': 1},
            'page2': null,
            'page3': {'p': 1}
        }
    };

    beforeEach(function(){
        var multiViewers = new this.MultipleViewersHandler(this.W.Preview);
        this._handler = new this.FullStructureSerializer(multiViewers);
    });


    describe("getChangedFullSiteStructure", function(){
        function prepareForChanged(handler, beforeStructure, afterStructure){
            spyOn(handler, '_getFullSiteStructureAtLoadTime').andReturn(beforeStructure);
            handler.saveStructureOnSiteLoad();

            spyOn(handler, 'getFullSiteStructureUpdateSecondary').andReturn(afterStructure);
        }

        function getExpectedChange(updated, deleted, master){
            return {
                'updatedPages': updated || [],
                'deletedPageIds': deleted || [],
                'masterPage': master || null
            };
        }

        it("should return changed master if only the master was changed", function(){
            var before = {
                'masterPage': {'a':1},
                'pages': {}
            };
            var after = {
                'masterPage': {'a':2},
                'pages': {}
            };
            var expected = getExpectedChange(null, null, after.masterPage);
            prepareForChanged(this._handler, before, after);

            var changed = this._handler.getChangedFullSiteStructure();

            expect(changed).toBeEquivalentTo(expected);
        });
        it("should not return the master if wasn't changed", function(){
            var before = {
                'masterPage': {'a':1},
                'pages': {}
            };
            var after = {
                'masterPage': {'a':1},
                'pages': {}
            };
            var expected = getExpectedChange(null, null, null);
            prepareForChanged(this._handler, before, after);

            var changed = this._handler.getChangedFullSiteStructure();

            expect(changed).toBeEquivalentTo(expected);
        });
        it("should return updated pages", function(){
            var before = {
                'masterPage': {'a':1},
                'pages': {
                    'page1': {'id': 'page1', 'p1': 1},
                    'page2': {'id': 'page2', 'p2': 1},
                    'page3': {'id': 'page3', 'p3': 1}
                }
            };
            var after = {
                'masterPage': {'a':1},
                'pages': {
                    'page1': {'id': 'page1', 'p1': 2},
                    'page2': {'id': 'page2', 'p2': 1},
                    'page3': {'id': 'page3', 'p3': 2}
                }
            };
            var expected = getExpectedChange([after.pages.page1, after.pages.page3], null, null);
            prepareForChanged(this._handler, before, after);

            var changed = this._handler.getChangedFullSiteStructure();

            expect(changed).toBeEquivalentTo(expected);
        });
        it("should return empty updated pages if non were changed", function(){
            var before = {
                'masterPage': {'a':1},
                'pages': {
                    'page1': {'id': 'page1', 'p1': 1},
                    'page2': {'id': 'page2', 'p2': 1}
                }
            };
            var after = {
                'masterPage': {'a':1},
                'pages': {
                    'page1': {'id': 'page1', 'p1': 1},
                    'page2': {'id': 'page2', 'p2': 1}
                }
            };
            var expected = getExpectedChange(null, null, null);
            prepareForChanged(this._handler, before, after);

            var changed = this._handler.getChangedFullSiteStructure();

            expect(changed).toBeEquivalentTo(expected);
        });
        it("should return newly added page as updated", function(){
            var before = {
                'masterPage': {'a':1},
                'pages': {
                    'page1': {'id': 'page1', 'p1': 1},
                    'page2': {'id': 'page2', 'p2': 1}
                }
            };
            var after = {
                'masterPage': {'a':1},
                'pages': {
                    'page1': {'id': 'page1', 'p1': 1},
                    'page2': {'id': 'page2', 'p2': 1},
                    'page3': {'id': 'page3', 'p2': 2}
                }
            };
            var expected = getExpectedChange([after.pages.page3], null, null);
            prepareForChanged(this._handler, before, after);

            var changed = this._handler.getChangedFullSiteStructure();

            expect(changed).toBeEquivalentTo(expected);
        });
        it("should return deleted pages", function(){
            var before = {
                'masterPage': {'a':1},
                'pages': {
                    'page1': {'id': 'page1', 'p1': 1},
                    'page2': {'id': 'page2', 'p2': 1},
                    'page3': {'id': 'page2', 'p3': 1}
                }
            };
            var after = {
                'masterPage': {'a':1},
                'pages': {
                    'page2': {'id': 'page2', 'p2': 1}
                }
            };
            var expected = getExpectedChange(null, ['page1', 'page3'], null);
            prepareForChanged(this._handler, before, after);

            var changed = this._handler.getChangedFullSiteStructure();

            expect(changed).toBeEquivalentTo(expected);
        });
    });

});