describe("BrowserUtils",function(){
    testRequire().resources('BrowserUtils');

    describe("getQueryParams",function(){
        it("should return a map of query params",function(){
            spyOn(this.BrowserUtils,'_getQueryString').andReturn("hello=world&foo=bar");
            var data = this.BrowserUtils.getQueryParams();
            expect(data).toBeEquivalentTo({'hello':['world'], 'foo':['bar']});
        });

        it("should return an array if a query is present more then one time",function(){
            spyOn(this.BrowserUtils,'_getQueryString').andReturn("item=hello&item=world&item=foo&item=bar");
            var data = this.BrowserUtils.getQueryParams();
            expect(data).toBeEquivalentTo({'item':['hello','world','foo','bar']});
        });
    });
});