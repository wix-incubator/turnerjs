describe("test serializePages on lazy serialization", function(){
    testRequire()
        .classes('wysiwyg.editor.managers.preview.SiteStructureSerializer')
        .resources('W.Preview');


    var pageAViewNode = new Element('div', {'id': 'page1'});
    var pageBViewNode = new Element('div', {'id': 'page2'});
    pageBViewNode.$logic = {};
    var siteView = {
        getPages: function() {
            return {
                'page_a': pageAViewNode,
                'page_b': pageBViewNode
            }
        }
    };

    beforeEach(function(){
        this._structureSerializer = new this.SiteStructureSerializer('DESKTOP', this.W.Preview);
        spyOn(this._structureSerializer, '_getSiteView').andReturn(siteView);
    });

    it("should not serialize unwixified pages", function(){
        spyOn(this._structureSerializer, '_isValidPage').andReturn(true);
        spyOn(this._structureSerializer._compSerializer, 'serializeComponent').andReturn({id: 'page_b'});

        var serializedPages = this._structureSerializer.serializePages();

        expect(JSON.stringify(serializedPages)).toBeEquivalentTo('{"page_b":{"id":"page_b"}}');
    });
});
