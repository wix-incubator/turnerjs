define(["lodash", "coreUtils/core/store2"], function (_, Store) {
    "use strict";

    var responseData = {
        hello: "world"
    };
    var responseDataFallback = {
        url1: {
            data: 1
        },
        url2: {
            data: 2
        }
    };

    function fetchFunc(request) {
        setTimeout(function () {
            request.success(responseData);
        }, 0);
    }
    function fetchFuncError(request) {
        setTimeout(function () {
            request.error(request, 'mockError', {error: true});
        }, 0);
    }
    function fetchFuncFallback(request) {
        setTimeout(function () {
            if (responseDataFallback[request.url]) {
                request.success(responseDataFallback[request.url]);
            } else {
                request.error({error: true});
            }
        }, 0);
    }

    describe("Store", function () {
        describe("single loadBatch calls", function () {
            it("should call doneCallback when a null batch was passed", function (done) {
                var dataContainer = {};

                /**
                 * @type {utils.Store}
                 */
                var store = new Store(dataContainer, fetchFunc);

                /**
                 * @type {utils.Store.requestDescriptor[]}
                 */
                var batch = null;

                var doneCallback = function () {
                    expect(dataContainer).toEqual({});
                    done();
                };

                store.loadBatch(batch, doneCallback);
            });
            it("should call doneCallback when an empty batch was passed", function (done) {
                var dataContainer = {};

                /**
                 * @type {utils.Store}
                 */
                var store = new Store(dataContainer, fetchFunc);

                /**
                 * @type {utils.Store.requestDescriptor[]}
                 */
                var batch = [];

                var doneCallback = function () {
                    expect(dataContainer).toEqual({});
                    done();
                };

                store.loadBatch(batch, doneCallback);
            });
            it("should load a single resource if not loaded yet", function (done) {
                var dataContainer = {};

                /**
                 * @type {utils.Store}
                 */
                var store = new Store(dataContainer, fetchFunc);

                /**
                 * @type {utils.Store.requestDescriptor[]}
                 */
                var batch = [
                    {url: "some_url", destination: ["package"]}
                ];

                var doneCallback = function () {
                    expect(dataContainer.package).toEqual(responseData);
                    done();
                };

                store.loadBatch(batch, doneCallback);
            });
            it("should load a single resource if was loaded before", function (done) {
                var dataContainer = {
                    "package": responseData
                };

                /**
                 * @type {utils.Store}
                 */
                var store = new Store(dataContainer, fetchFunc);

                /**
                 * @type {utils.Store.requestDescriptor[]}
                 */
                var batch = [
                    {url: "some_url", destination: ["package"]}
                ];

                var doneCallback = function () {
                    expect(dataContainer.package).toEqual(responseData);
                    done();
                };

                store.loadBatch(batch, doneCallback);
            });
            it("should load multiple resources - first loaded second not loaded", function (done) {
                var dataContainer = {
                    "existing": {we: "are here"}
                };

                /**
                 * @type {utils.Store}
                 */
                var store = new Store(dataContainer, fetchFunc);

                /**
                 * @type {utils.Store.requestDescriptor[]}
                 */
                var batch = [
                    {url: "some_url", destination: ["existing"]},
                    {url: "some_other_url", destination: ["package"]}
                ];

                var doneCallback = function () {
                    expect(dataContainer.existing).toEqual({we: "are here"});
                    expect(dataContainer.package).toEqual(responseData);
                    done();
                };

                store.loadBatch(batch, doneCallback);
            });
            it("should load multiple resources - first not loaded second loaded", function (done) {
                var dataContainer = {
                    "existing": {we: "are here"}
                };

                /**
                 * @type {utils.Store}
                 */
                var store = new Store(dataContainer, fetchFunc);

                /**
                 * @type {utils.Store.requestDescriptor[]}
                 */
                var batch = [
                    {url: "some_other_url", destination: ["package"]},
                    {url: "some_url", destination: ["existing"]}
                ];

                var doneCallback = function () {
                    expect(dataContainer.existing).toEqual({we: "are here"});
                    expect(dataContainer.package).toEqual(responseData);
                    done();
                };

                store.loadBatch(batch, doneCallback);
            });
            it("should load multiple resources - both not loaded", function (done) {
                var dataContainer = {
                    "existing": {we: "are here"}
                };

                /**
                 * @type {utils.Store}
                 */
                var store = new Store(dataContainer, fetchFunc);

                /**
                 * @type {utils.Store.requestDescriptor[]}
                 */
                var batch = [
                    {url: "some_url", destination: ["package1"]},
                    {url: "some_other_url", destination: ["package2"]}
                ];

                var doneCallback = function () {
                    expect(dataContainer.package1).toEqual(responseData);
                    expect(dataContainer.package2).toEqual(responseData);
                    done();
                };

                store.loadBatch(batch, doneCallback);
            });
            it("should call doneCallback even if the request got an error", function (done) {
                var dataContainer = {};

                /**
                 * @type {utils.Store}
                 */
                var store = new Store(dataContainer, fetchFuncError);

                /**
                 * @type {utils.Store.requestDescriptor[]}
                 */
                var batch = [
                    {url: "some_url", destination: ["package"]}
                ];

                var doneCallback = function () {
                    expect(dataContainer.package).toBeUndefined();
                    done();
                };

                store.loadBatch(batch, doneCallback);
            });
        });

        describe("destination", function () {
            it("should add to existing destination", function (done) {
                var dataContainer = {
                    existing: {
                        data: true
                    }
                };

                /**
                 * @type {utils.Store}
                 */
                var store = new Store(dataContainer, fetchFunc);

                /**
                 * @type {utils.Store.requestDescriptor[]}
                 */
                var batch = [
                    {url: "some_url", destination: ["existing", "package"]}
                ];

                var doneCallback = function () {
                    var expected = {
                        existing: {
                            data: true,
                            "package": responseData
                        }
                    };
                    expect(dataContainer).toEqual(expected);
                    done();
                };

                store.loadBatch(batch, doneCallback);
            });
            it("should add multi-part destination", function (done) {
                var dataContainer = {};

                /**
                 * @type {utils.Store}
                 */
                var store = new Store(dataContainer, fetchFunc);

                /**
                 * @type {utils.Store.requestDescriptor[]}
                 */
                var batch = [
                    {url: "some_url", destination: ["existing", "package"]}
                ];

                var doneCallback = function () {
                    var expected = {
                        existing: {
                            "package": responseData
                        }
                    };
                    expect(dataContainer).toEqual(expected);
                    done();
                };

                store.loadBatch(batch, doneCallback);
            });
        });

        describe("force", function () {
            it("should fetch data even if existing, when force is true", function (done) {
                var dataContainer = {
                    existing: {
                        data: true
                    }
                };

                /**
                 * @type {utils.Store}
                 */
                var store = new Store(dataContainer, fetchFunc);

                /**
                 * @type {utils.Store.requestDescriptor[]}
                 */
                var batch = [
                    {url: "some_url", destination: ["existing", "data"], force: true}
                ];

                var doneCallback = function () {
                    var expected = {
                        existing: {
                            data: responseData
                        }
                    };
                    expect(dataContainer).toEqual(expected);
                    done();
                };

                store.loadBatch(batch, doneCallback);
            });
        });

        describe("multiple loadBatch calls", function () {
            it("call all doneCallbacks", function (done) {
                var dataContainer = {};

                /**
                 * @type {utils.Store}
                 */
                var store = new Store(dataContainer, fetchFunc);

                var doneCount = 0;
                var doneCallback = function () {
                    doneCount++;
                    if (doneCount === 2) {
                        done(); // test will only pass if doneCallback was called twice
                    }
                };

                /**
                 * @type {utils.Store.requestDescriptor[]}
                 */
                var batch1 = [
                    {url: "some_url", destination: ["package1"]}
                ];
                /**
                 * @type {utils.Store.requestDescriptor[]}
                 */
                var batch2 = [
                    {url: "some_url", destination: ["package2"]}
                ];

                store.loadBatch(batch1, doneCallback);
                store.loadBatch(batch2, doneCallback);
            });
        });

        describe("single request fallback urls", function () {
            it("should return the response of the first fallback url", function (done) {
                var dataContainer = {};

                /**
                 * @type {utils.Store}
                 */
                var store = new Store(dataContainer, fetchFuncFallback);

                /**
                 * @type {utils.Store.requestDescriptor[]}
                 */
                var batch = [
                    {url: "err_url", urls: ["url1", "url2"], destination: ["package"]}
                ];

                var doneCallback = function () {
                    expect(dataContainer.package).toEqual(responseDataFallback.url1);
                    done();
                };

                store.loadBatch(batch, doneCallback);
            });
            it("should execute the error if the request descriptor decided to invalided the response on success", function (done) {
                var dataContainer = {};

                var errorSpy;
                var fetchFuncWithFirstTimeInvalidData = (function(){
                    var fakeData = null;
                    return function(request) {
                        errorSpy = errorSpy || spyOn(request, 'error').and.callThrough();
                        setTimeout(function () {
                            request.success(fakeData);
                            fakeData = true; //will 'be valid' next time
                        }, 0);
                    };
                }());

                /**
                 * @type {utils.Store}
                 */
                var store = new Store(dataContainer, fetchFuncWithFirstTimeInvalidData);

                /**
                 * @type {utils.Store.requestDescriptor[]}
                 */
                var batch = [
                    {url: "err_url", urls: ["url1", "url2"], destination: ["package"], isValidResponse: function (resData) { return !!resData; }}
                ];

                var doneCallback = function () {
                    expect(errorSpy).toHaveBeenCalled();
                    done();
                };

                store.loadBatch(batch, doneCallback);
            });
            it("should return the response of the second fallback url if first failed", function (done) {
                var dataContainer = {};

                /**
                 * @type {utils.Store}
                 */
                var store = new Store(dataContainer, fetchFuncFallback);

                /**
                 * @type {utils.Store.requestDescriptor[]}
                 */
                var batch = [
                    {url: "err_url", urls: ["err_url1", "url2"], destination: ["package"]}
                ];

                var doneCallback = function () {
                    expect(dataContainer.package).toEqual(responseDataFallback.url2);
                    done();
                };

                store.loadBatch(batch, doneCallback);
            });
        });

        describe("single request callback", function () {
            it("should call each request callback for different paths - before the doneCallback", function (done) {
                var dataContainer = {};

                /**
                 * @type {utils.Store}
                 */
                var store = new Store(dataContainer, fetchFuncFallback);

                var called = [];
                var check = function () {
                    if (called.length === 3) {
                        expect(called[2]).toEqual("doneCallback");
                        expect(_.initial(called)).toContain("callback1");
                        expect(_.initial(called)).toContain("callback2");
                        done();
                    }
                };
                var callback1 = function () {
                    called.push("callback1");
                    check();
                };
                var callback2 = function () {
                    called.push("callback2");
                    check();
                };
                /**
                 * @type {utils.Store.requestDescriptor[]}
                 */
                var batch = [
                    {url: "url1", destination: ["path1"], callback: callback1},
                    {url: "url2", destination: ["path2"], callback: callback2}
                ];

                var doneCallback = function () {
                    called.push("doneCallback");
                    check();
                };

                store.loadBatch(batch, doneCallback);
            });
            it("should call each request callback for same paths - before the doneCallback", function (done) {
                var dataContainer = {};

                /**
                 * @type {utils.Store}
                 */
                var store = new Store(dataContainer, fetchFuncFallback);

                var called = [];
                var check = function () {
                    if (called.length === 3) {
                        expect(called[2]).toEqual("doneCallback");
                        expect(_.initial(called)).toContain("callback1");
                        expect(_.initial(called)).toContain("callback2");
                        done();
                    }
                };
                var callback1 = function () {
                    called.push("callback1");
                    check();
                };
                var callback2 = function () {
                    called.push("callback2");
                    check();
                };
                /**
                 * @type {utils.Store.requestDescriptor[]}
                 */
                var batch = [
                    {url: "url1", destination: ["path1"], callback: callback1},
                    {url: "url2", destination: ["path1"], callback: callback2}
                ];

                var doneCallback = function () {
                    called.push("doneCallback");
                    check();
                };

                store.loadBatch(batch, doneCallback);
            });
        });

        describe("single request transformFunc", function () {
            it("should not call transformFunc for existing data", function (done) {
                var dataContainer = {
                    "package": responseData
                };

                /**
                 * @type {utils.Store}
                 */
                var store = new Store(dataContainer, fetchFunc);

                var transform = jasmine.createSpy();
                /**
                 * @type {utils.Store.requestDescriptor[]}
                 */
                var batch = [
                    {url: "some_url", destination: ["package"], transformFunc: transform}
                ];

                var doneCallback = function () {
                    expect(transform).not.toHaveBeenCalled();
                    done();
                };

                store.loadBatch(batch, doneCallback);
            });
            it("should call transformFunc for non-existing data", function (done) {
                var dataContainer = {};

                /**
                 * @type {utils.Store}
                 */
                var store = new Store(dataContainer, fetchFunc);

                var transform = jasmine.createSpy().and.returnValue(responseData);
                /**
                 * @type {utils.Store.requestDescriptor[]}
                 */
                var batch = [
                    {url: "some_url", destination: ["package"], transformFunc: transform}
                ];

                var doneCallback = function () {
                    expect(transform).toHaveBeenCalled();
                    expect(dataContainer.package).toEqual(responseData);
                    done();
                };

                store.loadBatch(batch, doneCallback);
            });
            it("should call the transformFunc when force is true", function (done) {
                var dataContainer = {
                    "package": {
                        some: "data"
                    }
                };

                /**
                 * @type {utils.Store}
                 */
                var store = new Store(dataContainer, fetchFunc);

                var transform = jasmine.createSpy().and.returnValue({bla: "bla"});
                /**
                 * @type {utils.Store.requestDescriptor[]}
                 */
                var batch = [
                    {url: "some_url", destination: ["package"], transformFunc: transform, force: true}
                ];

                var doneCallback = function () {
                    var expected = {
                        "package": {
                            bla: "bla"
                        }
                    };
                    expect(transform).toHaveBeenCalled();
                    expect(dataContainer).toEqual(expected);
                    done();
                };

                store.loadBatch(batch, doneCallback);
            });
            it("should call only the transformFunc of the first request for several requests with the same destination", function (done) {
                var dataContainer = {};

                /**
                 * @type {utils.Store}
                 */
                var store = new Store(dataContainer, fetchFuncFallback);

                var transform1 = jasmine.createSpy();
                var transform2 = jasmine.createSpy();

                /**
                 * @type {utils.Store.requestDescriptor[]}
                 */
                var batch = [
                    {url: "url1", destination: ["path1"], transformFunc: transform1},
                    {url: "url2", destination: ["path1"], transformFunc: transform2}
                ];

                var doneCallback = function () {
                    expect(transform1).toHaveBeenCalled();
                    expect(transform2).not.toHaveBeenCalled();
                    done();
                };

                store.loadBatch(batch, doneCallback);
            });
        });

        describe("single request error callback", function () {
            it("should call each request error callback for different paths - before the doneCallback", function (done) {
                var dataContainer = {};

                /**
                 * @type {utils.Store}
                 */
                var store = new Store(dataContainer, fetchFuncError);

                var called = [];
                var check = function () {
                    if (called.length === 3) {
                        expect(called[2]).toEqual("doneCallback");
                        expect(_.initial(called)).toContain("callback1");
                        expect(_.initial(called)).toContain("callback2");
                        done();
                    }
                };
                var callback1 = function () {
                    called.push("callback1");
                    check();
                };
                var callback2 = function () {
                    called.push("callback2");
                    check();
                };
                /**
                 * @type {utils.Store.requestDescriptor[]}
                 */
                var batch = [
                    {url: "url1", destination: ["path1"], error: callback1},
                    {url: "url2", destination: ["path2"], error: callback2}
                ];

                var doneCallback = function () {
                    called.push("doneCallback");
                    check();
                };

                store.loadBatch(batch, doneCallback);
            });
            it("should call each request error callback for same paths - before the doneCallback", function (done) {
                var dataContainer = {};

                /**
                 * @type {utils.Store}
                 */
                var store = new Store(dataContainer, fetchFuncError);

                var called = [];
                var check = function () {
                    if (called.length === 3) {
                        expect(called[2]).toEqual("doneCallback");
                        expect(_.initial(called)).toContain("callback1");
                        expect(_.initial(called)).toContain("callback2");
                        done();
                    }
                };
                var callback1 = function () {
                    called.push("callback1");
                    check();
                };
                var callback2 = function () {
                    called.push("callback2");
                    check();
                };
                /**
                 * @type {utils.Store.requestDescriptor[]}
                 */
                var batch = [
                    {url: "url1", destination: ["path1"], error: callback1},
                    {url: "url2", destination: ["path1"], error: callback2}
                ];

                var doneCallback = function () {
                    called.push("doneCallback");
                    check();
                };

                store.loadBatch(batch, doneCallback);
            });
        });

    });

});
