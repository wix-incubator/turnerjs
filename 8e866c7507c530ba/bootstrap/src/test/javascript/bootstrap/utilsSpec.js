/**
 * Created by IntelliJ IDEA.
 * User: Idoro
 * Date: 08/02/11
 * Time: 17:38
 * To change this template use File | Settings | File Templates.
 */
describe('utils', function() {
    it('W exists and valid', function() {
        expect(W).toBeDefined();
    });

    describe("callLater", function() {

        it('callLater should be defined and callback a function', function() {
            runs(function() {
                expect(W.Utils.callLater).toBeInstanceOf(Function);
                this.func = function() {
                };

                spyOn(this, 'func').andCallThrough();
                W.Utils.callLater(this.func);
            });
            waits(2);
            runs(function() {
                expect(this.func).toHaveBeenCalled();
            });
        });

        it('callLater should add a "callLaterStack" member to the delayed function, and delete it after the function returns', function() {
            // make sure the check for query parameter called 'stack' will return true.
            spyOn(W.Utils, 'getQueryParam').andReturn("true") ;
            var stack = null;
            runs(function() {
                this.func = function() {
                    stack = arguments['callee'].callLaterStack;
                };

                W.Utils.callLater(this.func);
            });
            waitsFor(function() {
                return stack !== null;
            }, 'callLater never happened', 10);
            runs(function() {
                expect(stack).toBeDefined();
                expect(this.func.callLaterStack).not.toBeDefined();
            });
        });

        it('callLater should pass parameters', function() {
            var calledArgs;
            var target = {'func':function(arg1, arg2) {

                calledArgs = arguments;
            }};
            spyOn(target, 'func').andCallThrough();
            W.Utils.callLater(target.func, [1, '2']);
            waits(2);
            runs(function() {
                expect(target.func).toHaveBeenCalled();
                expect(calledArgs[0]).toBe(1);
                expect(calledArgs[1]).toBe('2');
            });
        });

        it('callLater should be on scope', function() {
            var result;
            var scope = {param:'xxx'};
            var target = {'func':function() {

                result = this.param;
            }};
            spyOn(target, 'func').andCallThrough();
            W.Utils.callLater(target.func, [], scope);
            waits(5);
            runs(function() {

                expect(target.func).toHaveBeenCalled();
                expect(result).toBe('xxx');
            });
        });

        it('callLater should wait for later', function() {
            var target = {'func':function() {
            }};


            spyOn(target, 'func').andCallThrough();
            W.Utils.callLater(target.func, [], this, 5);
            expect(target.func).not.toHaveBeenCalled();
            waits(6);
            runs(function() {

                expect(target.func).toHaveBeenCalled();
            });
        });
    });

    it('fixURL returns a valid string', function() {
        expect(W.Utils.convertToValidUrlPart('Ab  c$1')).toBe('ab--c1');
    });

    it('isValidTwitterUser', function() {
        expect(W.Utils.isValidTwitterUser('amirmi')).toBeTruthy();
        expect(W.Utils.isValidTwitterUser('@amirmi')).toBeTruthy();
        expect(W.Utils.isValidTwitterUser('@@amirmi')).toBeFalsy();
        expect(W.Utils.isValidTwitterUser('@@')).toBeFalsy();
        expect(W.Utils.isValidTwitterUser('!@#$%^&*()')).toBeFalsy();
        expect(W.Utils.isValidTwitterUser('@')).toBeFalsy();
    });

    it('isURLPartValid checks that url part is valid', function() {
        expect(W.Utils.isURLPartValid('')).toBeFalsy();
        expect(W.Utils.isURLPartValid('aaa')).toBeFalsy();
        expect(W.Utils.isURLPartValid('aaab')).toBeTruthy();
        expect(W.Utils.isURLPartValid('abc123 ')).toBeFalsy();
        expect(W.Utils.isURLPartValid('abc123_')).toBeTruthy();
        expect(W.Utils.isURLPartValid('aBc123_')).toBeFalsy();
        expect(W.Utils.isURLPartValid('!@#$%')).toBeFalsy();
        expect(W.Utils.isURLPartValid('')).toBeFalsy();
        expect(W.Utils.isURLPartValid('aaa')).toBeFalsy();
        expect(W.Utils.isURLPartValid('aaab')).toBeTruthy();
        expect(W.Utils.isURLPartValid('abc123 ')).toBeFalsy();
        expect(W.Utils.isURLPartValid('abc123_')).toBeTruthy();
        expect(W.Utils.isURLPartValid('aBc123_')).toBeFalsy();
        expect(W.Utils.isURLPartValid('?????')).toBeFalsy();
        expect(W.Utils.isURLPartValid('!@#$%')).toBeFalsy();
        // TODO: check languages other then English
    });

    describe("getUniqueId", function() {
        it("should create a new unique id every time it's called", function() {
            var id1 = W.Utils.getUniqueId();
            expect(id1).not.toBe(W.Utils.getUniqueId());
        });

        it("should add a counter suffix if an id was already created in the same instant, so that all the ids are still unique", function() {

            var ids = [];
            for(var i=0;i<20;i++){
                ids.push(W.Utils.getUniqueId());
            }
            expect(ids.length).toBe(_.unique(ids).length);
        });

        it("should not add a counter suffix if an id was never created with this timestamp", function(){
            waits(5);
            var id1,id2,id3;
            runs(function(){
                id1 = W.Utils.getUniqueId(); //should not have a suffix
                id2 = W.Utils.getUniqueId(); //might have a suffix, since it's most likely created in same millisecond
            });

            waits(5);
            runs(function(){
                id3 = W.Utils.getUniqueId();
                expect(id3.match(/_[0-9]*$/)).not.toBeTruthy();
            });
        });
    });

    describe("isValidUrl", function() {
        describe("The regex it uses internally", function(){  //TODO: fix this test to use a worker so we can actually fail the test without crashing the build due to timeout!
            it("should never take longer than 2 seconds for any url string", function(){
                var isValid;
                isValid = W.Utils.isValidUrl("youtaaaaaaaaaaaaaasssssusssssssssssdfdsfsdfsdfdsfsfsdfdsbasdasdsdaedasdasdasd3243423dafaaaaaaaaaa");
                waitsFor(function(){
                    return typeof isValid !== 'undefined';
                },'isValid to be defined', 2000);
                runs(function(){
                    expect(isValid).toBeDefined();
                });
            });
        });
        describe("should return true for valid urls", function(){
            it("should allow domains with a protocol", function(){
                expect(W.Utils.isValidUrl("http://youtu.be")).toBeTruthy();
                expect(W.Utils.isValidUrl("https://youtu.be")).toBeTruthy();
                expect(W.Utils.isValidUrl("ftp://youtu.be")).toBeTruthy();
                expect(W.Utils.isValidUrl("ftps://youtu.be")).toBeTruthy();
            });

            it("should allow domains without a protocol", function(){
                expect(W.Utils.isValidUrl("youtu.be")).toBeTruthy();
            });
            it("should allow underscores in all subdomains", function(){
                expect(W.Utils.isValidUrl("_dasd_.a_ads.youtu.be")).toBeTruthy();
            });

            it("should allow ports", function(){
                expect(W.Utils.isValidUrl("youtu.be:8080")).toBeTruthy();
                expect(W.Utils.isValidUrl("youtu.be:91/")).toBeTruthy();
            });
            it("should allow ips", function(){
                expect(W.Utils.isValidUrl("http://192.168.2.1")).toBeTruthy();
                expect(W.Utils.isValidUrl("1.1.1.1")).toBeTruthy();
            });
            it("should allow any deep-link after the domain, as long as it starts in a valid manner", function(){
                expect(W.Utils.isValidUrl("http://youtu.be#")).toBeTruthy();
                expect(W.Utils.isValidUrl("http://youtu.be?")).toBeTruthy();
                expect(W.Utils.isValidUrl("http://youtu.be/")).toBeTruthy();
                expect(W.Utils.isValidUrl("http://youtu.be#!0,7340,'L-8,00.html")).toBeTruthy();
                expect(W.Utils.isValidUrl("http://youtu.be?asdasdasdads=sadasd=wqa=&ASdwa adcsdad asd''''%%%%%%%%%%%%%%%%%")).toBeTruthy();
                expect(W.Utils.isValidUrl("http://youtu.be?a@$!#@#@%%$^%&^^(&*($@#$@#__213-34fsf")).toBeTruthy();
            });
        });

        describe("should return false for invalid urls", function(){
            it("should not allow ports longer than 5 numbers", function(){
                expect(W.Utils.isValidUrl("http://youtu.be:123456")).toBeFalsy();
            });
            it("should not allow leading or trailing hyphens in subdomains", function(){
                expect(W.Utils.isValidUrl("-youtu.be")).toBeFalsy();
                expect(W.Utils.isValidUrl("youtu-.be")).toBeFalsy();
            });
            it("should not invalid characters in the domain/subdomain", function(){
                expect(W.Utils.isValidUrl("http://Invalid!@sheker")).toBeFalsy();
                expect(W.Utils.isValidUrl("youtu'.be")).toBeFalsy();
                expect(W.Utils.isValidUrl("some space.indomain")).toBeFalsy();
            });
            it("should not allow invalid protocols", function(){
                expect(W.Utils.isValidUrl('Invalidhttp://www.google.com')).toBeFalsy();
            });
            it("should not allow two periods in a row between subdomains", function(){
                expect(W.Utils.isValidUrl('www..address.com')).toBeFalsy();
            });
            it("should not allow underscores in the tld", function(){
                expect(W.Utils.isValidUrl("youtu.b_e")).toBeFalsy();
            });
            it("should not allow deep-links if they start with an unsupported character", function(){
                expect(W.Utils.isValidUrl("youtu.be$")).toBeFalsy();
                expect(W.Utils.isValidUrl("youtu.be%")).toBeFalsy();
                expect(W.Utils.isValidUrl("youtu.be&")).toBeFalsy();
            });
        });
    });

    describe("serverRequest", function() {
        var returnedRequest;

        beforeEach(function() {
            //Mock world
            this.orgRequestObj = Request;
            Request = {};
            returnedRequest = {'get': jasmine.createSpy('Request.JSON.get'), 'post': jasmine.createSpy('Request.JSON.post')};
            Request.JSON = function() {
                return returnedRequest;
            };
            spyOn(Request, 'JSON').andCallThrough();
        });

        afterEach(function() {
            Request = this.orgRequestObj;
        });

        it("should create a moo-tools JSON request according to the parameters passed to it", function() {
            var onSuccess = function() {
            };
            var onFailure = function() {
            };

            //Call tested function
            W.Utils.serverRequest('testAction', 'get', 'test data', onSuccess, onFailure);

            //Assertions
            expect(Request.JSON).toHaveBeenCalled();
            expect(Request.JSON.mostRecentCall.args[0].url).toBe('testAction');
            expect(Request.JSON.mostRecentCall.args[0].onSuccess).toBe(onSuccess);
            expect(Request.JSON.mostRecentCall.args[0].onFailure).toBe(onFailure);
        });

        it("should use the http method passed as parameter", function() {
            var onSuccess = function() {
            };
            var onFailure = function() {
            };

            //Call tested function
            W.Utils.serverRequest('testAction', 'get', 'test data', onSuccess, onFailure);

            //Assertions
            expect(returnedRequest.get).toHaveBeenCalled();

            //Call tested function
            W.Utils.serverRequest('testAction', 'post', 'test data', onSuccess, onFailure);

            //Assertions
            expect(returnedRequest.post).toHaveBeenCalled();
        });
    });


    describe('isEquivalent', function() {
        it('should compare booleans', function() {
            expect(W.Utils.isEquivalent(true, true)).toBeTruthy();
            expect(W.Utils.isEquivalent(true, false)).toBeFalsy();
        });

        it('should compare strings', function() {
            expect(W.Utils.isEquivalent('', '')).toBeTruthy();
            expect(W.Utils.isEquivalent('foo bar baz qux', 'foo bar baz qux')).toBeTruthy();
            expect(W.Utils.isEquivalent('', 'foo bar')).toBeFalsy();
            expect(W.Utils.isEquivalent('foo bar', 'baz qux')).toBeFalsy();
        });

        it('should compare numbers', function() {
            expect(W.Utils.isEquivalent(33, 44)).toBeFalsy();
            expect(W.Utils.isEquivalent(55, 55)).toBeTruthy();
            expect(W.Utils.isEquivalent(55, (typeof 1 / 0))).toBeFalsy();
            expect(W.Utils.isEquivalent(55, null)).toBeFalsy();
        });

        it('should compare functions', function() {
            var f1 = function() {
            };
            var f2 = function() {
            };
            f1.bla = "hello";
            f2.bla = "hello";
            expect(W.Utils.isEquivalent(f1, f2)).toBeTruthy();
        });

        it('should compare arrays', function() {
            expect(W.Utils.isEquivalent([], [])).toBeTruthy();
            expect(W.Utils.isEquivalent([1,2,3], [1,2,3])).toBeTruthy();
            expect(W.Utils.isEquivalent([], [4,5,6])).toBeFalsy();
            expect(W.Utils.isEquivalent([4,5,6], [])).toBeFalsy();
            expect(W.Utils.isEquivalent([1,2,3], [4,5,6])).toBeFalsy();
            expect(W.Utils.isEquivalent([], undefined)).toBeFalsy();
            expect(W.Utils.isEquivalent([1,2,3], undefined)).toBeFalsy();
            expect(W.Utils.isEquivalent([], null)).toBeFalsy();
            expect(W.Utils.isEquivalent([1,2,3], null)).toBeFalsy();
        });

        it('should compare objects', function() {
            var sameObj1 = {sameKey: {foo: 'bar', baz: 'qux'}, anotherSameKey: {anotherSameKey: {qux: 'baz', bar: 'foo'}}},
                    sameObj2 = {sameKey: {foo: 'bar', baz: 'qux'}, anotherSameKey: {anotherSameKey: {qux: 'baz', bar: 'foo'}}},
                    diffObj = {diffKey: {goo: 'boo'}, anotherDifferentKey: {diffObj: {diff: 'far'}}},
                    wackyObj1 = {one: {foo: 'bar', boo: 'far', baz: ['foo','bar','baz']}, two: {roo: 'dub', doo: [], quo: [1,2,3,4, {}, {goo: 'doo', doo: 'goo'}]}},
                    wackyObj2 = {one: {foo: 'bar', boo: 'far', baz: ['foo','bar','baz']}, two: {roo: 'dub', doo: [], quo: [1,2,3,4, {}, {goo: 'doo', doo: 'goo'}]}},
                    wackyObj3 = {one: {foo: 'bar', boo: 'far', baz: ['foo','bar','baz']}, let: {us: 'go', then: [], you: [1,2,3,4, {}, {and: 'i', where: 'the evening is spread out against the sky'}]}};

            expect(W.Utils.isEquivalent({}, {})).toBeTruthy();
            expect(W.Utils.isEquivalent(sameObj1, sameObj2)).toBeTruthy();
            expect(W.Utils.isEquivalent(sameObj1, diffObj)).toBeFalsy();
            expect(W.Utils.isEquivalent(sameObj2, diffObj)).toBeFalsy();
            expect(W.Utils.isEquivalent(wackyObj1, wackyObj2)).toBeTruthy();
            expect(W.Utils.isEquivalent(wackyObj1, wackyObj3)).toBeFalsy();
            expect(W.Utils.isEquivalent({foo: 'bar', baz: 'qux', length: 2}, {foo: 'bar', baz: 'qux', length: 2})).toBeTruthy();
            expect(W.Utils.isEquivalent({foo123: 'bar123', baz123: 'qux123', length: 5}, {foo: 'bar', baz: 'qux', length: 2})).toBeFalsy();
        });
        
        it('should sanitize Unicode chars', function(){
            var dirtyText = W.Utils.sanitizeUnicode("test test \u2028 one two three \u2029");
            expect(dirtyText.indexOf('\u2028'), '1').toEqual(-1);
            expect(dirtyText.indexOf('\u2029'), '2').toEqual(-1);
            expect(dirtyText.indexOf('\u000A'), '3').not.toBe(-1);
        });
    });
    describe('isInputKey', function(){
        it('should return false when no key code is passed', function(){
            expect(W.Utils.isInputKey()).toBeFalsy();
        });
        it('should return false when the key code is in allowed range', function(){
            var allowedCharCode = 'A'.charCodeAt(0);
            expect(W.Utils.isInputKey(allowedCharCode)).toBeTruthy();
        });
        it('should return true when the key code is in a forbidden range', function(){
            var forbiddenCharCode = 112; // F1 key;
            expect(W.Utils.isInputKey(forbiddenCharCode)).toBeFalsy();
        });
    });
    describe('setUrlParam', function() {
       it('should replace existing parameter with new value', function() {
           expect(W.Utils.setUrlParam("http://www.franta.com/dkskdls.jsp?auto=true&mono=12", "auto", false))
               .toBe("http://www.franta.com/dkskdls.jsp?auto=false&mono=12");
           expect(W.Utils.setUrlParam("http://www.franta.com/dkskdls.jsp?auto=true&mono=12", "mono", 25))
               .toBe("http://www.franta.com/dkskdls.jsp?auto=true&mono=25");
       });
        it('should add new parameter', function() {
           expect(W.Utils.setUrlParam("http://www.franta.com/dkskdls.jsp", "auto", false))
               .toBe("http://www.franta.com/dkskdls.jsp?auto=false");
           expect(W.Utils.setUrlParam("http://www.franta.com/dkskdls.jsp?auto=true&mono=12", "makro", "yes"))
               .toBe("http://www.franta.com/dkskdls.jsp?auto=true&mono=12&makro=yes");
       });
    });
    describe('getPositionRelativeToWindow', function(){
        it('should return {x:0, y:0} if the passed element does not exist', function(){
            expect(W.Utils.getPositionRelativeToWindow(undefined)).toBeEquivalentTo({x:0, y:0});
            expect(W.Utils.getPositionRelativeToWindow('#iDoNotExist')).toBeEquivalentTo({x:0, y:0});
        });
    });

    describe("characters encoding", function(){
        it("Should escape all characters except alphabetic ones and numbers", function() {
            var valueToEncode = "~!@#$%^&*()_+=." + String.fromCharCode(0x0C110) ;

            var result = W.Utils.encodeValue(valueToEncode) ;

            var regex = new RegExp('[^a-zA-Z0-9%!.~*()_]');
            var results = regex.exec(result);
            expect(results).toBeNull() ;
        })
    }) ;
});
