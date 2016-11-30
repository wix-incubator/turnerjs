describe('helpers tests', function(){
    testRequire().classes('bootstrap.managers.events.EventDispatcherBase');
    var asyncSpec =  new AsyncSpec(this);

    describe('isSiteNameAlreadyExist',function(){
        beforeEach(function(){
            var fakeSpy = function(){
                return ['bbbB','bAba','AaaC'];
            };
            spyOn(W.Utils, "getUsedMetaSiteNames").andCallFake(fakeSpy);
        });
        it('should return true on existing site name', function(){
            var siteName = "bbbb";
            expect(W.Utils.isSiteNameAlreadyExist(siteName)).toBeTruthy();
        });
        it('should return false on not existing site name', function(){
            var siteName = "lala";
            expect(W.Utils.isSiteNameAlreadyExist(siteName)).toBeFalsy();
        });
    });

    describe('getQueryParam() checks',function(){
        it('should return a correct query param', function(){
            var url = "http://www.example.com?param1=value1";
            expect(W.Utils.getQueryParam('param1',url)).toBe('value1');
        });
        it('should be able to pick out of multiple parameters', function(){
            var url = "http://www.example.com?param1=value1&param2=value2&param3=value3";
            expect(W.Utils.getQueryParam('param2',url)).toBe('value2');
        });
    });

    describe('arrayToObject', function() {
        var arrayToObject = W.Utils.arrayToObject;
        it('should create an object with the corresponding keys and values', function() {
           var result = arrayToObject(['a', 'b'], function(key) {
               return key+key;
           });

           expect(JSON.stringify(result)).toEqual('{"a":"aa","b":"bb"}');
        });

        it('should supply the index to the mapping function', function() {
            var result = arrayToObject(['a', 'b'], function(key, i) {
                return key+i;
            });

            expect(JSON.stringify(result)).toEqual('{"a":"a0","b":"b1"}');
        });

        it('should bind thisArg to the mappingFunction', function() {
            var result = arrayToObject(['a', 'b'], function(key) {
                return key+this.x;
            }, {x:42});

            expect(JSON.stringify(result)).toEqual('{"a":"a42","b":"b42"}');
        });

        it('should handle empty input arrays', function() {
            var result = arrayToObject([], function() {
                throw new Error('should not have been called')
            });

            expect(JSON.stringify(result)).toEqual('{}');
        });

        it('should handle sparse arrays', function() {
            var ar = [];
            ar[10] = 'a';
            var result = arrayToObject(ar, function(key) {
                return key+key;
            });

            expect(JSON.stringify(result)).toEqual('{"a":"aa"}');
        });
    }) ;

    describe("waitForAnEventOnObjects", function(){
        var eventName = "mockEvent";

        function createObject(isAsync, scope){
            var obj = new scope.EventDispatcherBase();
            obj.isAsync = isAsync;
            return obj;
        }

        function runObject(obj){
            if(obj.isAsync){
                setTimeout(function(){obj.trigger(eventName);}, 1);
            } else{
                obj.trigger(eventName);
            }
        }
        beforeEach(function(){
            this.objects = {
                'sync1': createObject(false, this),
                'sync2': createObject(false, this),
                'async': createObject(true, this)
            };
            this.callback = jasmine.createSpy('callback');
        });

        function runObjectsAndValidate (objects, done){
            var callback = function(success, failedObjects){
                expect(success).toBe(true);
                done();
            };

            W.Utils.waitForAnEventOnObjects(objects, eventName, callback);
            _.forEach(objects, runObject);
        }

        function getTimeoutValidationCallback(arr, done){
            var callback = function(success, failedObjects){
                expect(success).toBe(false);
                expect(failedObjects).toEqual([arr[0],arr[2]]);
                done()
            };
            _.forEach(arr, runObject);
            return callback;
        }

        asyncSpec.it("should call callback with true if all events are triggered sync", function(done){
            var arr = [this.objects.sync1, this.objects.sync2];
            runObjectsAndValidate(arr, done);
        });
        asyncSpec.it("should call callback with true if the 1st event is triggered async", function(done){
            var arr = [this.objects.async, this.objects.sync2];
            runObjectsAndValidate(arr, done);
        });
        asyncSpec.it("should call callback with true if the last event is triggered async", function(done){
            var arr = [this.objects.sync1, this.objects.async];
            runObjectsAndValidate(arr, done);
        });
        asyncSpec.it("should work with maps", function(done){
            var map = {'a': this.objects.sync1, 'b': this.objects.sync2};
            runObjectsAndValidate(map, done);
        });


        asyncSpec.it("should call callback with false and a list of timed out objects", function(done){
            var arr = [this.objects.sync1, this.objects.async, this.objects.sync2];
            var callback = getTimeoutValidationCallback(arr, done);
            W.Utils.waitForAnEventOnObjects(arr, eventName, callback, false, 3);
        });
        asyncSpec.it("should set a default timeout time", function(done){
            spyOn(W.Utils, '_getDefaultTimeoutTime').andReturn(1);
            var arr = [this.objects.sync1, this.objects.async, this.objects.sync2];
            var callback = getTimeoutValidationCallback(arr, done);
            W.Utils.waitForAnEventOnObjects(arr, eventName, callback);
        });

        asyncSpec.it("should clear the event listeners on success", function(done){
            var arr = [this.objects.sync1, this.objects.sync2];
            runObjectsAndValidate(arr, done);
            _.forEach(arr, function(obj){
                expect(obj.getAllHandlers(eventName).length).toBe(0);
            });
        });
        asyncSpec.it("should NOT clear the event listeners on failure", function(done){
            var arr = [this.objects.sync1, this.objects.async, this.objects.sync2];
            var callback = getTimeoutValidationCallback(arr, done);
            W.Utils.waitForAnEventOnObjects(arr, eventName, callback, false, 3);
            _.forEach(arr, function(obj){
                expect(obj.getAllHandlers(eventName).length).toBe(1);
            });
        });

        it("should call the callback with timeout and then success if that is the case", function(){
            var arr = [this.objects.sync1, this.objects.sync2];
            var success = false;
            var callback = function(isSuccess, timedout){
                if(isSuccess){
                    success = true;
                } else{
                    expect(timedout).toEqual([arr[1]]);
                }
            };
            W.Utils.waitForAnEventOnObjects(arr, eventName, callback, 3);
            this.objects.sync1.trigger(eventName);
            setTimeout(function(){
                this.objects.sync2.trigger(eventName);
            }.bind(this), 10);
            waitsFor(function(){
                return success;
            }, "waiting for the success callback", 100);
        });

        asyncSpec.it("should clear the timeout on success", function(done){
            var arr = [this.objects.sync1, this.objects.sync2];
            var callback = jasmine.createSpy('callback');
            W.Utils.waitForAnEventOnObjects(arr, eventName, callback, 1);
            _.forEach(arr, runObject);
            setTimeout(function(){
                expect(callback).toHaveBeenCalledXTimes(1);
                done();
            }, 10);
        });

    });

});