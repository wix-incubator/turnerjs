describe("CookiesSpec", function () {
    var _testCookieName = "CookieForTests";
    var _testCookieValue = "TestValue";

    afterEach(function () {
        W.Utils.cookies.deleteCookie(_testCookieName);
    });

    //we'll run the same tests for both kinds of cookies - session cookies and persistent cookies (the difference is that whether a persistence duration param is supplied or is null)
    function testCookieWithDuration(duration) {
        describe("Cookies with duration " + duration, function () {
            it("should create a new cookie and see that hasCookie returns true. duration=" + duration, function () {
                W.Utils.cookies.createCookie(_testCookieName, _testCookieValue, duration);

                var hasCookie = W.Utils.cookies.hasCookie(_testCookieName);

                expect(hasCookie).toBe(true);
            });

            it("should create a new cookie and read it's value. duration=" + duration, function () {
                W.Utils.cookies.createCookie(_testCookieName, _testCookieValue, duration);

                var cookieValue = W.Utils.cookies.readCookie(_testCookieName);

                expect(cookieValue).toBe(_testCookieValue);
            });

            it("should create a new cookie and then delete and see that it doesn't exist any more. duration=" + duration, function () {
                W.Utils.cookies.createCookie(_testCookieName, _testCookieValue, duration);
                W.Utils.cookies.deleteCookie(_testCookieName);

                var hasCookie = W.Utils.cookies.hasCookie(_testCookieName);

                expect(hasCookie).toBe(false);
            });

            it("when creating an existing cookie, it should be overwritten. duration=" + duration, function () {
                W.Utils.cookies.createCookie(_testCookieName, _testCookieValue, duration);
                var expectedValue = 'expected';
                W.Utils.cookies.createCookie(_testCookieName, expectedValue, duration);

                var cookieValue = W.Utils.cookies.readCookie(_testCookieName);

                expect(cookieValue).toBe(expectedValue);
            });
        });
    }

    testCookieWithDuration(null);
    testCookieWithDuration(10000);
});