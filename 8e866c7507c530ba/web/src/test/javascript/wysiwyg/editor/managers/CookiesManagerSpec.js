describe('CookiesManager', function() {
    describe('testing setcookieparams', function(){
        it('should create new cookie (yeah, with mootools)', function(){
            W.CookiesManager.removeCookie("testingCookie");
            W.CookiesManager.setCookieParam("testingCookie","one");
            var theCookie = Cookie.read("testingCookie");
            expect(theCookie).toBeEquivalentTo("one");
        });
        it('should add another vale without deleting the old value', function(){
            W.CookiesManager.setCookieParam("testingCookie","two");
            var theCookie = Cookie.read("testingCookie");
            expect(theCookie).toBeEquivalentTo("one,two");
        });
        it('should get cookie params / get empty array if no cookie', function(){
            var params = W.CookiesManager.getCookieParams("testingCookie");
            expect(params).toBeEquivalentTo(["one","two"]);
            expect(typeOf(params)).toBeEquivalentTo("array");
            var emptyParams = W.CookiesManager.getCookieParams("kie");
            expect(emptyParams).toBeEquivalentTo([]);
        });
        it('should remove cookie param', function(){
            W.CookiesManager.removeCookieParam("testingCookie","one");
            var theCookie = Cookie.read("testingCookie");
            expect(theCookie).toBeEquivalentTo("two");
        });
        it('should remove all cookie params', function(){
            W.CookiesManager.setCookieParam("testingCookie","lala");
            W.CookiesManager.setCookieParam("testingCookie","dada");
            W.CookiesManager.removeCookie("testingCookie");
            var theCookie = Cookie.read("testingCookie");
            expect(theCookie).toBeEquivalentTo("");
        });
    });
});