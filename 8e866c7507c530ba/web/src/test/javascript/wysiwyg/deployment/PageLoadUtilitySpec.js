describe("PageLoadUtility", function(){
    testRequire().resources('W.Utils')
        .classes('deployment.PageLoadUtility');

    beforeEach(function(){
        this.pageUtils = new this.PageLoadUtility();
    });
    describe("getFirstPageId", function(){
        it("should return the page from the hash if regular page", function(){
            spyOn(this.W.Utils.hash, 'getHashParts').andReturn({'id':'page1'});
            var pagesIds = ['page1', 'page2'];

            var firstPage = this.pageUtils.getFirstPageId(pagesIds, 'page2');

            expect(firstPage).toBe('page1');
        });
        it("should return the page from the hash if image zoom", function(){
            spyOn(this.W.Utils.hash, 'getHashParts').andReturn({'id':'zoom', 'extData':'page1/asdf'});
            var pagesIds = ['page1', 'page2'];

            var firstPage = this.pageUtils.getFirstPageId(pagesIds, 'page2');

            expect(firstPage).toBe('page1');
        });
        it("should return the main page passed if there is no hash", function(){
            spyOn(this.W.Utils.hash, 'getHashParts').andReturn({});
            var pagesIds = ['page1', 'page2'];

            var firstPage = this.pageUtils.getFirstPageId(pagesIds, 'page2');

            expect(firstPage).toBe('page2');
        });
        it("should return the main page passed if the id in the hash doesn't exist in the page list", function(){
            spyOn(this.W.Utils.hash, 'getHashParts').andReturn({'id':'blabla'});
            var pagesIds = ['page1', 'page2'];

            var firstPage = this.pageUtils.getFirstPageId(pagesIds, 'page2');

            expect(firstPage).toBe('page2');
        });
        it("should return the the 1st page in the list if all other options failed, no main page passed", function(){
            spyOn(this.W.Utils.hash, 'getHashParts').andReturn({});
            var pagesIds = ['page1', 'page2'];

            var firstPage = this.pageUtils.getFirstPageId(pagesIds);

            expect(firstPage).toBe('page1');
        });
        it("should return the the 1st page in the list if all other options failed", function(){
            spyOn(this.W.Utils.hash, 'getHashParts').andReturn({});
            var pagesIds = ['page1', 'page2'];

            var firstPage = this.pageUtils.getFirstPageId(pagesIds, 'blabla');

            expect(firstPage).toBe('page1');
        });
    });
});